const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordconfirm: req.body.passwordconfirm,
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
