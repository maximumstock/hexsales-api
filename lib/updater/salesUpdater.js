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

const rarityfilter = require('../utils/filter/rarityfilter');

module.exports = {

  /**
   * @function Starts the whole process of inserting new sales
   */
  update: function() {

    return new Promise(function(resolve, reject) {

      // find dates to updates for
      let updatesAvailable = [];
      dbm.getUpdatesAvailable(config.cndIndex)
        .then(function(_updatesAvailable) {
          updatesAvailable = _updatesAvailable;
          return dbm.getUpdatesDone();
        })
        .then(function(updatesDone) {

          let updatesToDo = [];
          // find which updates we havent run yet
          updatesToDo = updatesAvailable.filter(function(i) {
            return updatesDone.indexOf(i) === -1;
          });

          if(updatesToDo.length <= 1) {
            return resolve(false);
          }

          const funcArray = [];
          updatesToDo.forEach(function(date) {
            const url = config.cdnRoot + '/AH-Data-' + date + '.csv';
            funcArray.push(function(_callback) {
              module.exports.updateSingle(url, _callback);
            });
          });

          // download all files with async
          async.series(funcArray, function(errors, results) {
            if (errors) {
              return reject(errors);
            } else {
              return resolve(true); // omit the result array
            }
          }); // async

        })
        .catch(function(error) {
          return reject(error);
        });

    }); // promise

  },

  /**
   * @function Starts inserting new sales for `url`
   * @param {String} url - URL to insert sales from
   */
  updateSingle: function(url, callback) {

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
      const sales = utils.parseSales(body);
      const salesFuncArray = []; // function array to pass into async to insert all sales

      // split array of sales into chunks so it can be parallelized
      const chunks = [], chunkSize = 400;
      for(let i = 0; i < sales.length; i+=chunkSize) {
        chunks.push(sales.slice(i, i+chunkSize));
      }

      chunks.forEach(function(c) {
        salesFuncArray.push(function(cb) {
          knex('sales').insert(c).asCallback(cb);
        });
      });

      // run insertion in parallel
      async.parallelLimit(salesFuncArray, 2, function(err, res) {
        logger.info(`finished updating for ${url}`, moment().format());
        return callback(err, []);
      });

    });

  }

};
