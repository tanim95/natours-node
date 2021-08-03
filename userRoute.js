const express = require('express');
const userController = require('./controller/userController');
const authController = require('./controller/authController');
// const {getAllUsers,createUser} = require('./controller/userController');

const userRoute = express.Router();
userRoute.post('/signup', authController.signup);
userRoute
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.checkbody, userController.createUser);
userRoute
  .route('/:id')
  .get(userController.getAllUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

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
