const express = require('express')
const tourControllers =require('./../controllers/tourControllers');
const authControllers =require('./../controllers/authController');
const reviewRouter = require('./../routs/reviewRouter');



const router = express.Router()
// router.param('id', tourControllers.checkId)

router.use('/:tourId/reviews', reviewRouter);



router.route('/tour-stat').get(tourControllers.getTourStat);
router.route('/monthly-plan/:year').get(authControllers.protect, authControllers.restrictTo('guide', 'admin', 'lead-guiude'), tourControllers.getMonthlyPlan );
router.route('/top-5-cheap').get(tourControllers.aliasTopTours, tourControllers.getAllTours)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourControllers.getTourWithin)

router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);
router
.route('/')
.get(tourControllers.getAllTours)
.post(authControllers.protect, authControllers.restrictTo('admin', 'lead-guide'),tourControllers.createTour)


router
.route('/:id')
.get(tourControllers.getTour)
.patch(authControllers.protect, authControllers.restrictTo('admin', 'lead-guide'),tourControllers.uploadTourImages, tourControllers.resizeTourImages, tourControllers.updateToure)
.delete(authControllers.protect, authControllers.restrictTo('admin', 'lead-guide'), tourControllers.deleteTour)


// router 
// .route('/:tourId/reviews')
// .post(authControllers.protect, authControllers.restrictTo('user'), reviewController.creatReview)


module.exports = router; 