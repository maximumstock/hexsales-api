'use strict';

/**
 * @file Route defintions for `/v1/articles`
 */

const Router = require('koa-router');
const router = new Router();

const controllers = require('../../controllers');
const articleController = controllers.v1.articleController;

router.get('/articles', articleController.getAll);
router.get('/articles/:name', articleController.findByName);
router.get('/articles/:name/summaries', articleController.getSummary);
router.get('/articles/:name/histories', articleController.getHistory);
// router.get('/articles/:name/conversion', articleController.getConversionRateForArticle);
router.post('/articles/search', articleController.find);

module.exports = router;
