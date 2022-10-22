const mongoose=require('mongoose');
const express=require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
// const routes=require('./Routes/articles.js')

const app=express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//connect server with mongodb
const url=process.env.MONGODB_URL;


mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology: true})

const con=mongoose.connection

con.on('open',()=>{
    console.log('db connected') 
})



//use applications
app.use(express.json())

const userRoute = require('./routes/users')
const coinGecko = require('./routes/coinGecko');


app.use('/api/user', userRoute);
app.use('/api/coinGecko', coinGecko);

//conne
const port = 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})