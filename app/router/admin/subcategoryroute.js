const express = require('express');
const routeLabel = require('route-label');
const SubcategoryController = require('../../module/subcategory/controller/controller');
const { AdminuiAuth } = require('../../middleware/admin_auth/uiauth'); // For UI auth

// Initiallize the express router for router object
const router = express.Router();
const namedRouter = routeLabel(router);

namedRouter.get('addsubcategory', '/admin/addsubcategory', AdminuiAuth, SubcategoryController.addsubcategoryGet)
namedRouter.post('addsubcategorycreate', '/admin/addsubcategorycreate', AdminuiAuth, SubcategoryController.addsubcategoryPost)
namedRouter.get('subcategorylist', '/admin/subcategorylist', AdminuiAuth, SubcategoryController.showsubcategory)
namedRouter.get('editsubcategory', '/admin/editsubcategory/:id', AdminuiAuth, SubcategoryController.singlesubcategory)
namedRouter.post('updatesubcategory', '/admin/updatesubcategory/:id', AdminuiAuth, SubcategoryController.updatesubcategory)
namedRouter.get('deletesubcategory', '/admin/deletesubcategory/:id', AdminuiAuth, SubcategoryController.deletesubcategory)

module.exports = router; 