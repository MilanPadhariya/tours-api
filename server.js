
const mongoose=require('mongoose');

const app=require('./app');

require('dotenv').config({path:'./config.env'});

const DB=process.env.DATABASE
.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(()=>console.log('connected to mongodb'));

const port=process.env.PORT;
app.listen(port, ()=>
{
    console.log('server listening');
});