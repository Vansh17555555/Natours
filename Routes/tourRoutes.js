const express = require('express');
const reviewcontroller=require('./../controllers/reviewcontroller');
const tourController = require('./../controllers/tourController');
const authcontroller=require('./../controllers/authenticationcontroller')
const router = express.Router();
const reviewRouter=require('./reviewRoutes');
//router.param('id', tourController.checkID);
router.get('/top-5-cheap').get(tourController.alias ,tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)
router
  .route('/')
  .get(authcontroller.protect,tourController.getAllTours)
  .post(authcontroller.protect,authcontroller.restrictto,tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(authcontroller.protect,authcontroller.restrictto,tourController.updateTour)
  .delete(authcontroller.protect,authcontroller.restrictto,tourController.deleteTour);
router
  .use('/:tourId/reviews',reviewRouter)
module.exports = router;
