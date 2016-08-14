'use strict';

/**
 * @file Route handler for `/v1/summaries`
 */

const models = require('../../models');
const Summary = models.summary

module.exports = {

    get: function*(next) {

        const params = this.request.query;

        const result = yield Summary.get(params);

        const res = {
            platinum: result.filter(function(e) { return e.currency == 'Platinum'; }).map(function(e) { delete e.currency; return e; })[0] || {},
            gold: result.filter(function(e) { return e.currency == 'Gold'; }).map(function(e) { delete e.currency; return e; })[0] || {}
        }

        this.body = res;
        this.status = 200;

        yield next;

    }

};
