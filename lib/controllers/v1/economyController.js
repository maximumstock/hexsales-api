'use strict';

/**
 * @file Route handler for `/v1/economy`
 */

const moment = require('moment');
const models = require('../../models');
const Economy = models.economy;

module.exports = {


  /**
   * @function Builds a history for a certain article with name `:name`
   */
  getHistory: function*(next) {

    const params = {
      start: this.request.query.start,
      end: this.request.query.end
    };

    const history = yield Economy.getHistory(params);

    this.body = history;
    this.status = 200;

    yield next;

  },


  /**
   * @function Finds most sold articles
   */
  getMostSoldArticles: function*(next) {

    const limit = parseInt(this.request.query.limit) || 30;
    const start = this.request.query.start || moment().subtract(3, 'days').format('YYYY-MM-DD');
    const end = this.request.query.end || moment().format('YYYY-MM-DD');

    const mostSold = yield Economy.getMostSoldArticles(start, end, limit);

    this.body = mostSold;
    this.status = 200;

    yield next;

  }

};
