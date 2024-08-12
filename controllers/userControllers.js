const multer = require('multer');
const sharp = require('sharp')
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorsge = multer.diskStorage({
    
//     destination :(req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename : (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

const multerStorsge = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb( new AppError('Not an image ! Please upload an image'))
    }
}

const upload = multer({
    storage : multerStorsge,
    fileFilter : multerFilter
})

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality : 90})
    .toFile(`public/img/users/${req.file.filename}`)

    next()
})

// Utility function to filter allowed fields
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};



exports.updateMe = catchAsync(async(req, res, next) => {
    console.log(req.file);
    
    if(req.body.password || req.body.passwordConfirm) {
        return next( new AppError('this rout is not for password update', 400))
    }

    const filterBody = filterObj(req.body, 'email', 'name');
    if(req.file) filterBody.photo = req.file.filename
     const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    });

    // Send response
    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    })
});

exports.deleteMe = catchAsync( async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active : false});


    res.status(204).json({
        status : 'success',
        data : null
    })
});

exports.getMe = catchAsync( async( req, res, next) => {
    req.params.id = req.user.id;
    next()
})



exports.createUser = (req, res) => {
    res.status(500).json({
        status : 'error',
        message : 'this rout not yet defind'
    })
}

exports.getUser = factory.getOne(User)
exports.getAllUsers = factory.getAll(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
