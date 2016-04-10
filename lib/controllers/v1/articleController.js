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
      offset: this.request.query.offset || 0
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
      offset: this.request.body.offset || 0
    };

    const articles = yield Article.find(params, options);

    this.body = articles;
    this.status = 200;

    yield next;

  },

  /**
   * @function Finds a certain article by the url parameter `:name`
   * It finds the first article whose `name` or `internal` property matches `:name`
   */
  findByName: function*(next) {

    const _name = this.params.name;

    const article = yield Article.findOne({name: _name});

    this.body = article
    this.status = 200;

    yield next;

  },

  /**
   * @function Builds a summary for a certain article with name `:name`
   */
  getSummaryForArticle: function*(next) {

    const _name = this.params.name;
    const params = {
      start: this.request.query.start,
      end: this.request.query.end
    };

    const summary = yield Summary.buildForArticle(_name, params);

    this.body = summary;
    this.status = 200;

    yield next;

  },

  /**
   * @function Builds a history for a certain article with name `:name`
   */
  getHistoryForArticle: function*(next) {

    const _name = this.params.name;
    const params = {
      start: this.request.query.start,
      end: this.request.query.end
    };

    const history = yield History.buildForArticle(_name, params);

    this.body = history;
    this.status = 200;

    yield next;

  },

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
