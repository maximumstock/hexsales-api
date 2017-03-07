'use strict';

/**
 * @file Exports a configuration object based on NODE_ENV
 */

module.exports = {

    port: process.env.PORT ||  3000,
    dbUrl: process.env.DBURL || 'pg://hexsalesapi:hexsalesapi@localhost:5432/hexsalesapi',

    cdnRoot: 'https://hexpvptools.net/ah_dump/',
    apiUrl: 'http://hexdbapi.hexsales.net/v1/objects/search',

    startDate: '2017-02-22',

    articleNameSpecialCharacters: [',', '\'', ' ']
};
