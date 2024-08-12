const crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const { type } = require('os');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'please tell us your name']
    },
    email : {
        type : String,
        required : [true, 'please provide youre email'],
        unique : true,
        lowercase : true,
        validator : [validator.isEmail, 'please provide a valid email']
    },
    photo : {
        type : String,
        default : 'default.jpg'
    },
    role : {
        type : String,
        enum : ['user', 'guide', 'lead-guide', 'admin'],
        default : 'user'
    },
    password : {
        type : String,
        required : [true, 'please provide a password'],
        minlength : 8,
        select : false
    },
    passwordConfirm :{
        type : String,
        required : [true, 'please confirm youre password'],
        validate : {
            validator : function(el) {
                return el === this.password;
            },
            message : 'Passwords are not the same !'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active : {
        type : Boolean,
        default : true,
        select : false
    }
});


userSchema.pre('save', function(next) {
    if(this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    
    //delete password data from db we want just to show password in post man
    this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function(canditatePassword, userPassword) {

    return await bcrypt.compare(canditatePassword, userPassword);   
}

userSchema.pre(/^find/, function(next) {
    this.find({ active : { $ne : false}});
    next() 
})


userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)


        console.log(changeTimestamp, JWTTimestamp);

        return JWTTimestamp < changeTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

    return resetToken;
};


const User = mongoose.model('USer', userSchema);
module.exports = User;
