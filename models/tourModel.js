const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

//Creating Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour must have a name'],
      maxlength: [40, 'Tour name must be less than 40 character'],
      // validate: validator.isAlpha,
    },
    duration: {
      type: Number,
    },
    maxGroupSize: {
      type: Number,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulyt is either easy,medium or difficult',
      },
    },
    ratingsAvarage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQunatity: {
      type: Number,
      default: 0,
    },
    price: Number,
    priceDiscount: {
      type: Number,
      //custom validate function .always returns true or false
      validate: function (val) {
        // price disccount should always be lower than price.this validation only works when doc is creates not when updates!

        return val < this.price;
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
    // GeoSptital Location in MongoDB
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      discription: String,
    },
    // NOW WE ARE 'EMBEDDING' A DOCUMNET SO IT HAS TO BE AN ARRAY NOT OBJECT.
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        discription: String,
        day: Number,
      },
    ],
    // guides: Array,
    // Child referencing ,'tour' referencing 'user'
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// 'single field index' to find data from database more fast.
tourSchema.index({ price: 1 });
// compound field index.
tourSchema.index({ price: 1, ratingsAvarage: -1 });
// Index for Geospitial quries.
tourSchema.index({ startLocation: '2dsphere' });

/// Virtual database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Populating virtually new field 'reviews' which actully do not exist in database.
tourSchema.virtual('reviews', {
  ref: 'review',
  foreignField: 'tour',
  localField: '_id',
});
// mongoose middleware,doc middleware.
// document pre middleware.that works before 'save' or 'create' event.we can use multiple pre middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// embedding document from User model by middleware before save.
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
// document post middleware.that works after 'save' or 'create' event.
tourSchema.post('save', function (doc, next) {
  // console.log(doc);
  next();
});

// query middleware
tourSchema.pre('find', function (next) {
  this.find({ duration: { $gt: 7 } });
  this.start = Date.now();
  next();
});
// tourSchema.post(/^find/, function (doc, next) {
//   // console.log(`Query took ${Date.now() - this.start} millisec`);
//   next();
// });
// populating as a reference
// tourSchema.post(/^find/, function (next) {
//   this.populate('guides');
//   next();
// });
//aggregation middleware
tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline);
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
