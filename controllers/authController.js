const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// lecture-125 Creating new users
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  // lecture128 create a jsonwebtoken - since the signed up user will be logged in.
  // Secret should be at least 32 characters long to be safe.
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token, //send token to client -> client will store this in cookie or localStorage
    data: {
      user: newUser
    }
  });
});

// lecture129 logging in user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exist in the request
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // check if user exists && password is correct
  // password is hidden in default to protect password but we need it here so .select('+password') must be used
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401)); //401 is unauthorized
  }

  // if everything is okay, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

// lecture130 protecting tour routes
exports.protect = catchAsync(async (req, res, next) => {
  // verify if token exists (token is sent with http header of request)
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401) //401 not authorized
    );
  }

  // verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // verify if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist.'),
      401
    );
  }

  // check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'user recently changed the password. Please log in again!',
        401
      )
    );
  }

  req.user = currentUser; //important step for future operations!!
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array e.g. ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this operation.', 403)
      ); //403 forbidden
    }

    next();
  };
};

// lecture134: password reset functionality
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(valid for 10min)',
      message
    });

    console.log('reached here2');
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {});
