const express = require('express');
const uploadImage = require('../../helper/imagehandler') // Image area
const routeLabel = require('route-label');
const authController = require('../../module/auth/controller/controller');
const { AdminuiAuth } = require('../../middleware/admin_auth/uiauth'); // For UI auth
// Initiallize the express router for router object
const router = express.Router();
const namedRouter = routeLabel(router);

namedRouter.get('register', '/admin/register', authController.registerGet)
namedRouter.post('registercreate', '/admin/registercreate', uploadImage.single('image'), authController.registerPost)
namedRouter.get('otpverify', '/admin/otpverify', authController.otpVerifyGet)
namedRouter.post('otpverifycreate', '/admin/otpverifycreate', authController.otpVerifyPost)
namedRouter.get('login', '/admin/login', authController.loginGet)
namedRouter.post('logincreate', '/admin/logincreate', authController.loginPost)
namedRouter.get('logout', '/admin/logout', authController.logout)
namedRouter.get('profile', '/admin/profile', AdminuiAuth, authController.profilepage)
namedRouter.get('updatepassword', '/admin/updatepassword', AdminuiAuth, authController.updatepasswordGet)
namedRouter.post('updatepasswordcreate', '/admin/updatepasswordcreate', AdminuiAuth, authController.updatepasswordPost)
namedRouter.get('resetpasswordlink', '/admin/resetpasswordlink', authController.resetpasswordlinkGet)
namedRouter.post('resetpasswordlinkcreate', '/admin/resetpasswordlinkcreate', authController.resetpasswordlinkPost)
namedRouter.get('forgetpassword', '/admin/forgetpassword/:id/:token', authController.forgetPasswordGet)
namedRouter.post('forgetpasswordcreate', '/admin/forgetpasswordcreate/:id/:token', authController.forgetPasswordPost)
namedRouter.get('registrationlist', '/admin/registrationlist',AdminuiAuth, authController.RegList)

module.exports = router; 