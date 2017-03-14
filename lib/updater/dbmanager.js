'use strict';

/**
 * @file Collection of some helper functions to do the update process
 */

const moment = require('moment');
const request = require('request');
const config = require('../../config');
const _ = require('lodash');
const knex = require('../db');
const logger = require('../logger');

module.exports = {

	/**
	 * @function Checks the database for which days there are already sales for in the `sales` table
	 * @return {Array} - Ascendingly ordered list of 'YYYY-MM-DD' formatted date strings
	 */
	getUpdatesDone: function() {

		return new Promise(function(resolve, reject) {

			knex('sales')
				.select('date')
				.groupBy('date')
				.orderBy('date')
				.then(function(rows) {
					const dates = rows.filter(function(r) {
						return moment(r.date).isValid();
					}).map(function(r) {
						return moment(r.date).format('YYYY-MM-DD')
					});
					return resolve(dates);
				})
				.catch(reject);

		});

	},

	getSalesForDay: function(date) {
		return new Promise((resolve, reject) => {

			const query = [
				'select *'
			].join(' ');

			// const query = [
			// 	'select distinct on (b.auction_id) b.plat_buyout, b.plat_bid, b.gold_buyout, b.gold_bid, b.item, a.created_at',
			// 	'from auctions a, auctions b ',
			// 	'where a.action = \'sold\' and date_trunc(\'day\', a.created_at) = ? and a.auction_id = b.auction_id and b.action in (\'buyout\', \'bid\')',
			// 	'order by b.auction_id, a.created_at desc;'
			// ].join(' ');
			//
			// const params = [moment(date).format('YYYY-MM-DD')];
			//
			// knex.raw(query, params)
			// 	.then((res) => {
			//
			// 		const sales = res.rows.map((sale) => {
			// 			return {
			// 				uuid: sale.item,
			// 				date: sale.created_at,
			// 				price: sale.plat_bid || sale.plat_buyout ||  sale.gold_bid || sale.gold_buyout,
			// 				currency: (sale.plat_bid || sale.plat_buyout) ? 'Platinum' : 'Gold'
			// 			}
			// 		})
			//
			// 		resolve(sales);
			//
			// 	})
			// 	.catch(reject);

		});
	},

	clearDatabaseForLastDay: function() {

		logger.info(`cleaning DB from latest day`);

		const query = [
			'DELETE FROM sales WHERE date = (SELECT max(date) from sales);',
			'DELETE FROM daily_sales WHERE date = (SELECT max(date) from daily_sales);',
			'DELETE FROM daily_stats WHERE date = (SELECT max(date) from daily_stats);'
		].join(' ');

		return knex.raw(query);
	},


	// /**
	//  * @function Checks which dates there are sales files for by loading the content of the specified URL
	//  * @param {String} url - The URL to parse from
	//  * @return {Array} - Ascendingly ordered array of 'YYYY-MM-DD' formatted date strings
	//  */
	// getUpdatesAvailable: function(url) {
	//
	//     return new Promise(function(resolve, reject) {
	//
	//         request.get(url, function(error, response, body) {
	//
	//             if (error) {
	//                 return reject(error);
	//             }
	//             if (response.statusCode !== 200) {
	//                 error = new Error('error loading HexEnt index file (%s)' + response.statusCode);
	//                 return reject(error);
	//             }
	//
	//             let newDates = [];
	//             const rows = body.split('\n'); // each line
	//
	//             for (let i = 0; i < rows.length; i++) {
	//                 // split out date for every update file
	//                 const row = rows[i];
	//                 let date = moment(new Date(row.split('.')[0].slice(8)));
	//
	//                 // skip all dates that are previous to the starting date in the configuration
	//                 if(config.startDate && date.format('YYYY-MM-DD') < config.startDate) {
	//                     continue;
	//                 }
	//
	//                 if (date.isValid() && newDates.indexOf(date.format('YYYY-MM-DD')) === -1) {
	//                     newDates.push(date.format('YYYY-MM-DD'));
	//                 }
	//             }
	//
	//             return resolve(newDates);
	//
	//         }); // request
	//
	//     }); // promise
	//
	// },


	/**
	 * @function Refreshes all relevant materialized views in the database
	 */
	refreshViews: function() {

		return new Promise(function(resolve, reject) {

			const queries = [
				'REFRESH MATERIALIZED VIEW distinct_articles;',
				'REFRESH MATERIALIZED VIEW distinct_sets;'
			].join('\n');

			knex
				.raw(queries)
				.then(resolve)
				.catch(reject);

		});

	},

	/**
	 * @function Returns a hashmap of all articles, mapping UUIDs to their article data from hex-database-api
	 */
	getArticleHashMap: function() {
		return new Promise(function(resolve, reject) {

			// fiddle with request headers
			const options = {
				headers: {
					accept: 'application/json'
				},
				uri: config.apiUrl,
				method: 'POST'
			};

			request(options, function(error, response, body) {

				if (error) {
					return reject(error);
				}

				if (response.statusCode !== 200) {
					const err = new Error(`error downloading data from hexdatabaseapi ${response.statusCode}`);
					return reject(err);
				}

				const articleData = JSON.parse(body);

				// build a hashmap to we have constant time access
				let articleHashMap = {};
				const articlesWithoutAnUUID = [];
				articleData.forEach(function(a) {
					// skip all articles with an UUID
					if (!a.uuid) {
						articlesWithoutAnUUID.push(a.name);
						return;
					}
					articleHashMap[a.uuid] = a;
				});

				if (articlesWithoutAnUUID.length > 0) {
					logger.info(`Articles from hex-database-api that do not have an UUID: ${articlesWithoutAnUUID}`);
				}

				return resolve(articleHashMap);

			});

		});
	}
};
