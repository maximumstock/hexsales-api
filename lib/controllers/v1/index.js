'use strict';

/**
 * @file Exports all controllers that provide route handling for routes of `/v1`
 */

module.exports = {

    articleController: require('./articleController'),
    statsController: require('./statsController'),
    historyController: require('./historyController'),
    setController: require('./setController'),
    summaryController: require('./summaryController')

};
