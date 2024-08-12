const Tour = require('./../models/tourModel')
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const User = require('./../models/userModel')
// const { log } = require('ndb/lib/ndb/helpers');

exports.getOverview = catchAsync(async(req, res, next) => {

    const tours = await Tour.find();


    res.status(200).render('overview', {
        title : 'get all tour',
        tours
    })
})

exports.getTour = catchAsync(async(req, res, next) => {
     const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path : 'reviews',
        fields : 'review user rating'
     })

     if(!tour) {
        next( new appError('There is no tour with that name', 404))
     }

    res.status(200).render('tour', {
        title : `${tour.name} Tour`,
        tour
    })
});


exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title : 'Log into your account'
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title : 'youre account'
    })
}

exports.updateUserdata = catchAsync(async(req, res, next) => {
    const updateUser = await User.findByIdAndUpdate(req.user.id, {
        name : req.body.name,
        email : req.body.email
    },

    {
        new : true,
        runValidators : true
    }
)

res.status(200).render('account', {
    title : 'youre account',
    user: updateUser
})
    
})