const User =require('../models/user')

module.exports.registerUser = async(req,res,next)=>{
    const {firstName , lastName , email,password}=req.body;

    try {
        const isUserExist = await User.findOne({email});
        if(isUserExist){
            return res.status(401).json({message:"User already exist"});
        }
        const hashPassword =await User.hashPassword(password);
        console.log(hashPassword)
        const user = await User.create({
            firstName,
            lastName,
            email,
           password:hashPassword
        })

        const token = user.generateAuthToken();
        const options = {
            httpOnly:true,
            secure:true,
            sameSite:"None",
            maxAge:360000 * 24 * 60 * 60 * 1000
        }
        const role = user.role;
        return res.cookie("token" , token , options).status(200).json({message:"User registered successfully",token,role})
    } catch (error) {
        return res.status(404).json({message:"Something went wrong"})
    }
}

module.exports.loginUser = async(req,res,next)=>{
    const {email,password}=req.body;

    try {
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(401).json({message:"Invalid email or password"})
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({message:"Invalid email or password"})
        }
        const token = user.generateAuthToken();
        const options={
            httpOnly:true,
            secure:true,
            sameSite:"None",
            maxAge:360000*24*60*60*1000
        }
        const role = user.role;
        return res.cookie("token",token,options).status(200).json({message:"LoggedIn successfully",token,role})
    } catch (error) {
        console.log(error)
        return res.status(404).json({message:"Something went wrong"})
    }
}