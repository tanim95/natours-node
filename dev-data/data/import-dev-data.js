const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const { json } = require('express');

dotenv.config({ path: './config.env' });
//Connecting MongoDB using Mongoose
mongoose
  .connect(process.env.DATABASE, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => console.log(''))
  .catch((err) => console.log(err));

// Reading the file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-sample.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully imported');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//for delating data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();

// console.log(process.argv);
// node dev-data/data/import-dev-data.js --import
