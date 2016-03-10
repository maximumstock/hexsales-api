'use strict';

/**
 * @file Starts the whole updating process to provide updated data for the api
 */

const config = require('../../config');
const dbmanager = require('./dbmanager');
const moment = require('moment');
const logger = require('../logger');

// updater delegates
const saleUpdater = require('./salesUpdater');
const infoUpdater = require('./infoUpdater');


logger.info('hexsales-updater started (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
logger.info('started inserting new sales (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));

saleUpdater.update()
  .then(function() {
    logger.info('finished inserting new sales (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
    logger.info('started updating sales data (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
    return infoUpdater.update();
  })
  .then(function() {
    logger.info('finished updating sales data (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
    //logger.info('started refreshing views (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
    //return dbmanager.refreshViews();
  })
  .then(function() {
    //logger.info('finished refreshing views (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
    process.exit(0);
  })
  .catch(function(error) {
    logger.error(error);
    process.exit(-1);
  });
