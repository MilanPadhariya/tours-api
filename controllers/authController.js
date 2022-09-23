/* eslint-disable no-unused-expressions */
/* eslint-disable arrow-body-style */
/* eslint-disable no-unreachable */
/* eslint-disable import/no-useless-path-segments */
const express=require('express');
const crypto=require('crypto');
const jwt=require('jsonwebtoken');

const sendEmail=require('./../utils/email');
const User=require('./../models/userModel');

const signToken = (id)=>
{
    return jwt.sign({id},process.env.JWT_SECRET,
        {
            expiresIn:process.env.JWT_EXPIRES,
        })
}

exports.signUp=async (req,res)=>
{
    try{
        const newUser= await User.create(
            {
                name:req.body.name,
                email:req.body.email,
                password:req.body.password,
                passwordConfirm:req.body.passwordConfirm
            }
        )
        //const token=signToken(newUser.id)
        const token=signToken(newUser.id)
        // jwt.sign({id:newUser.id},process.env.JWT_SECRET,
        //     {
        //         expiresIn:process.env.JWT_EXPIRES,
        //     })
        const cookieOptions={
            expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
            httpOnly:true,
        }
        res.status(201);
        res.cookie('jwt',token,cookieOptions);
        res.json(
            {
                status:"new user creted",
                token,
                data:
                {
                    newUser
                }
            }
        )
    }
    catch(err)
    {
        //console.log(err);
        res.json(
            {
                status:"fail",
                datail:(err)
            }
        )
    }
}

exports.login=async (req,res,next)=>
{
    try
    {
        console.log('reached login after auth');
        //get email and password
        const {email,password}=req.body;
        //console.log(email);
        //check if this email exist and password is correct
        if(!password ||!email)
        {
            res.json(
                {
                    status:"fail",
                    detail:"please enter both user and password"
                }
            );
            next();
        }

        //if correct then send the json web token to client
        // for that first ckeck or authanticate:
        const logedUser=await User.findOne({ email }).select('+password');

        const correctUser=await logedUser.correctPassword(password,logedUser.password);

        if(!logedUser||!correctUser)
        {
            res.status(400).json(
                {
                    status:"fail",
                    detail:"incorrect user or password"
                }
            )
            next();
        }

        //if authanticated then send token
        const token=await signToken(logedUser._id);
        const cookieOptions={
            expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
            httpOnly:true,
        };
        res.status(201);
        res.cookie('jwt',token,cookieOptions);
        res.json(
            {
                status:"authanticated",
                token:token
            }
        );
        next();
    }
    catch(err)
    {
        res.status(404);
        res.json(
            {
                ststus:"failed",
                detail:"error in logging In"
            }
        )
    }
}

exports.protect= async (req,res,next)=>
{
    try{
        //console.log("in protect");
        // getting the token from the header of http request
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        {
            token=req.headers.authorization.split(' ')[1];
        }
        //console.log(token);
        if(!token)
        {
            return res.json(
                {
                    detail:"you are not authorized",
                }
            )
        }
        //veryfying token
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        //console.log(decoded);
        //check if the user exist:
        const checkUser= await User.findById(decoded.id);
        if(!checkUser)
        {
            return res.json(
                {
                    status:401,
                    detail:"user  which you are trying to login doesnot exist"
                }
            )
        }
        //check if the user has changed the password or not:
        // if(checkUser.isPasswordChanged(decoded.iat))
        // {
        //     return res.json(
        //         {
        //             detail:"recentyl changed password please login again"
        //         }
        //     )

        // }
        //grant access to protected route----
        req.user=checkUser;
        next();
    }
    catch(err)
    {
        res.status(401)
        res.json(
            {
                status:'fail',
                detail:"not authorized"
            }
        )
    }
}

exports.restrictedTo=(...roles)=>
{
    return (req,res,next)=>
    {
        console.log(req.user.role);
        if(!roles.includes(req.user.role))
        {
            res.status(403)
            res.json(
                {
                    detail:'you donot have permission for this action',
                }
            )
            next();
        }
        next();
    }
}

exports.forgotPassword= async (req,res,next)=>
{
    //console.log("in forgot password function");
        //get user based on email
        const findUser=await User.findOne({email:req.body.email});
        if(!findUser)
        {
            res.status(404)
            res.json(
                {
                    detail:"no user with this email address"
                }
            )
            next();
        }
        //generate a random reset token
        const resetToken=findUser.createResetPasswordToken();
        findUser.save({validateBeforeSave:false});

        const resetURL= `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        const message=`submit a patch request on ${resetURL} with your new password and confirm password to reset your password.`;
    try
    {
        await sendEmail(
            {
                email:findUser.email,
                subject:`your password reset token ${message}`
            }
        )
        res.status(200).json(
            {
                detail:"reset token sent to mail"
            }
        );

    }
    catch(err)
    {
        findUser.passwordResetToken=undefined;
        findUser.resetTokenExpiry=undefined;
        findUser.save({validateBeforeSave:false});
        res.json(
            {
                message:"error in sending reset password email try again",
                detail:err
            }
        )
    }
}

exports.resetPassword=async (req,res,next)=>
{
    try
    {
    //get the user based on token
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const getUser= await User.findOne({passwordResetToken:hashedToken,resetTokenExpiry:{$gt:Date.now()}});
    
    // if there is a user and token is not expired then set the new password
    if(!getUser)
    {
        return res.status(400).json({Detail:"the token is incorrect or has expired"})
        next();
    };
    getUser.password=req.body.password;
    getUser.passwordConfirm=req.body.confirmPassword;
    getUser.passwordResetToken=undefined;
    getUser.resetTokenExpiry=undefined;
    await getUser.save();

    //login the user
    const token=await signToken(getUser._id);
        res.json(
            {
                status:"authanticated",
                token:token
            }
        );
    next();
    }
    catch(err)
    {
        res.status(400).json(
            {
                status:"issue in reset parrword",
                deatil:err
            }
        )
        next();
    }
}