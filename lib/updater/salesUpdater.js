'use strict';

const Promise = require('bluebird');
const request = require('request');
const moment = require('moment');
const async = require('async');
const _ = require('underscore');
const config = require('../../config');
const utils = require('../utils/utils');
const dbm = require('./dbmanager');
const knex = require('../db');
const logger = require('../logger');
const gauss = require('gauss');
const dbmanager = require('./dbmanager');

module.exports = {

    /**
     * @function Starts the whole process of inserting new sales
     */
    start: function() {

        return new Promise(function(resolve, reject) {

            // find dates to updates for
            let updatesAvailable = [];
            let articleHashMap = [];
            dbm.getUpdatesAvailable(config.cndIndex)
                .then(function(_updatesAvailable) {
                    updatesAvailable = _updatesAvailable;
                    return dbmanager.getArticleHashMap();
                })
                .then(function(_hashMap) {
                    articleHashMap = _hashMap;
                    return dbm.getUpdatesDone();
                })
                .then(function(updatesDone) {

                    // find which updates we havent run yet
                    const updatesToDo = updatesAvailable.filter(function(i) {
                        return updatesDone.indexOf(i) === -1;
                    }).reverse();

                    const funcArray = [];
                    updatesToDo.forEach(function(date) {
                        funcArray.push(function(_callback) {
                            module.exports.startSingle(date, articleHashMap, _callback);
                        });
                    });

                    // download all files with async
                    async.parallelLimit(funcArray, 4, function(errors, results) {
                        if (errors) {
                            return reject(errors);
                        } else {
                            // reduce array `results` to one total number of inserted rows
                            let totalRowsInserted = 0;
                            results.forEach(function(r) {
                                totalRowsInserted += r;
                            });
                            return resolve(totalRowsInserted);
                        }
                    }); // async

                })
                .catch(function(error) {
                    return reject(error);
                });

        }); // promise

    },

    /**
     * @function Starts inserting new sales for one specific date
     * @param {String} date - Date to insert sales for
     * @param {Object} articleHashMap - A hashmap mapping internal article names to their actual article data (eg. 'Argus Herald of Doom' => {name, rarity, ...})
     */
    startSingle: function(date, articleHashMap, callback) {

        const url = config.cdnRoot + '/AH-Data-' + date + '.csv';

        request.get(url, function(error, response, body) {

            // request failed
            if (error) {
                return callback(error);
            }

            if (response.statusCode !== 200) {
                error = new Error(`error loading sales file (${response.statusCode}) (${url})`);
                return callback(error);
            }

            // request succeeded, parse body => sales for that body
            const sales = utils.parseSales(body, articleHashMap);

            if (sales.length === 0) {
                return callback(null, 0);
            }

            logger.info(`started inserting sales for ${date}`);

            let totalRowsInserted = 0;

            knex.transaction(function(trx) {

                knex.batchInsert('sales', sales, 5000).transacting(trx)
                    .then(function(res) {

                        const rowsInserted = res.reduce(function(prev, current) {
                            return prev + current.rowCount;
                        }, 0);
                        totalRowsInserted += rowsInserted;
                        logger.info(`Successfully inserted ${rowsInserted} rows into sales for ${date}`);
                        return;
                    })
                    // daily_sales
                    .then(function() {

                        const query = [
                            'SELECT name, uuid, aa, set, rarity, type, currency, date, sum(price)::int as total, sum(1)::int as quantity, min(price)::int as min, max(price)::int as max, avg(price)::int as average, median(price)::int as median',
                            'FROM sales',
                            'WHERE date = ?',
                            'GROUP BY name, uuid, aa, set, rarity, type, currency, date'
                        ].join(' ');

                        const params = [date];

                        return knex.raw(query, params).transacting(trx)

                    })
                    .then(function(res) {
                        return knex.batchInsert('daily_sales', res.rows, 5000).transacting(trx);
                    })
                    .then(function(res) {
                        const rowsInserted = res.reduce(function(prev, current) {
                            return prev + current.rowCount;
                        }, 0);
                        totalRowsInserted += rowsInserted;
                        logger.info(`Successfully inserted ${rowsInserted} rows into daily_sales for ${date}`);
                        return;
                    })
                    // daily_stats
                    .then(function() {

                        const query = [
                            'SELECT date, currency, sum(price)::int as total, sum(1)::int as quantity',
                            'FROM sales',
                            'WHERE date = ?',
                            'GROUP BY date, currency'
                        ].join(' ');

                        const params = [date];

                        return knex.raw(query, params).transacting(trx);

                    })
                    .then(function(res) {
                        return knex.batchInsert('daily_stats', res.rows, 2000);
                    })
                    .then(function(res) {
                        const rowsInserted = res.reduce(function(prev, current) {
                            return prev + current.rowCount;
                        }, 0);
                        totalRowsInserted += rowsInserted;
                        logger.info(`Successfully inserted ${rowsInserted} rows into daily_stats for ${date}`);
                        return;
                    })
                    .then(trx.commit)
                    .catch(trx.rollback);

            })
            .then(function() {
                logger.info(`Finished inserting for ${date}`);
                return callback(null, totalRowsInserted);
            })
            .catch(callback);

        });

    }

};


