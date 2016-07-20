'use strict';

/**
 * @file Exports the stats class. It contains various functions that don't really fit the other classes/modules.
 */

const knex = require('../db');
const moment = require('moment');

class Stats {

  /**
   * @function Builds a list of prices for a given timespans for each article
   * It is basically a summary for all articles instead of just one in one go
   * @param {Object} timeframe - Timeframe
   * @return {Array} - An array with summary data for each article and currency
   */
  static * getPricelist(timeframe) {

    // validate timeframe
    // prep error object
    const err = new Error('`timeframe` needs to be an object with valid date strings `start` and `end`');
    err.status = 400;

    timeframe = timeframe || {};
    timeframe.start = timeframe.start || moment().subtract(3, 'months').format('YYYY-MM-DD');
    timeframe.end = timeframe.end || moment().format('YYYY-MM-DD');

    const _start = moment(new Date(timeframe.start)); // wrap with `new Date()`, so moment.js shuts up
    const _end = moment(new Date(timeframe.end));

    if (!_start.isValid() ||  !_end.isValid()) {
      throw err;
    }

    timeframe.start = _start.format('YYYY-MM-DD');
    timeframe.end = _end.format('YYYY-MM-DD');

    // run query
    const query = [
      'SELECT daily_sales.name, daily_sales.currency, SUM(total)::int as t, SUM(quantity)::int as q, MIN(min)::int AS mi, MAX(max)::int AS ma, (SUM(total)/SUM(quantity))::int AS a',
      'FROM daily_sales',
      'WHERE date >= ? AND date <= ?',
      'GROUP BY daily_sales.name, daily_sales.currency',
      'ORDER BY daily_sales.name, daily_sales.currency'
    ].join(' ');

    const params = [
      timeframe.start,
      timeframe.end
    ];

    let result = (yield knex.raw(query, params)).rows;

    return result;

  }

}

module.exports = Stats;
