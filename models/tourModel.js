const mongoose = require('mongoose');
const slugify = require('slugify');
//Creating Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour must have a name'],
    },
    duration: {
      type: Number,
    },
    maxGroupSize: {
      type: Number,
    },
    difficulty: String,
    ratingsAvarage: {
      type: Number,
      default: 4.5,
    },
    ratingsQunatity: {
      type: Number,
      default: 0,
    },
    price: Number,
    priceDiscount: Number,
    summary: String,
    description: String,
    imageCover: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false,
    },
    startDates: [Date],
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
/// Virtual database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// mongoose middleware
// document pre middleware.that works before 'save' or 'create' event.we can use multiple pre middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// document post middleware.that works after 'save' or 'create' event.
tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  next();
});
//Creating Model out of Schema
const Tour = mongoose.model('tours', tourSchema);

// const testTour = new Tour({
// name: 'The forest hiker',
// rating: 4.9,
// price: 497,
// });
// testTour
// .save()
// .then((res) => console.log(res))
// .catch((err) => console.log(err));

module.exports = Tour;
