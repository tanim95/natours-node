const express = require('express');
const reviewController = require('../controller/reviewControll');

const reviewRoute = express.Router({ mergeParams: true }); // mergerParams will enable this (review) route to get parameters from other(tour) route,hence, Id params.though its no need here just for future reference.
reviewRoute
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReviews);

module.exports = reviewRoute;
