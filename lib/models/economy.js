'use strict';

/**
 * @file Exports the economy class. It provides functionalities to calculate various metrics around the economy of HEX.
 */

const knex = require('../db');
const moment = require('moment');

class Economy {

    /**
     * @function Builds a history for the economy as a whole
     * @param {Object} timeframe - Timeframe
     * @return {Array} - An array with summary data for each day and currency
     */
    static * getHistory(timeframe) {

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
            'SELECT date as d, currency as c, quantity as q, total as t',
            'FROM daily_stats',
            'WHERE date >= ? AND date <= ?',
            'ORDER BY date ASC'
        ].join(' ');

        const params = [
            timeframe.start,
            timeframe.end
        ];

        let result = (yield knex.raw(query, params)).rows;

        // split by currency
        result = {
            platinum: result.filter(function(e) {
                return e.c === 'Platinum';
            }),
            gold: result.filter(function(e) {
                return e.c === 'Gold';
            })
        };

        return result;

    }


    /**
     * @function Finds all articles that were sold the most in the last @days days, an avg value and the total currency spent
     * @param {String} start - String representation of date from where to start aggregating
     * @param {String} end - String representation of date when the aggregation shoud stop
     * @param {Int} limit - Number of records to return
     * @return {Object} - An object with two arrays (for platinum and gold) as properties
     */
    static * getMostSoldArticles(_start, _end, _limit) {

        const limit = parseInt(_limit);
        _start = moment(new Date(_start));
        _end = moment(new Date(_end));

        if (typeof _limit !== 'number') {
            const err = new Error(`Paramter 'limit' must be an integer`);
            err.status = 400;
            throw err;
        }

        if (!_start.isValid() || !_end.isValid()) {
            const err = new Error(`Parameter 'start' and 'end' must be a valid date`);
            err.status = 400;
            throw err;
        }

        const start = _start.format('YYYY-MM-DD');
        const end = _end.format('YYYY-MM-DD');

        // limit maximum timespan to 30 days to reduce some potential load
        if (_end.diff(_start, 'days') > 31) {
            const err = new Error(`The specified timespan cannot be longer than 30 days`);
            err.status = 422;
            throw err;
        };

        let result = {};

        const currencies = ['Platinum', 'Gold'];

        for (let i = 0; i < currencies.length; i++) {

            let currency = currencies[i];

            const query = [
                'SELECT name, sum(quantity)::int as quantity, sum(total)::int as total, (sum(total)/sum(quantity))::int as avg',
                'FROM daily_sales',
                'WHERE date >= ? and date <= ? and currency = ?',
                'GROUP BY name',
                'ORDER BY quantity DESC',
                'LIMIT ?'
            ].join(' ');

            const params = [
                start,
                end,
                currency,
                limit
            ];

            result[currency.toLowerCase()] = (yield knex.raw(query, params)).rows;

        }

        return result;

    }

}

module.exports = Economy;
