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

// updater delegates
const saleUpdater = require('./salesUpdater');
const infoUpdater = require('./infoUpdater');

logger.info('hexsales-updater started');
logger.info('started inserting new sales');

let rowsInserted = 0;

saleUpdater.update()
  .then(function(_rowsInserted) {
    rowsInserted = _rowsInserted;
    logger.info('finished inserting new sales');
    logger.info(`${rowsInserted} rows were inserted`);
    logger.info('started updating sales data');
    return infoUpdater.update();
  })
  .then(function() {
    if(rowsInserted === 0) {
      logger.info('nothing was inserted. exiting');
      process.exit(0);
    }
    logger.info('started refreshing views');
    return dbmanager.refreshViews();
  })
  .then(function() {
    logger.info('finished refreshing views');
    redisClient.flushall();
    logger.info('flushed redis');
    process.exit(0);
  })
  .catch(function(error) {
    logger.error(error);
    process.exit(-1);
  });
