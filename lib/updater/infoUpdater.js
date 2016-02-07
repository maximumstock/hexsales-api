'use strict';

var request = require('request');
var dbm = require('./dbmanager');
var knex = require('../db');
var async = require('async');
var config = require('../../config');
var setfilter = require('../utils/filter/setfilter');
var Promise = require('bluebird');

module.exports = {

    // do @update for all cards
    update: function() {

        return new Promise(function(resolve, reject) {

            var names = [];
            // find all card names
            dbm.objectNames()
                .then(function(_names) {
                    names = _names;
                    // find everything that need updates
                    // subselect to accelerate WHERE clauses
                    var query = [
                        'select representation, rarity, aa, ea, type from sales',
                        'where type != \'Booster\' and (set is null or rarity = \'0\' or name is null or shard is null)',
                        'group by representation, rarity, aa, ea, type'
                    ].join(' ');

                    return knex.raw(query);
                })
                .then(function(a) {

                    // update for all of these
                    var funcArray = [];
                    a.rows.forEach(function(i) {
                        funcArray.push(function(_callback) {
                            module.exports.updateSingle(i, names, _callback);
                        });
                    });

                    async.series(funcArray, function(errors, results) {
                        if (errors) {
                            return reject(errors);
                        } else {
                            return resolve(null);
                        }
                    });

                })
                .catch(function(error) {
                    return reject(error);
                });

        }); // promise

    },

    /**
     * @function Updates details for a single object
     * @param {object} obj An object with `representation`, `type`, `rarity`, `aa` and `ea`
     * @param {array} names An array of names we have infos for (aka found in hexdbapi)
     */
    updateSingle: function(obj, names, callback) {

        // check actual name for this object
        var actualName = null;
        names.forEach(function(n) {
            if (n.split(',').join('') === obj.representation) {
                actualName = n; // found actual name
            }
        });

        // were we successful? if not cancel this
        if (actualName === null) {
            console.error('%s was not found in hexdatabaseapi', obj.representation);
            return callback(null, null);
        }

        var url = config.apiURL + '?name=' + encodeURIComponent(actualName);
        if (obj.type === 'Card' && obj.rarity !== 0) {
            // we have to do this since equipment/boosters dont have rarities as of now
            url += '&rarity=' + encodeURIComponent(obj.rarity);
        }

        request.get(url, function(error, response, body) {

            if (error) {
                return callback(error);
            }

            if (response.statusCode !== 200) {
                error = new Error('error connecting to hexdatabaseapi (%s) ', response.statusCode);
                return callback(error);
            }

            // check how much data we got
            var data = JSON.parse(body).data;
            if (data.length !== 1) {
                console.error('We found more/less data than we wanted for', obj.representation, url, body);
                return callback(null, null);
            }

            // we gucci, now gather information from the result document
            var tmp = data[0];

            // now that we have the actual name, add AA/EA/EAA so we have a distinct card
            if (obj.aa && obj.ea) {
                tmp.name = tmp.name + ' EAA';
            } else if (obj.aa && !obj.ea) {
                tmp.name = tmp.name + ' AA';
            } else if (obj.ea && !obj.aa) {
                tmp.name = tmp.name + ' EA';
            }

            knex('daily_sales')
                .where('representation', obj.representation)
                .andWhere('aa', obj.aa)
                .andWhere('ea', obj.ea)
                .update({
                    shard: tmp.color,
                    set: setfilter(tmp.set_id),
                    name: tmp.name,
                    rarity: tmp.rarity
                })
                .asCallback(function(err, result) {
                    return callback(err, null);
                });

        });

    }

};
