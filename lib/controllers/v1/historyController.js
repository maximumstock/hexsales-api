'use strict';

/**
 * @file Route handler for `/v1/histories`
 */

const models = require('../../models');
const History = models.history;

module.exports = {

    get: function*(next) {

        const params = this.request.query;

        const result = yield History.get(params);

        const res = {
            platinum: result.filter(function(e) { return e.c == 'Platinum'; }).map(function(e) { delete e.c; return e; }),
            gold: result.filter(function(e) { return e.c == 'Gold'; }).map(function(e) { delete e.c; return e; })
        }

        this.body = res;
        this.status = 200;

        yield next;

    }

};
