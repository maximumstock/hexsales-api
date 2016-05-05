'use strict';

/**
 * @file Exports the application
 */

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
//app.use(cache(cacheOptions));

app.use(errorHandler());
require('./routes')(app);

module.exports = app;
