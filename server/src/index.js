
require('dotenv').config();
const path = require("path");
const app = require('./app')
const connectDB = require('./db/index')

const port = process.env.PORT || 3000;

app.get('/',(req, res) =>{
    res.send("Never Ever GiveUp!");
})

connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`App running on port ${port} ...`)
    })
})