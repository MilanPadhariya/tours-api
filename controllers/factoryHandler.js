/* eslint-disable no-else-return */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable no-shadow */
//const noExtraneousDependencies = require("eslint-plugin-import/lib/rules/no-extraneous-dependencies");

const { Model } = require("mongoose");
const APIfeatures=require('./../utils/toursApiFeatures');

exports.getAll=Model=>async (req,res)=> 
{
    //to allow nested tour reviews
    let filter;
    if(req.params.tourId) filter={tour:req.params.tourId};

    const features=new APIfeatures(Model.find(filter),req.query).filter().sort().limit().page();
    const docs=await features.query;
    try{
        // const tours=await Tour.find(queryobject);
        res.status(200)
        .json(
            {
                data:docs
            }
        )
    }
    catch(error)
    {
        res.json(error)
    }
}

exports.getOne= (Model,populateOptions) => async (req,res)=> 
{
    try{
        let query=Model.findById(req.params.id);
        if(populateOptions) query=query.populate(populateOptions);
        const doc=await query;
        if(doc)
        {
            return res.status(200)
            .json(
                {
                    data:doc
                }
            )
        }
        else
        {
            return res.status(200)
            .json(
                {
                    detail:"no document with this id found"
                }
            )
        }
        
    }
    catch(error)
    {
        return res.status(400)
        .json(
            {
                error:error
            }
        )
    }
}

exports.deleteOne= Model => async (req,res,next)=>
{
    try{
        const doc=await Model.findByIdAndDelete(req.params.id);
        if(doc)
        {
            res.status(204)
            .json(
                {
                    status:"deteted the document",
                }
            )
            next();
        }
        else
        {
            res.status(404).json(
                {
                    detail:"no document with this id found"
                }
            )
            next();
        }
    }
    catch(error)
    {
        res.status(400)
        .json(
            {
                status:"error in deleting",
                Error:{error}
            }
        )
    }
};

exports.updateOne=Model=>async (req,res)=>
{
    try{
        const doc= await Model.findByIdAndUpdate(req.params.id,req.body,
            {
                new:true,
                runValidators:true
            });
        
        res.status(200)
        .json(
            {
                data:doc
            }
        )
    }
    catch(error)
    {
        res.status(400)
        .json(
            {
                status:"updating failed",
                Error:{error}
            }
        )
    }
}

exports.createOne=Model=>async (req,res)=>
{
    try{
        const newDoc=await Model.create(
            req.body
        )
        res.status(201)
        res.json(
            {
                status:"added data!",
                data:
                {
                    data:newDoc
                }
            }
        )
    }
    catch(err)
    {
        res.status(400)
        .json(
            {
                status:"invalid request"
            }
        )
    }
}