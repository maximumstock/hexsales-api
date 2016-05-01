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

module.exports = {

  /**
   * @function Starts the whole process of inserting new sales
   */
  start: function() {

    return new Promise(function(resolve, reject) {

      // find dates to updates for
      let updatesAvailable = [];
      dbm.getUpdatesAvailable(config.cndIndex)
        .then(function(_updatesAvailable) {
          updatesAvailable = _updatesAvailable;
          return dbm.getUpdatesDone();
        })
        .then(function(updatesDone) {

          // find which updates we havent run yet
          const updatesToDo = updatesAvailable.filter(function(i) {
            return updatesDone.indexOf(i) === -1;
          });

          if(updatesToDo.length === 0) {
            return resolve(false);
          }

          const funcArray = [];
          updatesToDo.forEach(function(date) {
            funcArray.push(function(_callback) {
              module.exports.startSingle(date, _callback);
            });
          });

          // download all files with async
          async.parallelLimit(funcArray, 2, function(errors, results) {
            if (errors) {
              return reject(errors);
            } else {
              return resolve(true);
            }
          }); // async

        })
        .catch(function(error) {
          return reject(error);
        });

    }); // promise

  },

  /**
   * @function Starts inserting new sales for `date`
   * @param {String} date - Date to insert sales for
   */
  startSingle: function(date, callback) {

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
      const sales = utils.parseSales(body);

      if(sales.length === 0) {
        return callback(null, 0);
      }

      logger.info(`starting insertion for ${date}`);

      // now that we have the data, invoke helper insert functions
      const todo = [insertSales, insertDailySales, insertDailyStats];
      async.parallel(todo.map(function(f) {return function(_cb) {
        f(sales, _cb);
      }}), callback);

    });

  }

};

// helper function to insert sales into table `sales`
function insertSales(sales, cb) {

  knex.batchInsert('sales', sales, 2000).asCallback(function(err, res) {
    if(err) {return cb(err);}
    return cb(null, res.rowCount);
  });

}

// helper function to insert sales into table `daily_sales`
function insertDailySales(sales, cb) {

  let dailySales = [];

  let total = 0, quantity = 0;
  let set = new gauss.Vector();

  let oldSale = null;

  // the following loop aggregates the data per day, per article
  for(let i = 0; i < sales.length; i++) {

    let s = sales[i];

    // once we hit a new group of sales (except when it is the first loop cycle), push new aggragated data and flush all temporary variables
    if(oldSale !== null && (s.date !== oldSale.date || s.currency !== oldSale.currency || s.name !== oldSale.name || s.rarity !== oldSale.rarity)) {

      let ns = {
        total: total,
        quantity: quantity,
        min: set.min(),
        max: set.max(),
        average: parseInt(set.mean()),
        median: parseInt(set.median()),
        name: s.name,
        internal: s.internal,
        currency: s.currency,
        date: s.date,
        rarity: s.rarity,
        type: s.type
      };

      dailySales.push(ns);

      // reset temporary variables
      total = 0;
      quantity = 0;
      set = new gauss.Vector();
    }

    // adjust aggregate data
    total += s.price;
    quantity++;
    set.push(s.price);

    // update last loop element
    oldSale = s;

  };

  // insert daily sales
  knex.batchInsert('daily_sales', dailySales, 2000).asCallback(function(err, res) {
    if(err) {return cb(err);}
    return cb(null, res.rowCount);
  });

}

// helper function to insert sales into `daily_stats`
function insertDailyStats(sales, cb) {

  let dailyStats = [];
  let platSales = new gauss.Vector(), goldSales = new gauss.Vector();

  sales.forEach(function(s) {
    if(s.currency.toLowerCase() === 'platinum') {
      platSales.push(s.price);
    } else {
      goldSales.push(s.price);
    }
  });

  dailyStats.push({
    date: sales[0].date,
    currency: 'Platinum',
    total: platSales.sum(),
    quantity: platSales.toArray().length
  });
  dailyStats.push({
    date: sales[0].date,
    currency: 'Gold',
    total: goldSales.sum(),
    quantity: goldSales.toArray().length
  });

  knex('daily_stats').insert(dailyStats).asCallback(function(err, res) {
    if(err) {return cb(err);}
    return cb(null, res.rowCount);
  });

}
