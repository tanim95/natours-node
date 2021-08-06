const util = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordconfirm: req.body.passwordconfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });
    // Creating web token[preload,secreat,signature].
    const token = jwt.sign({ id: req.body._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
  // process.exit();
};

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // cheacking if email & password exist.
    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // Check if user exist & password correct.
    const usr = await User.findOne({ email }).select('+password');
    const { password: pass } = usr;
    //comparePass is available bcz its an instance so all document can use it without requirng it!
    if (!usr || !(await usr.comparePass(password, pass))) {
      return res.status(401).json({
        message: 'password or email is invalid',
      });
    }

    // send token if everything is okay
    const token = jwt.sign({ id: req.body._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    //getting token and checking if its there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      throw 'Crediential is not enough to get the route';
    }

    // Token varification
    const decodedPayload = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    // Check if user still exist
    const freshUser = await User.findById(decodedPayload.id);
    if (!freshUser) {
      return res.status(401).json({
        message: 'User do not exist',
      });
    }
    //Check if user changed password after token issued.
    if (freshUser.checkPassAfter(decodedPayload.iat)) {
      return res.status(401).json({
        message: 'password is changed after the token is issued',
      });
    }

    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err,
    });
  }
};
