const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path : './config.env'})
const app = require('./app')
const DB = process.env.DATABASE

mongoose.connect(DB, {
    useNewUrlParser : true,
    // useCreateIndex : true,
    // useFindAndModify : false
})
.then(() => {
    
    console.log('successful connection to db');
});


const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`app is running on port ${port}`);
});

