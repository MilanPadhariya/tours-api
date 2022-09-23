/* eslint-disable import/no-useless-path-segments */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable prefer-object-spread */
const express=require('express');

const Tour=require("./../models/tourModel");
const Factory=require('./factoryHandler');

const APIfeatures=require('./../utils/toursApiFeatures');

// const toursData=JSON.parse(fs.readFileSync('${__dirname}/../dev-data/data/tours-simple.json'));

exports.aliastop5tour = (req,res,next)=>
{
    req.query.limit='5';
    req.query.sort='-ratingsAverage';
    req.query.fields='name,price,ratingsAverage,duration,difficulty';
    next();
};

exports.getTours=Factory.getAll(Tour);

exports.getTour=Factory.getOne(Tour,{path:"reviews"});
exports.addTour=Factory.createOne(Tour);
exports.updateTour=Factory.updateOne(Tour);
exports.deleteTour=Factory.deleteOne(Tour);

exports.tourStats=async (req,res)=>
{
    try{
        const stats= await Tour.aggregate([
                {
                    $match:{ratingsAverage:{$gte :4.5}}
                },
                {
                    $group:
                    {
                        _id:'$difficulty',
                        totalTours:{$sum:1},
                        averageRating:{$avg: '$ratingsAverage'},
                        averagePrice:{$avg: '$price'},
                        minPrice:{$min: '$price'},
                        maxprice:{$max: '$price'},
                    }
                }
            ]
        );
        res.json(
            {
                stats
            }
        )
    }
    catch(error)
    {
        res.status(400);
        res.json(
            {
                status:"stats not found"
            }
        )
    }
}