const express = require('express');
const fs = require('fs');
const userRoute = require('./userRoute');
const Tour = require('./models/tourModel');
const APIfeature = require('./controller/tourController');
const { protect } = require('./controller/authController');
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

const AliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.fields = 'name,price,summery,difficulty,ratingsAvarage';
  next();
};

////////// Aggregation pipline

const aggregationPipeline = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAvarage: { $gte: 4.5 } },
      },
      {
        $group: {
          // _id: null,
          // _id: '$difficulty',
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAvarage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

const getMonthlyPlan = async (req, res) => {
  try {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: {
          numTours: -1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

app.get('/api/v1/tours/monthly-plan/:year', getMonthlyPlan);

app.get('/api/v1/tours/tour-stats', aggregationPipeline);

const getAllTours = async (req, res) => {
  try {
    // BUILD THE QUERY
    // const queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => delete queryObj[el]);

    // //Advanced Filtering
    // let queries = JSON.stringify(queryObj);
    // queries = queries.replace(/\b(lte|lt|gte|gt)\b/g, (match) => `$${match}`);
    // let queryData = Tour.find(JSON.parse(queries));

    // if (req.query.sort) {
    //   const sort = req.query.sort.split(',').join(' ');
    //   queryData = queryData.sort(sort);
    // }
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   queryData = queryData.select(fields);
    // }
    //Pagination
    // const page = +req.query.page;
    // const limit = +req.query.limit;
    // const skipVal = (page - 1) * limit;
    // queryData = queryData.skip(skipVal).limit(limit);

    // if (req.query.page) {
    //   const count = await Tour.countDocuments();
    //   if (skip >= count) throw new Error('page do not exist');
    // }

    // execute the query,await will immidiatly execute Query object that comes with a result in that case we cant preform any sorting or other oparation thats why we saved it in a variable for some processing the 'await' it.
    const feature = new APIfeature(Tour.find({}), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await feature.query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

app.get('/api/v1/tours/', protect, getAllTours);

// Alias Route(FOR SPECIFIC ROUTE THAT USER USES MOST SO WE PREFIX SOME QURIES ALREADY)
app.get('/api/v1/tours/top-5-tours', AliasTopTour, getAllTours);

app.get('/api/v1/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      throw 'Id could not not found hence the tour!';
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
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
      runValidators: false,
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

// ERROR hamdling for route that is not defined.this middleware will exute gradually after all this middleware fails before it . that is why it is in the last position.
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can not find this route : ${req.originalUrl} `,
  });
  next();
});

module.exports = app;
