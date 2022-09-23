const mongoose=require('mongoose');
const User = require('./userModel');
const Review=require('./reviewModel');

const tourSchema=mongoose.Schema(
    {
        name:
        {
            type:String,
            unique:true,
            required:[true,'a tour must hane a name'],
            trim:true
        },
        duration:
        {
            type:Number,
            required:[true,'a tour must hve a duration']
        },
        maxGroupSize:
        {
            type:Number,
            required:[true,'a tour must have a maximum group size']
        },
        difficulty:
        {
            type:String,
            required:[true,'a tour must have a certain difficulty']
        },
        ratingsAverage:
        {
            type:Number,
            default:4.5,
            min:1,
            max:5,
            set:val=>Math.round(val*10)/10 //4.4444 -> 44.444 -> 45 -> 4.5  
        },
        ratingsQuantity:
        {
            type:Number,
            default:0
        },

        rating:
        {
            type:Number,
            default:4.5,
            required:[true,'give a rating']
        },
        price:
        {
            type:Number,
            required:[true,'a tour must have a price']
        },
        priceDiscount:
        {
            type:Number
        },
        summary:
        {
            type:String,
            trim:true,
            required:[true,'summary required']
        },
        description:
        {
            type:String,
            trim:true
        },
        imageCover:
        {
            type:String,
            required:[true,'image cover required']
        },
        image:[String],
        createdAt:
        {
            type:Date,
            default:Date.now(),
            select: false
        },
        startDates:[Date],
        startLocation:
        {
            type:
            {
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
        },
        locations:[
            {
                type:{
                    type:String,
                    default:'Point',
                    enum:['Point']
                },
                coordinates:[Number],
                address:String,
                description:String,
                day:Number
            }
        ],
        guides:[
            {
                type:mongoose.Schema.ObjectId,
                ref:'User'
            }
        ]
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
)

//documnetation middleware:
// tourSchema.pre('save',async function(next){
//     const guidesPromise=this.guides.map(async id=>await User.findById(id));
//     this.guides=await Promise.all(guidesPromise);
//     next();
// })

//virtual populate
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
});

//query middleware:
tourSchema.pre('^find', function(next)
{
    this.populate(
        {
            path:'guides',
            select:'-__v -passwordChangedAt'
        }
    );
    next();
})

const Tour = mongoose.model('Tour',tourSchema);

module.exports=Tour;