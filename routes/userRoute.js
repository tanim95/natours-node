const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

// const {getAllUsers,createUser} = require('./controller/userController');

const userRoute = express.Router();
userRoute.post('/signup', authController.signup);
// userRoute.get('/me', userController.getMe, userController.getUser);
userRoute.post('/signin', authController.signin);
userRoute.post('/forgotPassword', authController.forgotPass);
userRoute.patch(
  '/updateMe',
  userController.uploadPhoto,
  userController.updateMe
);
userRoute.patch('/updatePassword', authController.updatePassword);
userRoute.patch('/resetPassword/:token', authController.resetPass);
userRoute.delete('/deleteuser', userController.deleteMe);

// userRoute.use(authController.protect); //after this middleware every route below this line will autometically embed protect function.

userRoute
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.checkbody, userController.createUser);
userRoute
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    // authController.protect,
    authController.restrict('admin', 'lead-guide'),
    userController.deleteUser
  );

module.exports = userRoute;

// import { Router } from 'express';
// import { getAllUsers, checkbody, createUser, getAllUser, updateUser, deleteUser } from './controller/userController';
// import { signup } from './controller/authController';
// // const {getAllUsers,createUser} = require('./controller/userController');

// const userRoute = Router();
// userRoute.post('/signup', signup);

// userRoute
//   .route('/')
//   .get(getAllUsers)
//   .post(checkbody, createUser);
// userRoute
//   .route('/:id')
//   .get(getAllUser)
//   .patch(updateUser)
//   .delete(deleteUser);

// export default userRoute;
