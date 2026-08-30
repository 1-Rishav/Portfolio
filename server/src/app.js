const express = require('express');
const morgan = require('morgan');
const routes = require('./routes/index');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize =require('express-mongo-sanitize')
const bodyParser = require('body-parser')
const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express();

// Render sits in front of this app as a single reverse proxy, and always
// appends the real client IP as the only/first entry in X-Forwarded-For.
// "1" tells Express to trust exactly that one hop - req.ip becomes the
// address Render itself appended, which a client cannot forge - rather
// than either the default `false` (req.ip is just Render's own IP for
// every request) or `true` (trusts the entire header, letting a client
// prepend arbitrary fake IPs). This is also what express-rate-limit needs
// to key its per-IP buckets correctly instead of throwing
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every request.
app.set('trust proxy', 1);

app.use( cors({
    origin: ["https://rishav-labs.vercel.app","https://www.rajrishav.co.in"]    /*  process.env.FRONTEND_URL */,
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
app.use(cookieParser());

// Must run before routes - previously this was defined and mounted AFTER
// app.use(routes), which meant every request had already been fully
// handled by the time the limiter ran. It never actually limited anything.
const limiter = rateLimit({
    windowMs: 60*60*1000,
    limit:1000,
    message:'Too many Requests from this IP , please try again in an hour'
})
app.use(limiter)

app.use(routes);

module.exports = app;