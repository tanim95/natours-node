//Factory Function,we can use them anywhere

exports.deleteone = (model) => async (req, res, next) => {
  try {
    const doc = await model.findByIdAndDelete(req.body.id);
    res.status(204).json({
      status: 'success',
      data: doc,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

const updateone = (model) => async (req, res) => {
  try {
    const tour = await model.findByIdAndUpdate(req.params.id, req.body, {
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
