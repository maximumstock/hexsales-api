'use strict';

/**
 * @file Exports the history class. It mainly provides functionalities to obtain time-series data on some part of the economy.
 */

const knex = require('../db');
const moment = require('moment');
const _ = require('underscore');

class History {

    /**
     * @function Returns all rows of the table `daily_sales` meeting the parameters in @params
     * @param {Object} params - A parameter object
     * @return {Array} - An array of all relevant rows
     */
    static * get(params, detailed = false) {

        // DEFAULTS
        // set default values for all parameters here
        params.start = params.start || moment().subtract(3, 'months').format('YYYY-MM-DD');
        params.end = params.end || moment().format('YYYY-MM-DD');

        // validate timeframe
        // prep error object
        const err = new Error('`start` and `end` need to be valid date strings');
        err.status = 400;

        const _start = moment(new Date(params.start)); // wrap with `new Date()`, so moment.js shuts up
        const _end = moment(new Date(params.end));

        if (!_start.isValid() || !_end.isValid()) {
            throw err;
        }

        const query = [
            'SELECT date as d, currency as c, sum(total)::int as t, sum(quantity)::int as q, (sum(total)/sum(quantity))::int as a, min(min)::int as mi, max(max)::int as ma',
            'FROM daily_sales',
            'WHERE date >= ? and date <= ?',
            'AND name LIKE ?',
            'AND uuid LIKE ?',
            'AND rarity LIKE ?',
            'AND set LIKE ?',
            'AND type LIKE ?',
            'AND currency LIKE ?',
            'GROUP BY date, currency',
            'ORDER BY date ASC'
        ].join(' ');

        const queryParams = [
            params.start,
            params.end,
            params.name || '%',
            params.uuid || '%',
            params.rarity || '%',
            params.set || '%',
            params.type || '%',
            params.currency || '%'
        ];

        // run query
        const result = (yield knex.raw(query, queryParams)).rows.map(function(e) {
            e.d = moment(e.d).format('YYYY-MM-DD');
            return e;
        });

        return result;

    }

    /**
     * @function Returns a history (like #get), but for a specific article, including median values, directly from `daily_sales`
     * @param {String} name - The name of the article to get a history for
     * @param {Object} params - A parameter object
     * @return {Array} - An array of all relevant rows
     */
    static * getForArticle(name, params) {

        // DEFAULTS
        // set default values for all parameters here
        params.start = params.start || moment().subtract(3, 'months').format('YYYY-MM-DD');
        params.end = params.end || moment().format('YYYY-MM-DD');

        // validate timeframe
        // prep error object
        const err = new Error('`start` and `end` need to be valid date strings');
        err.status = 400;

        const _start = moment(new Date(params.start)); // wrap with `new Date()`, so moment.js shuts up
        const _end = moment(new Date(params.end));

        if (!_start.isValid() || !_end.isValid()) {
            throw err;
        }

        const query = [
            'SELECT date as d, currency as c, total as t, quantity as q, min as mi, max as ma, average as a, median as m',
            'FROM daily_sales',
            'WHERE date >= ? and date <= ?',
            'AND name = ?',
            'ORDER BY date ASC'
        ].join(' ');

        const queryParams = [
            params.start,
            params.end,
            name,
        ];

        // run query
        const result = (yield knex.raw(query, queryParams)).rows.map(function(e) {
            e.d = moment(e.d).format('YYYY-MM-DD');
            return e;
        });

        return result;

    }

}

module.exports = History;
