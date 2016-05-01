'use strict';

/**
 * @file Collection of some helper functions to do the update process
 */

const moment = require('moment');
const request = require('request');
const config = require('../../config');
const _ = require('lodash');
const knex = require('../db');

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

  /**
   * @function Checks which dates there are sales files for by loading the content of the specified URL
   * @param {String} url - The URL to parse from
   * @return {Array} - Ascendingly ordered array of 'YYYY-MM-DD' formatted date strings
   */
  getUpdatesAvailable: function(url) {

    return new Promise(function(resolve, reject) {

      url = url || config.cdnIndex; // fall back to the default CDN URL if there is none specified

      request.get(url, function(error, response, body) {

        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          error = new Error('error loading HexEnt index file (%s)' + response.statusCode);
          return reject(error);
        }

        let newDates = [];
        const rows = body.split('\n'); // each line

        // start out at 1 so we skip the first entry of the index file, which is a compilation of old files (...-2014-12-23.csv)
        // also skip the last one since it is an empty new line
        for (let i = 1; i < rows.length - 1; i++) {
          // split out date for every update file
          const row = rows[i];
          let date = moment(new Date(row.split('.')[0].slice(8)));
          if (date.isValid() && newDates.indexOf(date.format('YYYY-MM-DD')) === -1) {
            newDates.push(date.format('YYYY-MM-DD'));
          }
        }

        return resolve(newDates);

      }); // request

    }); // promise

  },

  /**
   * @function Refreshes all relevant materialized views in the database
   */
  refreshViews: function() {

    return new Promise(function(resolve, reject) {

      const queries = [
        // 'REFRESH MATERIALIZED VIEW CONCURRENTLY distinct_articles;',
        // 'REFRESH MATERIALIZED VIEW CONCURRENTLY daily_article_sales;',
        // 'REFRESH MATERIALIZED VIEW CONCURRENTLY economy_daily_history;'
      ].join('\n');

      knex
        .raw(queries)
        .then(resolve)
        .catch(reject);

    });

  },

  // /**
  //  * @function Returns an array of all article names from hex-database-api
  //  *
  //  */
  // objectNames: function() {
  //   return new Promise(function(resolve, reject) {
  //
  //     // fiddle with request headers
  //     const options = {
  //       headers: {
  //         accept: 'application/json'
  //       },
  //       uri: config.apiUrl,
  //       method: 'POST'
  //     };
  //
  //     request(options, function(error, response, body) {
  //
  //       if (error) {
  //         return reject(error);
  //       }
  //
  //       if (response.statusCode !== 200) {
  //         const err = new Error(`error downloading data from hexdatabaseapi ${response.statusCode}`);
  //         return reject(err);
  //       }
  //
  //       body = JSON.parse(body);
  //       // gather all names
  //       const names = body.map(function(i) {
  //         return i.name;
  //       });
  //       return resolve(names);
  //
  //     });
  //
  //   });
  // }
};
