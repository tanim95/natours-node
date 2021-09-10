const express = require('express');
const Tour = require('../models/tourModel');

const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).render('overview', {
      title: 'All overview',
      tours,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});
router.get('/tour', async (req, res) => {
  res.status(200).render('tour', {
    title: 'All tours',
  });
});

module.exports = router;
