'use strict';

/**
 * @file Starts the whole updating process to provide updated data for the api
 */

const config = require('../../config');
const dbmanager = require('./dbmanager');
const moment = require('moment');

// updater delegates
const saleUpdater = require('./salesUpdater');
const infoUpdater = require('./infoUpdater');


console.log('hexsales-updater started (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
console.log('started inserting new sales (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));

saleUpdater.update()
    .then(function() {
        console.log('finished inserting new sales (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
        console.log('started updating sales data (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
        return infoUpdater.update();
    })
    .then(function() {
        console.log('finished updating sales data (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
        console.log('started refreshing views (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
        return dbmanager.refreshViews();
    })
    .then(function() {
        console.log('finished refreshing views (%s)', moment().format('YYYY-MM-DD HH:mm:ss'));
        process.exit(0);
    })
    .catch(function(error) {
        throw error;
    });
