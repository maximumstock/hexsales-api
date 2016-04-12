'use strict';

/**
 * @file Route handler for `/v1/economy`
 */

const models = require('../../models');
const Summary = models.summary;
const History = models.history;

module.exports = {


  /**
   * @function Builds a history for a certain article with name `:name`
   */
  getHistoryForEconomy: function*(next) {

    const params = {
      start: this.request.query.start,
      end: this.request.query.end
    };

    const history = yield History.buildForEconomy(params);

    this.body = history;
    this.status = 200;

    yield next;

  }

};
