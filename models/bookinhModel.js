const mongoose = require('mongoose');

const bookingSchema = new mongoose({
    tour : {
        type : mongoose.Schema.ObjectId,
        ref : 'Tour',
        required : [true, 'Booking must belong to a tour']
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'USer',
        required : [true, 'Booking must belong to a user']
    },
    price : {
        type : Number,
        required : [true, 'Booking must have price']
    },
    createAt : {
        type : Date,
        default : Date.now()
    },
    paid : {
        type : Boolean,
        default : true
    }
});

bookingSchema.pre(/^find/, function(next) {
    this.populate('usre').populate({
        path : 'tour',
        select : 'name'
    })
})

const Booking = mongoose.model('Booking', bookingSchema);

model.exports = Booking