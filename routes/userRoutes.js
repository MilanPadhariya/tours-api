/* eslint-disable import/no-useless-path-segments */
const express=require('express');

const userController=require('./../controllers/userControllers');
const authController=require('./../controllers/authController');
const tourController=require('./../controllers/tourControllers');

const route=express.Router();
route
    .route('/signup')
    .post(authController.signUp);
route
    .route('/login')
    .post(authController.login);

route
    .route('/forgotPassword')
    .post(authController.forgotPassword);

route
    .route('/resetPassword/:token')
    .patch(authController.resetPassword);

route.patch('/updateMe',authController.protect, userController.updateMe);
route.delete('/deleteMe',authController.protect,userController.deleteMe);

route.route('/me').get(authController.protect,userController.getMe,userController.getUser);
route
    .route('/')
    .get(userController.getUsers)
    .post(userController.addUser);

route
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports=route;