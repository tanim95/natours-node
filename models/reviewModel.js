const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      dafault: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'Tour',
    select: 'name',
  }).populate({
    path: 'User',
    select: 'name',
  });
  next();
});

// 'Static' method like 'instance' method.
reviewSchema.static.calculateAvgRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  await Tour.findById(tourId, {
    ratingsQunatity: stats[0].nRating,
    ratingsAvarage: stats[0].avgRating,
  });
};

reviewSchema.post('save', function () {
  // this.constructor points 'Review' model which is decalared after this function!
  this.constructor.calculateAvgRating(this.tour);
});

// using this calculateAvgRating function for update and delete event but prblm is this method returns 'query middleware' not 'doc middleware'
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // we stored the executed value of 'findOne' in 'this' as a property, so we can ues it in 'post middleware'. This is bcz we cant use doc middleware so we are usin pre and post middleware as a solution! this is only way
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  calculateAvgRating(this.r.tour);
});
const Review = mongoose.model('review', reviewSchema);
module.exports = Review;
