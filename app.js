//only app configuration lives here
const express = require('express');
const morgan = require('morgan');

// lecture142 rate limiting
const rateLimit = require('express-rate-limit');

// lecture143 setting security hhp headers
const helmet = require('helmet');

// lecture144
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// lecture145 parameter polution
const hpp = require('hpp');

const AppError = require('./utils/appError');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');

// 1)Create an app
// Require express
// Create an app
const app = express();

// 2)Use morgan in dev environment
// Require morgan

// Check the environment and use morgan
if (process.env.NODE_ENV === 'development') {
  // NODE_ENV is set in package.json by sciprt.
  app.use(morgan('dev'));
}

// lecture142 rate limiter
const limiter = rateLimit({
  // 100 requests within a hour, this limit will be reset to 100 when app restarts
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter);

// lecture143 set security http header
app.use(helmet());

// 3)Set some middlewares on the app
// We expect to recieve json as request. This middleware parses the json.
// Paylod of request can be only upto 10kb.
app.use(express.json({ limit: '10kb' }));

// lecture144 Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// lecture144 Data sanitization against XSS
app.use(xss());

// lecture145 prevent parameter plutions
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serve the static folder. When all route doesn't have matching url, it checks the static files as a last step.
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 4)Mount routers
// Require tour and user router

//Router is a middleware, we define where this middleware to be used. It is called mounting the routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// 5)Handle all undefined routes

//lecture 111 - handling unhandled route
//This route will be reached only when defined routes are not found
app.all('*', (req, res, next) => {
  //app.all matches to any request type (get, post, patch, etc.)
  //lecture 113 instead of handling errors in the place where it occurs, simply create our custom designed error class with error message and status code.
  //If argument is passed to next function, express knows that it is error and it will be routed to error handling middleware.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 6)Mount the global error handler
const globalErrorHandler = require('./controllers/errorController');

//lecture 113 - global error handling middleware.
//By defining four parameters, express knows that it is error handling middleware.
app.use(globalErrorHandler);

// app.use((req, res, next) => {
//   // when we define a middleware next method is available, which is used to call the next middleware.
//   console.log('Hello from the middleware');
//   next(); // next function should be invoked when our own middleware is executed.
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// app.get('/api/v1/tours', getAllTours);
// app.get(`/api/v1/tours/:id`, getTour);
// // app.post('/api/v1/tours/', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

module.exports = app;
