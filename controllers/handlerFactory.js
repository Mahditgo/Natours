const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeature = require('./../utils/apiFeatures');
const { Model } = require('mongoose');


//delete
exports.deleteOne = Model => catchAsync(async(req, res, next) => {
    
    const doc = await Model.findByIdAndDelete(req.params.id)

    if(!doc) {
       return next(new appError('No document founded with that ID', 404))
   }

   res.status(204).json({
       status : 'success',
       data : null
   }) 
});


//update
exports.updateOne = Model => catchAsync(async(req, res, next) => {
  
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
       new : true,
       runValidator : true
    })

    if(!doc) {
        return next(new appError('No document founded with that ID', 404))
    }

    res.status(200).json({
        status : 'success',
        data : {
           data : doc
        }
    }) 
});

//creat
exports.createOne = Model => catchAsync(async(req, res, next) => {
    
    const doc = await Model.create(req.body)
        res.status(201).json({
            status : 'success',
            data : {
                tour : doc
            }
        })

});

exports.getOne = (Model, popOptions) => catchAsync(async(req, res, next) => {
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    
    const doc = await query;
    
    if(!doc) {
        return next(new appError('No document founded with that ID', 404))
    }
    
    res.status(200).json({
        status : 'success',
        data : {
           data : doc
        }
    })

})

exports.getAll = Model => catchAsync(async (req, res, next) => {
   //get reviews on tour
    let filter = {};
    if(req.params.tourId) filter = { tour : req.params.tourId }


    const features = new APIFeature(Model.find(), req.query).filter().sort().limitFields().paginate()
    const doc = await features.query;


    res.status(200).json({
        status : 'success',
        result : doc.length,
        data : {
            data : doc
        }
    })
})