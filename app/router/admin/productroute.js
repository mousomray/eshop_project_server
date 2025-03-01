const express = require('express');
const uploadImage = require('../../helper/imagehandler') // Image area
const routeLabel = require('route-label');
const productController = require('../../module/product/controller/controller');
const { AdminuiAuth } = require('../../middleware/admin_auth/uiauth'); // For UI auth

// Initiallize the express router for router object
const router = express.Router();
const namedRouter = routeLabel(router);

namedRouter.get('addproduct', '/admin/addproduct', AdminuiAuth, productController.addProduct)
namedRouter.post('addproductcreate', '/admin/addproductcreate', AdminuiAuth, uploadImage.single('image'), productController.addproductPost)
namedRouter.get('productlist', '/admin/productlist', AdminuiAuth, productController.showproduct)
namedRouter.get('toggleproductactive', '/admin/toggleproductactive/:id', AdminuiAuth, productController.toggleProductActive);
namedRouter.get('editproduct', '/admin/editproduct/:id', AdminuiAuth, productController.singleproduct)
namedRouter.post('updateproduct', '/admin/updateproduct/:id', AdminuiAuth, uploadImage.single('image'), productController.updateproduct)
namedRouter.get('deleteproduct', '/admin/deleteproduct/:id', AdminuiAuth, productController.deleteproduct)
namedRouter.get('allorderlist', '/admin/orderlist', AdminuiAuth, productController.allOrderAdmin)
namedRouter.post('updateorderstatus', '/admin/updateorderstatus', AdminuiAuth, productController.StatusUpdate);
namedRouter.get('searchproduct', '/admin/searchproduct', AdminuiAuth, productController.search)
namedRouter.get('admindashboard', '/admin/dashboard', AdminuiAuth, productController.dashboard)

module.exports = router;  