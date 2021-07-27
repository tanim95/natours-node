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
