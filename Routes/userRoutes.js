const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

// lecture125 Creating new users
router.route('/signup').post(authController.signup);

// lecture128 Logging in users
router.route('/login').post(authController.login);

// lecture134 Password reset
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').post(authController.resetPassword);

// lecture37 Update password
router
  .route('/updateMyPassword')
  .patch(authController.protect, authController.updatePassword);

//lecture 138 - Updating the current user
router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);

//lecture 139 - Deleting the current user
router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
