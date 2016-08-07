'use strict';

/**
 * @file Route handler for `/v1/sets`
 */

const models = require('../../models');
const Set = models.set;

module.exports = {

    getAll: function*(next) {

        const sets = yield Set.getAll();

        this.body = sets;
        this.status = 200;

        yield next;

    }

};
