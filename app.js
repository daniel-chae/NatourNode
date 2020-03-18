//only app configuration lives here

// 1)Create an app
// Require express
const express = require('express');
// Create an app
const app = express();

// 2)Use morgan in dev environment
// Require morgan
const morgan = require('morgan');

// Check the environment and use morgan
if (process.env.NODE_ENV === 'development') {
  // NODE_ENV is set in package.json by sciprt.
  app.use(morgan('dev'));
}

// 3)Set some middlewares on the app
// We expect to recieve json as request. This middleware parses the json
app.use(express.json());
// Serve the static folder. When all route doesn't have matching url, it checks the static files as a last step.
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 4)Mount routers
// Require tour and user router
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');

//Router is a middleware, we define where this middleware to be used. It is called mounting the routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 5)Handle all undefined routes
const AppError = require('./utils/appError');

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
