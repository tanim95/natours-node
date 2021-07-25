const mongoose = require('mongoose');
//Creating Schema
const tourSchema = new mongoose.Schema({
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
  difficulties: {
    type: String,
  },
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
  summery: String,
  description: String,
  imageCover: String,
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDate: [Date],
});

//Creating Model out of Schema
const Tour = mongoose.model('Tour', tourSchema);

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
