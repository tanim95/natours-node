const express = require('express');
const fs = require('fs');
const userRoute = require('./userRoute');
const Tour = require('./models/tourModel');
// const Run = require('./MongodbDriver');

const app = express();
if (process.env.NODE_ENV === 'development') {
  console.log('You are currently in development mode');
}

// Middleware for sending any file from ceritain folder direct to the browser
app.use(express.static(`${__dirname}/public`));

//// Middle ware,without it we cant use 'post' request body data i.e 'req.body'.
app.use(express.json());

// Our own middleware function,this is also a global middleware as its declared before all the middleware like GET,POST etc.We can use this middleware function in any get request below
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

////// reading data from file

// const tourData = JSON.parse(
// fs.readFileSync(`${__dirname}/dev-data/data/tours-sample.json`,'utf-8)
// );

app.get('/api/v1/tours/', async (req, res) => {
  const tours = await Tour.find();
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
});

app.get('/api/v1/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
});
const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

app.post('/api/v1/tours', createTour);

// Or we can do this way

const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

app.route('/api/v1/tours/:id').patch(updateTour).delete(deleteTour);

//for Users
//middleware for this route
app.use('/api/v1/users', userRoute);

module.exports = app;
