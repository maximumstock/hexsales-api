'use strict';

/**
 * @file Exports the article class. An article is every kind of item that exists in the auction house (cards, equipment, sleeves, chests, etc.)
 */

const knex = require('../db');
const moment = require('moment');

class Article {

    /**
     * @function Returns all distinct articles
     * @param {Object} options - Query options such as `limit` and `offset`
     * @return {Array} - An array of all articles
     */
    static * getAll(options) {

        // validate options
        if (options.limit && parseInt(options.limit) === NaN) {
            options.limit = 25; // default limit
        }
        if (options.offset && parseInt(options.offset) === NaN) {
            options.offset = 0; // default offset
        }

        const result = yield knex('distinct_articles').limit(options.limit).offset(options.offset);

        return result;

    }


    /**
     * @function Finds all articles that meet `params` using `options`
     * @param {Object} params - Search parameters like `name`, `internal`, `rarity`
     * @param {Object} options - Query options such as `limit`, `offset`, `like`
     * @return {Array} - An array of all found articles
     */
    static * find(params, options) {

        // validate params
        // if a parameter does not have a correct value type, remove it from the params object
        const paramDefs = [{
            name: 'rarity',
            type: 'string'
        }, {
            name: 'setid',
            type: 'string'
        }, {
            name: 'type',
            type: 'string'
        }, {
            name: 'uuid',
            type: 'string'
        }];

        let _params = {}; // actual params for query

        paramDefs.forEach(function(pd) {
            if (params[pd.name] && typeof(params[pd.name]) === pd.type) {
                _params[pd.name] = params[pd.name];
            }
        });

        //    // boolean parameters need to be evaluated from whatever they are to a boolean
        //    const booleans = ['aa', 'ea'];
        //    booleans.forEach(function(b) {
        //      if (params[b]) {
        //        // the property exists, but might be anything
        //        if (params[b] === true || params[b] === false) {
        //          // if `params[b]` is either true nor false, add it to search params
        //          _params[b] = params[b]
        //        }
        //      }
        //    });

        // validate options
        if (options.limit && parseInt(options.limit) === NaN) {
            delete options.limit;
        }
        if (options.offset && parseInt(options.offset) === NaN) {
            delete options.offset;
        }

        // manually parse `name` as they must be exposed with LIKE statements
        let nameParam = '%';
        if (params.name && typeof(params.name) === 'string') {
            nameParam = params.name;
            if (options.contains) {
                nameParam = '%' + params.name + '%';
            }
        }

        // depending on `options.like` we use an exact search or not
        const result = yield knex('distinct_articles')
            .where(_params)
            .whereRaw(options.contains ? '(name iLIKE ?)' : '(name LIKE ?)', [nameParam])
            .limit(options.limit)
            .offset(options.offset);

        return result;

    }

    /**
     * @function Finds the first article that meets `params`
     * @param {Object} params - Search parameters like `name`, `internal`, `rarity`
     * @return {Object} - The found object or null
     * @throws {Error} - A 404 error if there are no matching articles
     */
    static * findOne(params) {

        // use Article.find()
        const result = yield Article.find(params, {
            limit: 1,
            offset: 0,
            like: false
        });

        if (result.length !== 0) {
            return result[0];
        } else {
            const e = new Error('There are no articles matching the given parameters');
            e.status = 404;
            throw e;
        }

    }


    /**
     * @function Builds a history for the given article called `name` and timeframe in `params`
     * @param {String} name - Name of the article
     * @param {Object} timeframe - Timeframe
     * @return {Array} - An array with summary data for each day and currency
     */
    static * getHistory(name, timeframe) {

        // validate name
        if (!name || typeof(name) !== 'string') {
            const err = new Error('`name` needs to be a string');
            err.status = 400;
            throw err;
        }

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
            'SELECT date as d, currency as c, average as a, median as m, min as mi, max as ma, total as t, quantity as q',
            'FROM daily_sales',
            'WHERE name = ? AND date >= ? AND date <= ?',
            'ORDER BY date ASC'
        ].join(' ');

        const params = [
            name,
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
     * @function Builds a summary for the given article called `name` and timeframe in `params`
     * @param {String} name - Name of the article to summarize for
     * @param {Object} timeframe - Timeframe on what to summarize on
     * @return {Object} - An object with summaries for each currency
     */
    static * getSummary(name, timeframe) {

        // validate name
        if (!name || typeof(name) !== 'string') {
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

        if (!_start.isValid() ||  !_end.isValid()) {
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
            platinum: (result.filter(function(e) {
                return e.currency === 'Platinum';
            }))[0],
            gold: (result.filter(function(e) {
                return e.currency === 'Gold';
            }))[0]
        };

        return result;

    }


    // /**
    //  * @function Returns a summary for multiple articles @{collection} over the specified timeframe @{timeframe}
    //  * @param {Array} collection - Array describing a collection of articles (array of {name: "name", quantity: "quantity"} objects)
    //  * @param {Object} timeframe - Timeframe on what to summarize on
    //  */
    // static * getSummaryForCollection(collection, timeframe) {
    //
    //     // validate @{collection}
    //     // ...
    //
    //     // validate @{days}
    //     // ...
    //
    //     // produces a {platinum: {}, gold: {}} object
    //     const pricesPerArticle = collection.map(function*(e) {
    //
    //         const result = yield Article.getSummary(e.name, timeframe);
    //         return result;
    //
    //     });
    //
    //     return pricesPerArticle;
    //
    // }


    // /**
    //  * @function Finds the conversion rates of last month for an article with name `name`
    //  * @param {String} name - The name of the article to get conversion rates for
    //  * @return {Array} - An array with conversion rates for each available day for the last month
    //  */
    // static * getConversionRateForArticle(name) {
    //
    //   if (!name || typeof(name) !== 'string') {
    //     const err = new Error('`name` must be a string');
    //     err.status = 400;
    //     throw err;
    //   }
    //
    //   // this query builds a base table with avg, median and quantity values for each day and currency
    //   // that base table is then self joined on rows that have the same date but different currencies and
    //   // all gold values (avg, median) are divided by their corresponding plat values (avg, median) for that day
    //   const query = [
    //     'WITH t AS',
    //     '(SELECT date, currency, avg(price)::int, median(price)::int, sum(1) as quantity',
    //     'FROM sales',
    //     'WHERE name = ? and date > current_timestamp - interval \'1 months\'',
    //     'GROUP BY date, currency',
    //     'ORDER BY date)',
    //     'SELECT tg.date, (tg.avg/tp.avg)::real as gold_per_plat_avg, (tg.median/tp.median)::real as gold_per_plat_median, tg.quantity as gold_quantity, tp.quantity as plat_quantity',
    //     'FROM t tg INNER JOIN t tp',
    //     'ON tg.date = tp.date AND tg.currency = \'Gold\' and tp.currency = \'Platinum\';'
    //   ].join(' ');
    //
    //   const params = [
    //     name
    //   ];
    //
    //   const result = (yield knex.raw(query, params)).rows;
    //
    //   return result;
    //
    // }

}

module.exports = Article;
