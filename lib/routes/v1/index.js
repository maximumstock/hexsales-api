'use strict';

/**
 * @file Exports a router that contains all routes for `/v1`
 */

const Router = require('koa-router');
const router = new Router({
    prefix: '/v1'
});

const articleRoutes = require('./articleRoutes');
const statsRoutes = require('./statsRoutes');
const historyRoutes = require('./historyRoutes');
const setRoutes = require('./setRoutes');
const summaryRoutes = require('./summaryRoutes');

router.use(articleRoutes.routes());
router.use(statsRoutes.routes());
router.use(historyRoutes.routes());
router.use(setRoutes.routes());
router.use(summaryRoutes.routes());

module.exports = router;
