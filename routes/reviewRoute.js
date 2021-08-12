const express = require('express');
const reviewController = require('../controller/reviewControll');

const reviewRoute = express.Router();
reviewRoute
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReviews);

module.exports = reviewRoute;
