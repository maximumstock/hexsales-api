'use strict';

var Promise = require('bluebird');
var request = require('request');
var moment = require('moment');
var async = require('async');
var config = require('../../config');
var utils = require('../utils/utils');
var dbm = require('./dbmanager');
var knex = require('../db');

var rarityfilter = require('../utils/filter/rarityfilter');

module.exports = {

    // requests general sales files for all needed dates
    update: function() {

        return new Promise(function(resolve, reject) {

            // find dates to updates for
            var updatesAvailable = [];
            dbm.updatesAvailable(config.cndIndex)
                .then(function(_updatesAvailable) {
                    updatesAvailable = _updatesAvailable;
                    return dbm.updatesDone();
                })
                .then(function(updatesDone) {

                    var updatesToDo = [];
                    // find which updates we havent run yet
                    updatesToDo = updatesAvailable.filter(function(i) {
                        return updatesDone.indexOf(i) === -1;
                    });

                    var funcArray = [];
                    updatesToDo.forEach(function(date) {
                        var url = config.cdnRoot + '/AH-Data-' + date + '.csv';
                        funcArray.push(function(_callback) {
                            module.exports.updateSingle(url, _callback);
                        });
                    });

                    // download all files with async
                    async.parallelLimit(funcArray, 2, function(errors, results) {
                        if (errors) {
                            return reject(errors);
                        } else {
                            return resolve();
                        }
                    }); // async

                })
                .catch(function(error) {
                    return reject(error);
                });

        }); // promise

    },

    // helper function to download sales file, parse content and insert the data for one url
    updateSingle: function(url, callback) {

        console.log('started inserting new sales (%s)', url);
        request.get(url, function(error, response, body) {

            // request failed
            if (error) {
                return callback(error);
            }

            if (response.statusCode !== 200) {
                error = new Error('error loading sales file (%s) (%s)', response.statusCode, url);
                return callback(error);
            }

            // request succeeded, parse body
            var sales = utils.parseSales(body);

            // use async because i can't get ON CONFLICT DO NOTHING to work with knex
            var funcArray = [];
            // split up sales to make it more scalable
            var chunkSize = 100,
                chunks = [];
            for (var i = 0; i < sales.length; i += chunkSize) {
                chunks.push(sales.slice(i, i + chunkSize));
            }
            // fill em back in
            chunks.forEach(function(c) {
                funcArray.push(function(_callback) {
                    knex.insert(c).into('sales').asCallback(function(err, result) {
                        return _callback(err, null);
                    });
                });
            });

            async.series(funcArray, function(errors, results) {
                return callback(errors, null);
            });

        });

    }

};
