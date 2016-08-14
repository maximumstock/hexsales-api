'use strict';

/**
 * @file Exports the set class.
 */

const knex = require('../db');
const moment = require('moment');

const invalidSets = ['UNSET', 'None Defined'];

class Set {

    /**
     * @function Returns all distinct sets
     * @return {Array} - An array of all sets
     */
    static * getAll() {

        const result = yield knex('distinct_sets')

        const sets = result.map(function(e) { return e.set; }).filter(function(e) {
            // filter out all sets that do not have a valid name
            if(invalidSets.indexOf(e) === -1) return true;
            return false;
        });

        return sets;

    }

}

module.exports = Set;
