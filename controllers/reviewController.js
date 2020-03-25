const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviewQuery = new ApiFeatures(Review.find(filter), req.body)
    .filter()
    .sort()
    .paginate()
    .limitFields();
  const reviews = await reviewQuery.query;

  res.status(200).json({
    status: 'success',
    result: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  const tour = await Tour.findById(req.body.tour);

  if (!tour) {
    return next(new AppError('Please provide a valide tour id'), 400);
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
