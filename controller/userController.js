const User = require('../models/userModel');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
exports.getUser = async (req, res, next) => {
  try {
    const users = await User.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.updateMe = async (req, res, next) => {
  try {
    //filtered out unwanted field name that are user not allowed to update like 'role'.if "role" chnages to "admin" then user will have authority.
    const filterDoc = filterObj(req.body, 'name', 'email');
    //updating user data
    const updatedUser = await User.findByIdAndUpdate(req.body.id, filterDoc, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'Success',
      data: updatedUser,
    });
    next();
  } catch (err) {
    res.status(400).json({
      message: err,
    });
  }
};
exports.updateUser = async (req, res, next) => {
  try {
    const users = await User.findByIdAndUpdate(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
exports.deleteMe = async (req, res, next) => {
  try {
    const users = await User.findByIdAndUpdate(req.body.id, {
      active: false,
    });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
exports.deleteUser = async (req, res, next) => {
  try {
    const users = await User.findByIdAndUpdate(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.checkbody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: 'fail',
      message: 'missing name or price',
    });
  }
  next();
};
