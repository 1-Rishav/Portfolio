
require('dotenv').config();
const path = require("path");
const app = require('./app')
const connectDB = require('./db/index')
const axios = require('axios');

const port = process.env.PORT || 3000;

app.get('/',(req, res) =>{
    res.send("Never Ever GiveUp!");
})


const url = 'https://portfolio-0nkn.onrender.com'; 
setInterval(() => {
  axios.get(url)
    .then(() => console.log('Stay awake'))
    .catch(err => console.error('Going to down!', err));
}, 14 * 60 * 1000); // Every 14 minutes


connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`App running on port ${port} ...`)
    })
})