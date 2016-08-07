'use strict';

/**
 * @file Route defintions for `/v1/sets`
 */

const Router = require('koa-router');
const router = new Router();

const controllers = require('../../controllers');
const setController = controllers.v1.setController;

router.get('/sets', setController.getAll);

module.exports = router;
