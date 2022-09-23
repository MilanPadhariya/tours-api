/* eslint-disable import/no-useless-path-segments */
const express=require('express');

const tourController=require('../controllers/tourControllers');
const authController=require('./../controllers/authController');
//const reviewController=require('./../controllers/reviewController');
const reviewRoute=require('./reviewRoutes');

const route=express.Router();

route
    .route('/tourStats')
    .get(tourController.tourStats);

route
    .route('/top_5_tours')
    .get(tourController.aliastop5tour ,tourController.getTours);
    
route
    .route('/')
    .get(authController.protect, tourController.getTours)
    .post(tourController.addTour);

route
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect,authController.restrictedTo('admin','lead-guide'),tourController.deleteTour);

route.use('/:tourId/review',reviewRoute);
//     .route('/:tourId/reviews')
//     .post(authController.protect,authController.restrictedTo('user'),reviewController.createReview);

module.exports=route;   