const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:[true , 'FirstName is Required']
    },
    lastName:{
        type:String,
    },
    role:{
        type:String,
        default:"user"
    },
    email: {
        type: String, required: [true, 'Email is required'], validate: {
            validator: function (email) {
                return String(email)
                    .toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    );
            },
            message: (props) => `Email (${props.value}) is invalid!`,
        },
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        select:false,
    }
},{
    timestamps:true
})

userSchema.methods.generateAuthToken=function(){
    const token = jwt.sign({_id:this._id},process.env.JWT_SECRET,{ expiresIn: "1y" })
    return token
}
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
userSchema.statics.hashPassword = async(password)=>{
    return await bcrypt.hash(password,12)
}

const User = new mongoose.model('User',userSchema);
module.exports = User;