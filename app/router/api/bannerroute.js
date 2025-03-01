const express = require('express');
const routeLabel = require('route-label');
const bannerController = require('../../webservice/bannerApiController');

// Initiallize the express router for router object
const router = express.Router();
const namedRouter = routeLabel(router);

namedRouter.get('banner', '/bannerlist', bannerController.showbanner)

module.exports = router; 