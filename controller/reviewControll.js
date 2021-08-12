const Review = require('../models/reviewModel');

exports.getAllReviews = async (req, res, next) => {
  try {
    const allReview = await Review.find();
    res.status(200).json({
      status: 'Success',
      message: 'here is all reviews',
      data: allReview,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.createReviews = async (req, res, next) => {
  try {
    const newReview = await Review.create(req.body);
    res.status(201).json({
      status: 'Success',
      message: 'review is posted',
      data: newReview,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
