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

          const funcArray = [];
          updatesToDo.forEach(function(date) {
            const url = config.cdnRoot + '/AH-Data-' + date + '.csv';
            funcArray.push(function(_callback) {
              module.exports.updateSingle(url, _callback);
            });
          });

          // download all files with async
          async.parallelLimit(funcArray, 2, function(errors, results) {
            if (errors) {
              return reject(errors);
            } else {
              var insertedRows = results.reduce(function(prev, current) {
                return prev + current;
              }, 0);
              return resolve(insertedRows); // omit the result array
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

      knex.batchInsert('sales', sales, 8000).asCallback(function(err, res) {

        if(err) {
          return callback(err);
        }

        logger.info(`finished inserting for ${url}`, moment().format());

        let rowsInserted = res.reduce(function(prev, current) {
          return prev + current.rowCount;
        }, 0);
        return callback(err, rowsInserted);
      });

    });

  }

};
