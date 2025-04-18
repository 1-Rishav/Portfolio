const mongoose = require('mongoose');

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_KEY)
        console.log('DB Connection successful');
    } catch (error) {
        console.error('Database connection failed',error);
        process.exit(1);
    }
}

module.exports = connectDB;