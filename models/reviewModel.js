const mongoose=require('mongoose');
//const StreamTransport = require('nodemailer/lib/stream-transport');
const Tour=require('./tourModel');

const reviewSchema=mongoose.Schema(
    {
        review:{
            type:String,
            required:[true,'review cannot be empty']
        },
        rating:
        {
            type:Number,
            min:1,
            max:10,
            required:[true,'rating needed']
        },
        createdAt:
        {
            type:Date,
            default:Date.now
        },
        tour:{
            type:mongoose.Schema.ObjectId,
            ref:'Tour',
            required:[true,'a review must have a tour']
        },
        user: {
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:[true,'review must have a user']
        }
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
)

reviewSchema.pre(/^find/,function(next)
{
    this.populate(
        {
            path:'tour',
            select:'name'
        }).populate(
            {
                path:'user',
                select:'name'
            });
    next();
})

reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.statics.calcAverageRating=async function(tourId)
{
    const stats=await this.aggregate(
        [
            {
                $match:{tour:tourId}
            },
            {
                $group:{
                    _id:'$tour',
                    nRating:{$sum:1},
                    avgRating:{$avg:'$rating'}
                }
            }
        ]
    );
    console.log(stats);
    await Tour.findByIdAndUpdate(tourId,
        {
            ratingsAverage:stats[0].avgRating,
            ratingsQuantity:stats[0].nRating
        });
}
reviewSchema.post('save',function()
{
    this.constructor.calcAverageRating(this.tour);
});

const Review=mongoose.model('Review',reviewSchema);

module.exports=Review;