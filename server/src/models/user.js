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
    // Set only for accounts created/linked via "Continue with Google". sparse:true
    // means the unique index ignores documents where this field is absent, so
    // regular password accounts (which never set it) don't collide with each other.
    googleId:{
        type:String,
        unique:true,
        sparse:true,
    },
    password:{
        type:String,
        // Required for normal signups, but NOT for accounts created via Google -
        // those never set a password at all, so there's nothing to hash/compare.
        required:[function(){ return !this.googleId; }, 'Password is required'],
        select:false,
    }
},{
    timestamps:true
})

userSchema.methods.generateAuthToken=function(){
    const token = jwt.sign({_id:this._id, role:this.role},process.env.JWT_SECRET,{ expiresIn: "1y" })
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