'use strict';

/**
 * @file Exports an instance of an arbitrary database connection
 */

const config = require('../../config');

const knex = require('knex')({
  client: 'pg',
  connection: config.dbUrl,
  pool: {
    min: 2,
    max: 10
  }
});

module.exports = knex;
