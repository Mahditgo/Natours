const { log } = require('console');
const fs = require('fs');
const Tour = require('./../models/tourModel');
const { query } = require('express');
const { match } = require('assert');
const multer = require('multer');
const sharp = require('sharp')
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./handlerFactory');
const { stringify } = require('querystring');
const { nextTick } = require('process');
const { uploadUserPhoto } = require('./userControllers');



const multerStorsge = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb( new appError('Not an image ! Please upload an image'))
    }
}

const upload = multer({
    storage : multerStorsge,
    fileFilter : multerFilter
})


exports.uploadTourImages = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3}
])


exports.resizeTourImages = catchAsync(async(req, res, next) => {

  if(!req.files.imageCover || !req.files.images) return next();

  
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
  
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality : 90})
    .toFile(`public/img/tours/${req.body.imageCover}`)


    // req.body.images = []

    // Promise.all(req.files.images.map(async(file, i) =>{

    //   const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
    // await sharp(file.buffer)
    // .resize(2000, 1333)
    // .toFormat('jpeg')
    // .jpeg({ quality : 90})
    // .toFile(`public/img/tours/${filename}`)

    // req.body.images.push(filename)
    // }))

    req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }))


  next()
});




// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,ratingsAverage,price,summary,difficulty';
     
    next()
}


exports.getAllTours = factory.getAll(Tour)



exports.getTour = factory.getOne(Tour, { path : 'reviews'})

catchAsync(async(req, res, next) => {

    
    const tour = await Tour.findById(req.params.id).populate('reviews');
    
    if(!tour) {
        return next(new appError('No tour founded with that ID', 404))
    }
    
    res.status(200).json({
        status : 'success',
        data : {
            tour
        }
    })

})




exports.createTour = factory.createOne(Tour)
    

exports.updateToure = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteToure = catchAsync(async(req, res, next) => {
    
//          const tour = await Tour.findByIdAndDelete(req.params.id)

//          if(!tour) {
//             return next(new appError('No tour founded with that ID', 404))
//         }

//         res.status(204).json({
//             status : 'success',
//             data : null
//         }) 
// });

exports.getTourStat = catchAsync(async (req, res, next) => {
    
        const stats = await Tour.aggregate([
            {
                $match : {ratingsAverage : { $gte : 4.5}}
            },

            {
                $group : {
                _id : '$difficulty',
                numTours : { $sum : 1},
                numTours : {$sum : '$ratingsQuantity'},
                avgRating : { $avg : '$ratingsAverage'},
                avgPrice : {$avg : '$price'},
                minPrice : { $min : '$price'},
                maxPrice : { $max : '$price'}
                }
            },
            {
                $sort : {avgPrice : 1 }
                    
            }
        ])

        res.status(200).json({
            status : 'success',
            data : {
                stats
            }
        })

   
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind : '$startDates'
            },
            {
                $match : {
                    startDates : {
                        $gte : new Date(`${year}-01-01`),
                        $lte : new Date(`${year}-12-31`)
                    }
                },    
            },
            {
                $group : {
                    _id : { $month : '$startDates'},
                    numTourStarts : { $sum : 1},
                    tours : { $push : '$name'}
                }
            },
            {
                $addFields : {
                    month : '$_id'
                }
            },
            {
                $project : {
                    _id : 0
                }
            },
             {
                $sort : { numTourStarts : -1}
                
             }
        ]);

        res.status(200).json({
            status : 'success',
            data : {
                plan
            }
        })
   
});


exports.getTourWithin = catchAsync(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance /  6378.1 ;

    if(!lat || !lng) {
        next (new appError('Please Provide a latitute and longitude', 400))
    }

    console.log(distance, lat, lng, unit);

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
      });

      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          data: tours
        }
      });
    });


    exports.getDistances = catchAsync(async (req, res, next) => {
        const { latlng, unit } = req.params;
        const [lat, lng] = latlng.split(',');
      
        const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
      
        if (!lat || !lng) {
          next(
            new appError(
              'Please provide latitutr and longitude in the format lat,lng.',
              400
            )
          );
        }
      
        const distances = await Tour.aggregate([
          {
            $geoNear: {
              near: {
                type: 'Point',
                coordinates: [lng * 1, lat * 1]
              },
              distanceField: 'distance',
              distanceMultiplier: multiplier
            }
          },
          {
            $project: {
              distance: 1,
              name: 1
            }
          }
        ]);
      
        res.status(200).json({
          status: 'success',
          data: {
            data: distances
          }
        });
      });

