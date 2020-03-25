const express = require('express'); //require express
const tourController = require('../controllers/tourController'); //require tourControllers
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router(); //Create our own router

// router.param('id', tourController.checkID); // middleware can be written for a route with specific parameter

router.use('/:tourId/reviews', reviewRouter);

router.use(authController.protect);

router
  .route('/') //tourRouter already starts from a specific route '/api/v1/tours'
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(authController.restrictTo('user'), reviewController.createReview);

module.exports = router;