/**
 * @function Inserts @sales into table `sales`
 * @param {Array} sales - Array of sale objects from utils#parseSales
 * @param {Object} trx - Transaction object to insert with
 */
function insertSales(sales, trx) {

    return new Promise(function(resolve, reject) {

        trx.batchInsert('sales', sales, 2000)
            .then(function(res) {
                const totalRowCountInserted = res.reduce(function(prev, current) {
                    return prev + current.rowCount;
                }, 0);
                return resolve(totalRowCountInserted);
            })
            .catch(reject);

    });

}

/**
 * @function Queries the table `sales` for aggregated data per article for date specified by @date and inserts that resulting data into `daily_sales`
 * @param {String} date - The date to aggregate data for
 * @param {Object} trx - Transaction object to insert with
 */
function insertDailySales(date, trx) {

    return new Promise(function(resolve, reject) {

        const query = [
            'SELECT name, uuid, aa, set, rarity, type, currency, date, sum(price)::int as total, sum(1)::int as quantity, min(price)::int as min, max(price)::int as max, avg(price)::int as average, median(price)::int as median',
            'FROM sales',
            'WHERE date = ?',
            'GROUP BY name, uuid, aa, set, rarity, type, currency, date'
        ].join(' ');

        const params = [date];

        // use knex to query because i don't know if it clutters the transaction
        knex.raw(query, params)
            .then(function(res) {
                return knex.batchInsert('daily_sales', res.rows, 5000).transacting(trx);
            })
            .then(function(res) {
                const rowsInserted = res.reduce(function(prev, current) {
                    return prev + current.rowCount;
                }, 0);
                logger.info(`Successfully inserted ${rowsInserted} rows into daily_sales for ${date}`);
                return resolve(rowsInserted);
            })
            .catch(reject);

    });

}


/**
 * @function Queries the table `sales` for aggregated data date specified by @date and inserts that resulting data into `daily_stats`
 * @param {String} date - The date to aggregate data for
 * @param {Object} trx - Transaction object to insert with
 */
function insertDailyStats(date, cb) {

    const query = [
        'SELECT date, currency, sum(price)::int as total, sum(1)::int as quantity',
        'FROM sales',
        'WHERE date = ?',
        'GROUP BY date, currency'
    ].join(' ');

    const params = [date];

    knex.raw(query, params)
        .then(function(res) {
            return knex.batchInsert('daily_stats', res.rows, 2000);
        })
        .then(function(res) {
            const rowsInserted = res.reduce(function(prev, current) {
                return prev + current.rowCount;
            }, 0);
            logger.info(`Successfully inserted ${rowsInserted} rows into daily_stats for ${date}`);
            return cb(null, rowsInserted);
        })
        .catch(cb);

}
