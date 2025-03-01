const express = require('express');
const routeLabel = require('route-label');
const categoryController = require('../../module/category/controller/controller');
 const { AdminuiAuth } = require('../../middleware/admin_auth/uiauth'); // For UI auth

// Initiallize the express router for router object
const router = express.Router();
const namedRouter = routeLabel(router);

namedRouter.get('addcategory', '/admin/addcategory',AdminuiAuth, categoryController.addcategoryGet)
namedRouter.post('addcategorycreate', '/admin/addcategorycreate',AdminuiAuth, categoryController.addcategoryPost)
namedRouter.get('categorylist', '/admin/categorylist',AdminuiAuth, categoryController.showcategory)
namedRouter.get('editcategory', '/admin/editcategory/:id',AdminuiAuth, categoryController.singlecategory)
namedRouter.post('updatecategory', '/admin/updatecategory/:id',AdminuiAuth, categoryController.updatecategory)
namedRouter.get('deletecategory', '/admin/deletecategory/:id',AdminuiAuth, categoryController.deletecategory)
namedRouter.get('categorywiseproduct', '/admin/categorywiseproduct/:id',AdminuiAuth, categoryController.catwiseproduct)

module.exports = router; 