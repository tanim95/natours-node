const util = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../email');
const crypto = require('crypto');

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
    const currentUser = await User.findById(decodedPayload.id);

    if (!currentUser) {
      return res.status(401).json({
        message: 'User do not exist',
      });
    }
    //Check if user changed password after token issued.
    if (currentUser.checkPassAfter(decodedPayload.iat)) {
      return res.status(401).json({
        message: 'password is changed after the token is issued',
      });
    }
    req.user = currentUser;

    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.restrict = (...roles) => {
  return (req, res, next) => {
    // if 'roles' array doesnt include the role that coming from 'req.user.role' then do this.
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to do this',
      });
    }
    next();
  };
};

exports.forgotPass = async (req, res, next) => {
  try {
    //get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).json({
        message: 'There is no user with this email address',
      });
    }

    // Generate random token
    const resetToken = user.passResetToken();
    await user.save({ validateBeforeSave: false });

    //send it to user email
    const resetUrl = `127.0.0.1:3000/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? go to this link(${resetUrl}) and reset your password.`;
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token is valid for 10 minutes',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Password reset token has been sent to the email',
    });

    next();
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
};
exports.resetPass = async (req, res, next) => {
  try {
    // get user based on token
    const token = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
    // if there is no user
    if (!user) {
      return res.status(400).json({
        message: 'No user found',
      });
    }
    // Reseting password
    user.password = req.body.password;
    user.passwordconfirm = req.body.passwordconfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // Sending JWT
    const JsonToken = jwt.sign({ id: req.body._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({
      status: 'Success',
      token: JsonToken,
    });

    next();
  } catch (err) {
    res.status(500).json({
      message: 'Somthing went wrong!',
    });
  }
};
