const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const fs = require('fs');
const userRoute = require('./routes/userRoute');
const reviewRoute = require('./routes/reviewRoute');
const Tour = require('./models/tourModel');
const APIfeature = require('./controller/tourController');
const { protect } = require('./controller/authController');
const hpp = require('hpp');
const { patch } = require('./routes/userRoute');
const viewRouter = require('./routes/viewRoutes');
// const delteHandler = require('./controller//handlerFactory');
// const Run = require('./MongodbDriver');

// middleware
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// middleware for setting HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  console.log('You are currently in development mode');
}

// Middleware for sending any static file from ceritain folder direct to the browser
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Global middleware/rate limiter which makes sure request from a certaim IP in a certain ammount of time is in a given limit.
const limit = rateLimit({
  // 100 req form an IP in one hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request,please try again in an hour.',
});
app.use('/api', limit);

//// Middle ware,without it we cant use 'post' request body data i.e 'req.body'.
app.use(express.json({ limit: '10kb' }));

// Data sanitaization against NoSQL injection
app.use(mongoSanitize());
// Data samitization against XSS attack
app.use(xss());
//prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'difficulty', 'price'],
  })
);

// Our own middleware function,this is also a global middleware as its declared before all the middleware like GET,POST etc.We can use this middleware function in any get request below
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

////// reading data from file

// const tourData = JSON.parse(
// fs.readFileSync(`${__dirname}/dev-data/data/tours-sample.json`,'utf-8)
// );

// for rendering pug template
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'Forest Hiker',
    user: 'Tanim',
  });
});
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
    // const tours = await feature.query.explain();

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
      message: err.message,
    });
  }
};
//Geospitial queries for finding tours in certian distance from a certain location.
const getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;
    if (!lat || !lng) {
      throw 'We could not find the location';
    }
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    res.status(200).json({
      status: 'Success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      message: err,
    });
  }
};

const getDistance = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'km' ? 0.001 : 0.000621371;
    if (!lat || !lng) {
      throw 'We could not find the distance of your location';
    }
    const distance = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [+lng, +lat],
          },
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
      {
        distance: 1,
        name: 1,
      },
    ]);

    res.status(200).json({
      status: 'Success',
      distance,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

app.get('/api/v1/tours/', getAllTours);
// Finding tours in a certain distance.
app.get(
  '/api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit',
  getToursWithin
);
app.get('/api/v1/tours/distances/:latlng/unit/:unit', getDistance);

// Alias Route(FOR SPECIFIC ROUTE THAT USER USES MOST SO WE PREFIX SOME QURIES ALREADY)
app.get('/api/v1/tours/top-5-tours', AliasTopTour, getAllTours);

app.get('/api/v1/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('guides')
      .populate('reviews'); // used in query pre middleware
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
      message: err.message,
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
app.use('/api/v1/reviews', reviewRoute);
//nested route
app.use('./api/v1/tours/tourId/reviews', reviewRoute);
//view route for rendering pug
app.use('/', viewRouter);

// ERROR hamdling for route that is not defined.this middleware will exute gradually after all this middleware fails before it . that is why it is in the last position.
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can not find this route : ${req.originalUrl} `,
  });
  next();
});

module.exports = app;
