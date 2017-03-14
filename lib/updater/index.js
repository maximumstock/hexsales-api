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
const saleUpdater = require('./updater');

logger.info('hexsales-updater started');

let totalRowsInserted = 0;

saleUpdater.start()
    .then(function(_totalRowsInserted) {
        totalRowsInserted = _totalRowsInserted;
        logger.info('Finished inserting new data');
    })
    .then(function() {
        logger.info(`Done. Inserted ${totalRowsInserted} rows in total`);
        if (totalRowsInserted === 0) {
            logger.info('No data was inserted, don\'t have to continue...exiting');
            process.exit(0);
        }
        logger.info('Refreshing materialized views');
        return dbmanager.refreshViews();
    })
    .then(function() {
        logger.info('Finished refreshing materialized views');
        redisClient.flushall();
        logger.info('Flushed redis');
        logger.info('Done. Exiting...');
        process.exit(0);
    })
    .catch(function(error) {
        logger.error(error);
        process.exit(-1);
    });
