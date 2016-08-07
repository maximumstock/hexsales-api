'use strict';

/**
 * @file Route handler for `/v1/stats`
 */

const models = require('../../models');
const Stats = models.stats;
const moment = require('moment');

module.exports = {

    getPricelist: function*(next) {

        // Define some timespans for which we want price lists
        const days = [3, 7, 14];
        const timespans = days.map(function(d) {
            return {
                start: moment().subtract(d, 'days').format('YYYY-MM-DD'),
                end: moment().format('YYYY-MM-DD')
            }
        });

        // grab one pricelist per timespan
        const pricelists = [];
        for (let i = 0; i < timespans.length; i++) {
            pricelists.push(yield Stats.getPricelist(timespans[i]));
        }

        // now build one giant object that contains everything useful
        const result = {
            gold: {},
            platinum: {}
        };

        for (let i = 0; i < pricelists.length; i++) {

            const pricelist = pricelists[i];

            ['gold', 'platinum'].forEach(function(currency) {

                // only look at data that has the same currency
                const relevantPricelistData = pricelist.filter(function(e) {
                    return e.currency.toLowerCase() === currency;
                });

                relevantPricelistData.forEach(function(articleData) {

                    // if there is no entry for an article in the current resultset, add it
                    if (!result[currency][articleData.name]) {
                        result[currency][articleData.name] = {};
                    }

                    // anyway add the data for that article from the current pricelist to the result set
                    const articleKey = articleData.name;
                    let tmp = {
                        q: articleData.q,
                        t: articleData.t,
                        mi: articleData.mi,
                        ma: articleData.ma,
                        a: articleData.a
                    };
                    result[currency][articleKey][days[i].toString()] = tmp;
                    // remove attributes `name` and `currency` from result set
                    delete result[currency][articleKey][days[i].toString()].name;
                    delete result[currency][articleKey][days[i].toString()].currency;

                });

            });

        }

        this.body = result;
        this.status = 200;

        yield next;

    },

    /**
     * @function Finds most sold articles
     */
    getMostSoldArticles: function*(next) {

        const limit = parseInt(this.request.query.limit) || 30;
        const start = this.request.query.start ||  moment().subtract(3, 'days').format('YYYY-MM-DD');
        const end = this.request.query.end || moment().format('YYYY-MM-DD');

        const mostSold = yield Stats.getMostSoldArticles(start, end, limit);

        this.body = mostSold;
        this.status = 200;

        yield next;

    }

};
