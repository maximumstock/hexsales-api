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
const dbmanager = require('./dbmanager');

module.exports = {

	/**
	 * @function Starts the whole process of inserting new sales
	 */
	start: function() {

		return new Promise(function(resolve, reject) {

			// find dates to updates for
			let articleHashMap = [];

			dbm.clearDatabaseForLastDay()
				.then(() => {
					return dbm.getArticleHashMap();
				})
				.then(function(_hashMap) {
					articleHashMap = _hashMap;
					return module.exports.findDatesToUpdateFor();
				})
				.then(function(updatesToDo) {

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

	findDatesToUpdateFor: function() {
		return new Promise(function(resolve, reject) {

      let updatesDone, updatesAvailable;

			dbm.getUpdatesDone()
				.then((_updatesDone) => {
					updatesDone = _updatesDone;

					const today = moment();
					const firstUpdate = moment(config.startDate);
					const differenceInDays = today.diff(firstUpdate, 'days');
					const updatesToDo = [];

					for (let i = 0; i < differenceInDays; i++) {
            let it = firstUpdate.add(1, 'days').format('YYYY-MM-DD')
            if(updatesDone.indexOf(it) === -1) {
              updatesToDo.push(it)
            }
					}

					return resolve(updatesToDo)
				})
        .catch(reject);

		}); // promise
	},

	/**
	 * @function Starts inserting new sales for one specific date
	 * @param {String} date - Date to insert sales for
	 * @param {Object} articleHashMap - A hashmap mapping artilce UUIDs to their actual article data (<UUID> => {name, rarity, ...})
	 */
	startSingle: function(date, articleHashMap, callback) {

		dbmanager.getSalesForDay(date)
			.then((rawSales) => {

				logger.info(`started loading sales for ${date}`);

				// request succeeded, parse body => sales for that body
				const sales = utils.parseSales(rawSales, articleHashMap);

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
