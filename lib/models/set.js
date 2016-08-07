'use strict';

/**
 * @file Exports the set class.
 */

const knex = require('../db');
const moment = require('moment');

class Set {

    /**
     * @function Returns all distinct sets
     * @return {Array} - An array of all sets
     */
    static * getAll() {

        const result = yield knex('distinct_sets')

        const sets = result.map(function(e) { return e.set; });

        return sets;

    }

}

module.exports = Set;
