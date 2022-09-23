const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');

const userSchema=mongoose.Schema(
    {
        name:
        {
            type:String,
            required:[true,'please input your name'],
        },
        email:
        {
            type:String,
            required:[true,'please type your Email'],
            unique:true,
            validate:[validator.isEmail,'please type correct mail id']
        },
        photo:String,
        password:
        {
            type:String,
            required:[true,'please input your password'],
            minlength:8,
            select:false
        },
        passwordConfirm:
        {
            type:String,
            required:[true,'please confirm your password'],
            validate:
            {
                validator:function(el)
                {
                    return el===this.password;
                }
            }
        },
        role:
        {
            type:String,
            enum:['user','guide','lead-guide','admin'],
            default:'user'
        },
        passwordChangedAt:Date, 
        passwordResetToken:String,
        resetTokenExpiry:Date,
    }
);


userSchema.pre('save', async function(next)
{
    if(!this.isModified('password')) return next();

    this.password= await bcrypt.hash(this.password,12);
    this.passwordConfirm=undefined;
    next();
});

userSchema.pre('save',async function(next)
{
    if(!this.isModified('password') || !this.isNew) return next();

    this.passwordChangedAt=Date.now()-2000;
    next();
});

userSchema.methods.correctPassword=async function(candidatePassword,userPassword)
{
    //console.log('in correctPassword function')
    return await bcrypt.compare(candidatePassword,userPassword);
};

userSchema.methods.isPasswordChanged=function(JWTTimestamp)
{
    const changedTimeStamp=parseInt(this.passwordChangedOn.getTime()/1000,10);
    if(this.passwordChangedOn)
    {
        //const changedTimeStamp=parseInt(this.passwordChangedOn.getTime()/1000,10);
        console.log(changedTimeStamp,JWTTimestamp);
    }
    //console.log(changedTimeStamp);
    return JWTTimestamp<changedTimeStamp;
}
userSchema.methods.createResetPasswordToken=function()
{
    //console.log("int create reset password token");
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpiry=Date.now()+20*60*1000;
    console.log({resetToken},this.passwordResetToken);
    return resetToken;
}

const User=mongoose.model('User',userSchema);

module.exports=User;