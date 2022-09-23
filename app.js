const express = require('express');
const { json } = require('express');
const morgan = require('morgan'); //morgan logs the url request in the console
const rateLimit = require('express-rate-limit'); //express internal rate limiter library
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRoute = require('./routes/tourRoutes');
const userRoute = require('./routes/userRoutes');
const reviewRoute=require('./routes/reviewRoutes');

const app = express();

app.set('view engine','pug');
app.set('views','./views');

//middlewares------------------------------------------------------------------------------
//express's middleware:
app.use(express.static('./public'));
app.use(express.json());
//own custom middleware :
app.use((req, res, next) => {
    req.dateMiddleware = new Date();
    next();
})
//third party middleware:
app.use(morgan('dev'));
const limiter = rateLimit({
    max: 100,
    windowMs: 30 * 60 * 1000,
    message: "to many requests from same ip"
})
app.use('/api', limiter);

app.use(mongoSanitize());
app.use(xss());
app.use(hpp(
    {
        whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
    }
));
//middlewares------------------------------------------------------------------------------


app.get('/',(req,res)=>
{
    res.status(200).render('base');
});
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews',reviewRoute);

app.all('*', (req, res, next) => {
    res
        .status(404)
        .json({
            status: "failed",
            detail: "not a correct route"
        })
})

module.exports = app;