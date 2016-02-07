'use strict';

/**
 * @file Collection of some helper functions to do the update process
 */

const Promise = require('bluebird');
const moment = require('moment');
const request = require('request');
const config = require('../../config');
const _ = require('lodash');
const knex = require('../db');

module.exports = {

    updatesDone: function() {

        return new Promise(function(resolve, reject) {

            knex('sales')
                .select('date')
                .orderBy('date')
                .groupBy('date')
                .then(function(dates) {
                    const ret = [];
                    dates.forEach(function(i) {
                        ret.push(moment(i.date).format('YYYY-MM-DD'));
                    });
                    return resolve(ret);
                })
                .catch(function(error) {
                    return reject(error);
                });

        });

    },

    // returns an array of dates there are updates for
    // @url - url to check
    updatesAvailable: function(url) {

        return new Promise(function(resolve, reject) {

            url = url || config.cdnIndex;

            console.log('searching for new sales');

            request.get(url, function(error, response, body) {

                if (error) {
                    return reject(error);
                }
                if (response.statusCode !== 200) {
                    error = new Error('error loading HexEnt index file (%s)' + response.statusCode);
                    return reject(error);
                }

                let newDates = [];
                body = body.split('\n'); // each line

                // start out at 1 so we skip the first entry of the index file, which is useless (...-2014-12-23.csv)
                // also skip the last one since it is an empty new line
                for (let i = 1; i < body.length - 1; i++) {
                    // split out date for every update file
                    const row = body[i];
                    let date = row.split('.')[0].slice(8);

                    date = moment(new Date(date));
                    if (date.isValid()) {
                        newDates.push(date.format('YYYY-MM-DD'));
                    }
                }

                // only get unique ones
                newDates = _.unique(newDates);

                return resolve(newDates);

            }); // request

        }); // promise

    },

    /**
     * @function Refreshed all relevant materialized views in the database
     */
    refreshViews: function() {

        return new Promise(function(resolve, reject) {

            const queries = [
                // 'REFRESH MATERIALIZED VIEW daily_last_month;',
                // 'REFRESH MATERIALIZED VIEW weekly_last_3_months;',
                // 'REFRESH MATERIALIZED VIEW monthly_last_6_months;'
            ].join('\n');

            knex
                .raw(queries)
                .then(resolve)
                .catch(reject);

        });

    },

    /**
     * @function Returns an array of all object names from hexdatabaseapi
     */
    objectNames: function() {
        return new Promise(function(resolve, reject) {

            const url = config.apiURL;
            request.post(url, function(error, response, body) {

                if (error) {
                    return reject(error);
                }

                if (response.statusCode !== 200) {
                    const err = new Error(`error downloading data from hexdatabaseapi ${response.statusCode}`);
                    return reject(err);
                }

                // success
                body = JSON.parse(body);
                // gather all names
                const names = [];
                body.forEach(function(i) {
                    names.push(i.name);
                });
                // gucci
                return resolve(names);

            });

        });
    }
};
