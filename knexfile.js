'use strict';

const config = require('./config');

const knexConfig = {
  client: 'pg',
  connection: config.dbUrl,
  pool: {
    min: 2,
    max: 10
  }
};

module.exports = {

  development: knexConfig,
  staging: knexConfig,
  production: knexConfig

};
