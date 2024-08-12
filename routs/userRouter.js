const express = require('express');
const userControllers = require('./../controllers/userControllers')
const authControllers = require('./../controllers/authController');
const router = express.Router();

router.route('/signup').post(authControllers.signup);
router.route('/login').post(authControllers.login);
router.route('/logout').get(authControllers.logout);
router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

router.use(authControllers.protect)


router.patch('/updateMyPassword', authControllers.updatePssword);
router.get('/me',  userControllers.getMe, userControllers.getUser)
router.patch('/updateMe', userControllers.uploadUserPhoto,userControllers.resizeUserPhoto, userControllers.updateMe);
router.delete('/deleteMe', userControllers.deleteMe);

router.use(authControllers.restrictTo('admin'))

router
.route('/')
.get(userControllers.getAllUsers)
.post(userControllers.createUser)

router
.route('/:id')
.get(userControllers.getUser)
.patch(userControllers.updateUser)
.delete(userControllers.deleteUser);

module.exports = router