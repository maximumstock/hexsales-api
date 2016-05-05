'use strict';

/**
 * @file Route defintions for `/v1/economy`
 */

const Router = require('koa-router');
const router = new Router();

const controllers = require('../../controllers');
const economyController = controllers.v1.economyController;

router.get('/economy/histories', economyController.getHistory);
router.get('/economy/mostsold', economyController.getMostSoldArticles);

module.exports = router;
