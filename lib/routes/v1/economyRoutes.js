'use strict';

/**
 * @file Route defintions for `/v1/economy`
 */

const Router = require('koa-router');
const router = new Router();

const controllers = require('../../controllers');
const economyController = controllers.v1.economyController;

router.get('/economy/histories', economyController.getHistoryForEconomy);

module.exports = router;
