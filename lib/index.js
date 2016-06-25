'use strict';

/**
 * @file Exports the application
 */

process.env.NODE_ENV = process.env.NODE_ENV ||  'development';

const koa = require('koa');
const body = require('koa-body');
const compress = require('koa-compress');
const logger = require('koa-logger');
const cors = require('kcors');
const cache = require('koa-redis-cache');

const cacheOptions = {
    prefix: 'hexsales-api'
};

const middleware = require('./middleware');
const errorHandler = middleware.errorHandler;

const app = koa();

app.use(cors());
app.use(logger());
app.use(body());
app.use(compress());
app.use(errorHandler());

// disable redis caching when testing
if (process.env.NODE_ENV !== 'development') {
    app.use(cache(cacheOptions));
}

require('./routes')(app);

module.exports = app;
