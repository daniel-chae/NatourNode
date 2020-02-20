const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router(); //Create our own router

router.param('id', tourController.checkID); // middleware can be written for a route with specific parameter

router
  .route('/') //tourRouter already starts from a specific route '/api/v1/tours'
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
