'use strict';

/**
 * @file Route defintions for `/v1/histories`
 */

const Router = require('koa-router');
const router = new Router();

const controllers = require('../../controllers');
const historyController = controllers.v1.historyController;

router.get('/histories', historyController.get);

module.exports = router;
