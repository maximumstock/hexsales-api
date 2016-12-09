'use strict';

/**
 * @file Exports a configuration object based on NODE_ENV
 */

module.exports = {

    port: process.env.PORT ||  3000,
    dbUrl: process.env.DBURL || 'pg://hexsalesapi:hexsalesapi@localhost:5432/hexsalesapi',

    cdnIndex: 'http://dl.hex.gameforge.com/auctionhouse/index.txt',
    cdnRoot: 'http://dl.hex.gameforge.com/auctionhouse',
    apiUrl: 'http://hexdbapi.hexsales.net/v1/objects/search',

    startDate: '2016-07-08',

    articleNameSpecialCharacters: [',', '\'', ' ']
};
