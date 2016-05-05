'use strict';

/**
 * @file Starts the whole updating process to provide updated data for the api
 */

const config = require('../../config');
const dbmanager = require('./dbmanager');
const moment = require('moment');
const logger = require('../logger');
const redis = require('redis');
const redisClient = redis.createClient();

const redis = require('redis');
const redisClient = redis.createClient();

// updater delegates
const saleUpdater = require('./salesUpdater');

logger.info('hexsales-updater started');

let totalRowsInserted = 0;

saleUpdater.start()
  .then(function(_totalRowsInserted) {
    totalRowsInserted = _totalRowsInserted;
    logger.info('finished inserting new sales');
  })
  .then(function() {
    logger.info(`inserted (${totalRowsInserted} rows)`);
    if (totalRowsInserted === 0) {
      logger.info('don\'t have to continue...exiting');
      process.exit(0);
    }
    return dbmanager.refreshViews();
  })
  .then(function() {
    logger.info('finished refreshing materialized views');
    redisClient.flushall();
    logger.info('flushed redis');
    logger.info('hexsales-updater finished');
    process.exit(0);
  })
  .catch(function(error) {
    logger.error(error);
    process.exit(-1);
  });
