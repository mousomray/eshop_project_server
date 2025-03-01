const express = require('express');
const routeLabel = require('route-label');
const productController = require('../../webservice/productApiController');
const { UserAuth } = require('../../middleware/user_auth/auth')

// Initiallize the express router for router object
const router = express.Router();
const namedRouter = routeLabel(router);

namedRouter.get('products', '/products', productController.showproduct)
namedRouter.get('productdetails', '/singleproduct/:id', UserAuth, productController.productDetails)
namedRouter.get('categoriesandsubcategories', '/categories', productController.catAndSubCat)
namedRouter.get('brandwithproducts', '/brands', productController.brandWithProductCount)
namedRouter.get('subcategorydetails', '/subcategorydetails/:id', productController.subCatWiseproduct)
namedRouter.get('branddetails', '/branddetails/:id', productController.brandwiseproduct)
namedRouter.get('search', '/products/search', productController.search) // Search using query parameter

// Add to cart route area
namedRouter.post('addcart', '/addcart', UserAuth, productController.addToCart) // Add to cart
namedRouter.get('cart', '/cart', UserAuth, productController.getCart)
namedRouter.put('lesscart', '/lesscart', UserAuth, productController.lessCart)
namedRouter.delete('deletecart', '/deletecart', UserAuth, productController.deleteCart)

// Handle order area
 namedRouter.post('createorder', '/ordercreate', UserAuth, productController.createOrder)
 namedRouter.get('orderlist', '/orderlist', UserAuth, productController.useOrderList)
 
 module.exports = router;  