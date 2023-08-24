const express = require('express');
const reviewcontroller=require('./../controllers/reviewcontroller')
const userController = require('./../controllers/userController');
const userauthentication=require('./../controllers/authenticationcontroller');
const router = express.Router();
router.get('/me',userauthentication.protect,userController.getMe,userController.getUser);
router.post('/signup',userauthentication.signup);
router.post('/login',userauthentication.login);
router.get('/logout',userauthentication.logout);
router.post('/forgotpassword',userauthentication.forgotpassword);
router.patch('/resetpassword/:token',userauthentication.resetpassword);
router.use(userauthentication.protect);
router.patch('/updatemypassword',userauthentication.updatepassword)
router.patch('/updateme',userController.updateMe);
router.patch('/deleteme',userController.deleteMe);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete( userController.deleteUser);
module.exports = router;
