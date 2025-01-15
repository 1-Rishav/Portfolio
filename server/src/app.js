const express = require('express');
const morgan = require('morgan');
const routes = require('./routes/index');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize =require('express-mongo-sanitize')
const bodyParser = require('body-parser')
const cors = require("cors")

const app = express();

app.use( cors({
    origin:process.env.FRONTEND_URL,
    methods:['GET','POST','DELETE','PUT','PATCH'],
    credentials:true,
}))


app.use((req, res, next) => {
    console.log('Origin:', req.headers.origin);
    next();
});

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan('combined'));
app.use(mongoSanitize());
app.use(routes);

const limiter = rateLimit({
    windowMs: 60*60*1000,
    limit:1000,
    message:'Too many Requests from this IP , please try again in an hour'
})
app.use(limiter)

module.exports = app;