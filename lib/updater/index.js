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

let wasUpdated = true;

logger.info('hexsales-updater started');
logger.info('started inserting new sales');

saleUpdater.update()
  .then(function(_wasUpdated) {
    wasUpdated = _wasUpdated;
    logger.info('finished inserting new sales');
    logger.info('started updating sales data');
    return infoUpdater.update();
  })
  .then(function() {
    logger.info('finished updating sales data');
    if(!wasUpdated) {
      return;
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
