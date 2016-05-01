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

logger.info('hexsales-updater started');

let wasInserted = false;

saleUpdater.start()
  .then(function(_wasInserted) {
    wasInserted = _wasInserted;
    logger.info('finished inserting new sales');
  })
  // .then(function() {
  //   // logger.info('finished inser sales data (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
  //   // if(!wasInserted) {
  //   //   return;
  //   // }
  //   // logger.info('started refreshing views (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
  //   // return dbmanager.refreshViews();
  // })
  .then(function() {
    // logger.info('finished refreshing views (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
    process.exit(0);
  })
  .catch(function(error) {
    logger.error(error);
    process.exit(-1);
  });
