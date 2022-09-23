/* eslint-disable import/order */
/* eslint-disable import/no-useless-path-segments */
const reviewController=require('./../controllers/reviewController');
const express=require('express');
const authController=require('./../controllers/authController');

const router=express.Router({mergeParams:true});

router
    .route('/')
    .get(authController.protect, reviewController.getAllReviews)
    .post( authController.protect, authController.restrictedTo('user'),reviewController.setUserIds, reviewController.createReview)
    //.patch(authController.protect,authController.restrictedTo('user'), reviewController.updateReview);

router
    .route('/:id')
    .delete(reviewController.deleteReview)
    .patch(authController.protect,authController.restrictedTo('user'), reviewController.updateReview);
module.exports=router;