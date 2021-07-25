const express = require('express');
const userController = require('./controller/userController');
// const {getAllUsers,createUser} = require('./controller/userController');

const userRoute = express.Router();
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
