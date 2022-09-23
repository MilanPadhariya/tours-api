/* eslint-disable import/no-useless-path-segments */
const Factory=require('./factoryHandler');
const Review =require('./../models/reviewModel');


exports.setUserIds=async (req,res,next)=>
{
    if(!req.body.tour) req.body.tour=req.params.tourId;
    if(!req.body.user) req.body.user=req.user.id;
    next();
}

exports.getAllReviews=Factory.getAll(Review);
exports.createReview=Factory.createOne(Review);
exports.deleteReview=Factory.deleteOne(Review);
exports.updateReview=Factory.updateOne(Review);
