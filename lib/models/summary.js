'use strict';

/**
 * @file Exports the sumary class. It mainly provides functionalities to obtain summarizing data on some part of the economy.
 */

const knex = require('../db');
const moment = require('moment');
const _ = require('underscore');

class Summary {

    /**
     * @function Builds a summary for all rows in `daily_sales` meeting the parameters @params
     * @param {Object} params - A parameter object
     * @return {Object} - An object with summaries for each currency
     */
    static * get(params) {

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
            'SELECT currency as currency, sum(total)::int as total, sum(quantity)::int as quantity, (sum(total)/sum(quantity))::int as average, min(min)::int as minimum, max(max)::int as maximum',
            'FROM daily_sales',
            'WHERE date >= ? and date <= ?',
            'AND name LIKE ?',
            'AND uuid LIKE ?',
            'AND rarity LIKE ?',
            'AND set LIKE ?',
            'AND type LIKE ?',
            'AND currency LIKE ?',
            'GROUP BY currency'
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
        const result = (yield knex.raw(query, queryParams)).rows;

        return result;


    }


    /**
     * @function Returns a summary (like #get), but for a specific article, including median values, aggregating data from the `sales` table
     * @param {String} name - The uuid of the article to get a summary for
     * @param {Object} params - A parameter object
     * @return {Array} - An array of all relevant rows
     */
    static * getForArticle(uuid, params) {

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
            'SELECT currency as currency, sum(price) as total, count(1) as quantity, min(price)::int as minimum, max(price)::int as maximum, avg(price)::int as average, median(price)::int as median',
            'FROM sales',
            'WHERE date >= ? and date <= ?',
            'AND uuid = ?',
            'GROUP BY currency'
        ].join(' ');

        const queryParams = [
            params.start,
            params.end,
            uuid,
        ];

        // run query
        const result = (yield knex.raw(query, queryParams)).rows;

        return result;

    }

}

module.exports = Summary;
