const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

//// Middle ware
app.use(express.json());

// Our owm middleware,this is also a global middleware as its declared before all the middleware like GET,POST etc.We can use this middleware function in any get request below
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours/', (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    resuts: tourData.length,
    data: {
      tourData,
    },
  });
});
app.get('/api/v1/tours/:id', (req, res) => {
  const tour = tourData.find((el) => el.id === +req.params.id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'InvalidId',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tourData[tourData.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tourData.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tourData),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
    }
  );
});

// app.patch('/api/v1/tours/:id', (req, res) => {
// res.status(200).json({
// status: 'success',
// data: {
// tour: 'tour updated...',
// },
// });
// });
//
// app.delete('/api/v1/tours/:id', (req, res) => {
// res.status(200).json({
// status: 'success',
// data: {
// tour: 'item deleted...',
// },
// });
// });

// Or we can do this way

const patchTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'tour updated...',
    },
  });
};
const deleteTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'item deleted...',
    },
  });
};

app.route('/api/v1/tours/:id').patch(patchTour).delete(deleteTour);

//for Users
const getAllUsers = (req,res)=>{
  res.status(500).json({
    status: 'error',
    message : 'This route is not yet defined'
  })
}
const getAllUser = (req,res)=>{
  res.status(500).json({
    status: 'error',
    message : 'This route is not yet defined'
  })
}

const createUser = (req,res)=>{
  res.status(500).json({
    status: 'error',
    message : 'This route is not yet defined'
  })
}
const updateUser = (req,res)=>{
  res.status(500).json({
    status: 'error',
    message : 'This route is not yet defined'
  })
}
const deleteUser = (req,res)=>{
 res.status(500).json({
   status: 'error',
   message : 'This route is not yet defined'
 })



app.route('/api/v1/users').get(getAllUsers).post(createUser);
app.route('/api/v1/users/:id').get(getAllUser).patch(updateUser).delete(deleteUser);


app.listen(port, () => {
  console.log('Listining on port :' + port);
});
