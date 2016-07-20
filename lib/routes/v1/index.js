'use strict';

/**
 * @file Exports a router that contains all routes for `/v1`
 */

const Router = require('koa-router');
const router = new Router({
  prefix: '/v1'
});

const articleRoutes = require('./articleRoutes');
const economyRoutes = require('./economyRoutes');
const statsRoutes = require('./statsRoutes');

router.use(articleRoutes.routes());
router.use(economyRoutes.routes());
router.use(statsRoutes.routes());

module.exports = router;
