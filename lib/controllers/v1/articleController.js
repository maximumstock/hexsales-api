'use strict';

/**
 * @file Route handler for `/v1/articles`
 */

const models = require('../../models');
const Article = models.article;
const Summary = models.summary;
const History = models.history;

module.exports = {

    getAll: function*(next) {

        const options = {
            limit: this.request.query.limit || 25,
            offset: this.request.query.offset ||  0
        };

        const articles = yield Article.getAll(options);

        this.body = articles;
        this.status = 200;

        yield next;

    },

    /**
     * @function Finds all articles meeting the parameters in the request body
     */
    find: function*(next) {

        const params = this.request.body;
        const options = {
            limit: this.request.body.limit || 25,
            offset: this.request.body.offset || 0,
            contains: this.request.body.contains === true ? true : false // explicitly evaluate to true or false
        };

        const articles = yield Article.find(params, options);

        this.body = articles;
        this.status = 200;

        yield next;

    },

    /**
     * @function Finds a certain article by the url parameter `:uuid`
     * It finds the first article whose `uuid` property matches `:uud`
     */
    findByUUID: function*(next) {

        const uuid = this.params.uuid;

        const article = yield Article.findOne({
            uuid: uuid 
        });

        this.body = article
        this.status = 200;

        yield next;

    },
    
    // /**
    //  * @function Finds a certain article by the url parameter `:name`
    //  * It finds the first article whose `name` property matches `:name`
    //  */
    // findByName: function*(next) {

    //     const name = this.params.name;

    //     const article = yield Article.findOne({
    //         name: name
    //     });

    //     this.body = article
    //     this.status = 200;

    //     yield next;

    // },

    /**
     * @function Builds a summary for a certain article with uuid `:uuid` 
     */
    getSummary: function*(next) {

        const uuid = this.params.uuid;
        const params = {
            start: this.request.query.start,
            end: this.request.query.end
        };

        const summary = yield Summary.getForArticle(uuid, params);

        this.body = {
            platinum: summary.filter(function(e) { return e.currency == 'Platinum'; }).map(function(e) { delete e.currency; return e; })[0] || {},
            gold: summary.filter(function(e) { return e.currency == 'Gold'; }).map(function(e) { delete e.currency; return e; })[0] || {}
        };
        this.status = 200;

        yield next;

    },

    /**
     * @function Builds a history for a certain article with uuid `:uuid`
     */
    getHistory: function*(next) {

        const params = {
            start: this.request.query.start,
            end: this.request.query.end
        };

        const result = yield History.getForArticle(this.params.uuid, params);

        const history = {
            platinum: result.filter(function(e) { return e.c === 'Platinum'; }).map(function(e) { delete e.c; return e; }),
            gold: result.filter(function(e) { return e.c === 'Gold'; }).map(function(e) { delete e.c; return e })
        };

        this.body = history;
        this.status = 200;

        yield next;

    },

    // /**
    //  * @function Builds a summary for a given collection of articles over a specified timeframe
    //  */
    // getSummaryForCollection: function*(next) {
    //
    //     // validate this.body.collection
    //     // validate this.body.start & this.body.end
    //
    //     const collection = this.request.body.collection;
    //     const timeframe = {
    //         start: this.request.body.start || moment().subtract(3, 'days').format('YYYY-MM-DD'),
    //         end: this.request.body.end || moment().format('YYYY-MM-DD')
    //     };
    //
    //     const pricesPerArticle = [];
    //
    //     for(let i = 0; i < collection.length; i++) {
    //
    //         let cMember = collection[i];
    //
    //         let singleArticleSummary = yield Article.getSummary(cMember.name, timeframe);
    //         // grab aggregated values
    //         cMember.avg = singleArticleSummary.avg;
    //         cMember.median = singleArticleSummary.median;
    //         cMember.
    //         pricesPerArticle.push({
    //             name: cMember.name,
    //             quantity: cMember.quantity,
    //             avg: singleArticleSummary.avg,
    //             median: singleArticleSummary.median,
    //             total:
    //         })
    //
    //     }
    //
    //     const pricesPerArticle = collection.map(function(e) {
    //
    //         const result = yield Article.getSummary(e.name, timeframe);
    //         console.log(result);
    //         return result;
    //
    //     });
    //
    //     this.body = pricesPerArticle;
    //     this.status = 200;
    //
    //     yield next;
    //
    // }

    // /**
    //  * @function Builds a list of conversion rates from gold to platinum for each available day
    //  */
    // getConversionRateForArticle: function*(next) {
    //
    //   const _name = this.params.name;
    //
    //   const convrates = yield Article.getConversionRateForArticle(_name);
    //
    //   this.body = convrates;
    //   this.status = 200;
    //
    //   yield next;
    //
    // }

};
