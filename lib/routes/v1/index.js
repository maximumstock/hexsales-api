'use strict';

/**
 * @file Exports a router that contains all routes for `/v1`
 */

const Router = require('koa-router');
const router = new Router({
  prefix: '/v1'
});

const articleRoutes = require('./articleRoutes');

router.use(articleRoutes.routes());

module.exports = router;
