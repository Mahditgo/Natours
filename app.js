
const path = require('path')
const fs = require('fs')
const express = require('express');
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const exp = require('constants');
const AppError = require('./utils/appError');
const globalErroHandler = require('./controllers/errorController')
const tourRouter = require('./routs/tourRouter');
const userRouter = require('./routs/userRouter'); 
const reviewRouter = require('./routs/reviewRouter');
const viewRouter = require('./routs/viewRouter')
const { log } = require('console');
const { default: rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { whitelist } = require('validator');
const { title } = require('process');
const cors = require('cors')

// middle ware
const app = express();
app.use(cors())
app.use(cookieParser());



app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

app.use(helmet())

console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
app.use(morgan('dev')) 

}

const limiter = rateLimit({
    max : 100,
    windowMs : 60 * 60 * 1000, 
    message : 'to many requests from this ip'
});

app.use('/api', limiter)

app.use(express.json());
app.use(express.urlencoded({ extended : true, limit : '10kb'}))
app.use(express.static(path.join(__dirname, 'public')))
// app.get('/', (req,res) => {
//     res.status(200).json({message : 'hello from server side'})
// })

app.use(mongoSanitize());
app.use(xss())
app.use(hpp({
    whitelist : ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficuly', 'price']
}))
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next()
})



// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', creatTour);
// app.patch('/api/v1/tours/:id', updateToure);
// app.delete('/api/v1/tours/:id', deleteToure);



app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


app.all('*', (req, res, next) => {
 
    // const err = new Error(`Cant find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Cant find ${req.originalUrl} on this server`, 404))
})


app.use(globalErroHandler)

// server

module.exports = app;








