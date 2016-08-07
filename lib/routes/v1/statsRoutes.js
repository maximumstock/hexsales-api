'use strict';

/**
 * @file Route defintions for `/v1/stats`
 */

const Router = require('koa-router');
const router = new Router();

const controllers = require('../../controllers');
const statsController = controllers.v1.statsController;

router.get('/stats/pricelist', statsController.getPricelist);
router.get('/stats/mostsold', statsController.getMostSoldArticles);

module.exports = router;
