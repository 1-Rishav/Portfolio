const User =require('../models/user')

// Shared cookie attributes for setting AND clearing the session cookie.
// NOTE: maxAge is intentionally left exactly as it was (a separate, already-flagged
// issue) - not touched here to keep this change scoped to auth protection only.
const cookieOptions = {
    httpOnly:true,
    secure:true,
    sameSite:"None",
}

module.exports.registerUser = async(req,res,next)=>{
    const {firstName , lastName , email,password}=req.body;

    try {
        const isUserExist = await User.findOne({email});
        if(isUserExist){
            return res.status(401).json({message:"User already exist"});
        }
        const hashPassword =await User.hashPassword(password);
        const user = await User.create({
            firstName,
            lastName,
            email,
           password:hashPassword
        })

        const token = user.generateAuthToken();
        return res.cookie("token" , token , {...cookieOptions, maxAge:360000 * 24 * 60 * 60 * 1000}).status(200).json({message:"User registered successfully",role:user.role})
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
        return res.cookie("token",token,{...cookieOptions, maxAge:360000*24*60*60*1000}).status(200).json({message:"LoggedIn successfully",role:user.role})
    } catch (error) {
        console.log(error)
        return res.status(404).json({message:"Something went wrong"})
    }
}

// GET /auth/me - lets the frontend verify (and re-sync role for) an existing
// session cookie on app load, instead of blindly trusting persisted client state.
module.exports.getCurrentUser = async(req,res)=>{
    try {
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        return res.status(200).json({
            user:{
                id:user._id,
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                role:user.role
            }
        });
    } catch (error) {
        return res.status(500).json({message:"Something went wrong"});
    }
}

// POST /auth/logout - clears the session cookie server-side. Options must match
// what was used to set it, or some browsers won't clear it.
module.exports.logoutUser = (req,res)=>{
    res.clearCookie("token", cookieOptions);
    return res.status(200).json({message:"Logged out successfully"});
}