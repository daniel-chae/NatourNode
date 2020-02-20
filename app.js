//app configuration lives here and export the app
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter); //Router is a middleware, we define where this middleware to be used.
app.use('/api/v1/users', userRouter); //It is called mounting the routers

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
