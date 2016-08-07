'use strict';

/**
 * @file Route defintions for `/v1/summaries`
 */

const Router = require('koa-router');
const router = new Router();

const controllers = require('../../controllers');
const summaryController = controllers.v1.summaryController;

router.get('/summaries', summaryController.get);

module.exports = router;
