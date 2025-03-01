const express = require('express');
const routeLabel = require('route-label');
const brandController = require('../../module/brand/controller/controller');
 const { AdminuiAuth } = require('../../middleware/admin_auth/uiauth'); // For UI auth

// Initiallize the express router for router object
const router = express.Router();
const namedRouter = routeLabel(router);

namedRouter.get('addbrand', '/admin/addbrand',AdminuiAuth, brandController.addbrandGet)
namedRouter.post('addbrandcreate', '/admin/addbrandcreate',AdminuiAuth, brandController.addbrandPost)
namedRouter.get('brandlist', '/admin/brandlist',AdminuiAuth, brandController.showbrand)
namedRouter.get('editbrand', '/admin/editbrand/:id',AdminuiAuth, brandController.singlebrand)
namedRouter.post('updatebrand', '/admin/updatebrand/:id',AdminuiAuth, brandController.updatebrand)
namedRouter.get('deletebrand', '/admin/deletebrand/:id',AdminuiAuth, brandController.deletebrand)

module.exports = router; 