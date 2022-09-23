/* eslint-disable import/no-useless-path-segments */
const fs=require('fs');
const mongoose=require('mongoose');

// eslint-disable-next-line import/no-useless-path-segments
const tour=require('./../../models/tourModel');
const User=require('./../../models/userModel');
const Review=require('./../../models/reviewModel');

require('dotenv').config({path:'./config.env'});

const DB=process.env.DATABASE
.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(()=>console.log('connected to mongodb'));

// eslint-disable-next-line no-template-curly-in-string
const tourdata=JSON.parse(fs.readFileSync('./dev-data/data/tours.json','utf-8'));
const userdata=JSON.parse(fs.readFileSync('./dev-data/data/users.json','utf-8'));
const reviewdata=JSON.parse(fs.readFileSync('./dev-data/data/reviews.json','utf-8'));

const importdata=async (req,res)=>
{
    try{
        await tour.create(tourdata);
        await User.create(userdata,{validateBeforeSave:false});
        await Review.create(reviewdata);
        // res.json({
        //     satatus:'data updated in DB'
        // });
        console.log('data added');
    }
    catch(error)
    {
        console.log(error);
    }
    process.exit();
}

const deletedata=async (req,res)=>
{
    try
    {
        await tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        // res.json(
        //     {
        //         status:"deleted all data in tours"
        //     },
        // )
        console.log('data deleted in DB')
    }
    catch (error)
    {
        console.log(error);
    }
    process.exit();
}

//console.log(process.argv);
if(process.argv[2]=== 'importdata')
{
    importdata();
}
else if(process.argv[2]==='deletedata')
{
    deletedata();
}