'use strict';

/**
 * @file Exports the Summary class. A summary is a roundup of price data for a logic group of articles for a specific timeframe.
 */

const knex = require('../db');
const moment = require('moment');

class Summary {

  /**
   * @function Builds a summary for the given article called `name` and timeframe in `params`
   * @param {String} name - Name of the article to summarize for
   * @param {Object} timeframe - Timeframe on what to summarize on
   * @return {Object} - An object with summaries for each currency
   */
  static * buildForArticle(name, timeframe) {

    // validate name
    if(!name || typeof(name) !== 'string') {
      const err = new Error('`name` needs to be a string');
      err.status = 400;
      throw err;
    }

    // validate timeframe
    // prep error object
    const err = new Error('`timeframe` needs to be an object with valid date strings `start` and `end`');
    err.status = 400;

    timeframe = timeframe || {};
    timeframe.start = timeframe.start || moment().subtract(31, 'days').format('YYYY-MM-DD');
    timeframe.end = timeframe.end || moment().format('YYYY-MM-DD');

    const _start = moment(new Date(timeframe.start)); // wrap with `new Date()`, so moment.js shuts up
    const _end = moment(new Date(timeframe.end));

    if(!_start.isValid() || !_end.isValid()) {
      throw err;
    }

    timeframe.start = _start.format('YYYY-MM-DD');
    timeframe.end = _end.format('YYYY-MM-DD');

    // run query
    const query = [
      'SELECT currency, avg(price)::int, median(price)::int, min(price), max(price), sum(price)::int as total, sum(1)::int as quantity',
      'FROM sales',
      'WHERE name = ? AND date >= ? AND date <= ?',
      'GROUP BY currency'
    ].join(' ');

    const params = [
      name,
      timeframe.start,
      timeframe.end
    ];

    let result = (yield knex.raw(query, params)).rows;

    // split by currency
    result = {
      platinum: (result.filter(function(e) { return e.currency === 'Platinum'; }))[0],
      gold: (result.filter(function(e) { return e.currency === 'Gold'; }))[0]
    };

    return result;

  }

}

module.exports = Summary;
