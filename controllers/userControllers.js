/* eslint-disable import/no-useless-path-segments */

const express=require('express');
const jwt=require('jsonwebtoken');

const User=require('./../models/userModel');
const Factory=require('./factoryHandler');

const filterObj=(obj, ...allowedfields)=>
{
    const newobj={};
    Object.keys(obj).forEach(el=>
        {
            if(allowedfields.includes(el)) newobj[el]=obj[el];
        });
        return newobj;
}

exports.getMe=(req,res,next)=>
{
    req.params.id=req.user.id;
    next();
}

exports.getUsers= Factory.getAll(User);
exports.getUser=Factory.getOne(User);
exports.updateUser=Factory.updateOne(User);
exports.deleteUser=Factory.deleteOne(User);

exports.addUser=(req,res)=>
{
    res.status(500);
    res.json(
        {
            status: "server error"
        }
    )
}

exports.updateMe=async (req,res,next)=>
{
    if(req.body.password || req.body.passwordConfirm)
    {
        res.status(400)
        res.json({
            detail:"please got to forgot password to change the password"
        })
        next();
    }
    const filterBody=filterObj(req.body,'name','email');
    const updatedUser= await User.findByIdAndUpdate(req.user.id,filterBody,{
        new:true,
        runValidators:true
    });
    res.status(200)
    res.json({
        status:"success",
        detail:"user updated",
        data:updatedUser
    })
    next();
}

exports.deleteMe= async (req,res,next)=>
{
    try{
        const deletedUser=await User.findByIdAndDelete(req.user.id);
        res.status(204).json({
            detail:"user deleted"
        })
    }
    catch(err)
    {
        res.json({
            datail:"error in deleting the user"
        })
    }
}