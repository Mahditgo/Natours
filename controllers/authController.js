const crypto = require('crypto')
const { promisify } = require('util')

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const ratelimit = require('express-rate-limit');

const { appendFile } = require('fs');
const { ResumeToken } = require('mongodb');
const { log } = require('console');

const jwt = require('jsonwebtoken');
const { decode } = require('punycode');
const Eamil = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET , { expiresIn : process.env.JWT_EXPIRES_IN })
}

const createSendToken = (user, statuscode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires : new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRERS_IN * 24 * 60 * 60 * 1000
        ),
        
        httpOnly : true
    } 
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    user.active = undefined;
    user.password = undefined;

    res.status(statuscode).json({
        status : 'success',
        token,
        data: {
            user
          }
    })
    
}

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangedAt : req.body.passwordChangedAt,
        role : req.body.role

    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    
    await new Email(newUser, url).sendWelcome()
    createSendToken(newUser, 201, res);
})


exports.login = catchAsync(async(req, res, next) => {
    const { email, password} = req.body;

    //if emial exist and password
    if(!email || !password) {
       return next( new AppError('Please provide a email and password', 400))
    }

    const user = await User.findOne({ email }).select('+password');
   
    if(!user || !(await user.correctPassword(password, user.password))) {
        return next( new AppError('Incorrect email or password', 401))
    }

    createSendToken(user, 200, res);
});


// exports.logout = (req, res) => {
//   res.cookie('jwt', 'logged out', {
//     expires : new Date(Date.now() + 10 * 1000),
//     httpOnly : true
//   });
//   res.status(200).json({
//     status : 'success'
//   })
// }

// // exports.logout = (req, res) => {
// //   res.status(200).json({ status: 'success' });
// // };




exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
  console.log(res);
  
};




exports.protect = catchAsync(async(req, res, next) => {
        //1) getting token and check
        let token;
            if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1]
                
            } else if(req.cookies.jwt) {
                token = req.cookies.jwt
            }
            

            if(!token){
                return next(new AppError('You are not logged in pleas log in to get access', 401))
            }

            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
                
            const freshUser = await User.findById(decoded.id);
            if(!freshUser) {
                return next(new AppError('the user belonging to this token does no longer exist', 401))
            }

            if(freshUser.changedPasswordAfter(decoded.iat)) {
                return next ( new AppError( 'you recently changed password! please log in again', 401))
            };
            req.user = freshUser;
            res.locals.user = freshUser;
            
        next()

});


exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        // 2) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next();
        }
  
        // 3) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
          return next();
        }
  
        // THERE IS A LOGGED IN USER
        res.locals.user = currentUser;
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  };




exports.restrictTo = ( ...roles ) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next( new AppError('you did not permission to perform this', 403))
        }

        next()
    } 
};

exports.forgotPassword = catchAsync(async(req, res, next) => {
    //get user
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        return next( new AppError('There is no user with that email address', 404))
    }

    //generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    
    try {
      
      const resetURL = `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
      
        await new Eamil(user, resetURL).sendPasswordReset();
    
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!'
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    
        return next(
          new AppError('There was an error sending the email. Try again later!'),
          500
        );
      }
    });

exports.resetPassword = catchAsync(async(req, res, next) => {
    
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken : hashedToken, passwordResetExpires : { $gt : Date.now()}});

    if(!user) {
        return next( new AppError('Token is invalid or has expired', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save()


    createSendToken(user, 200, res);

});

exports.updatePssword = catchAsync(async(req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');

    if(!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next( new AppError('there is no user'))
    }

    user.password = req.body.password ;
    user.passwordConfirm = req.body.passwordConfirm ;
    await user.save();

    createSendToken(user, 200, res);
})


