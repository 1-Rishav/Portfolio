const User =require('../models/user')
const { OAuth2Client } = require('google-auth-library')

// Shared cookie attributes for setting AND clearing the session cookie.
const cookieOptions = {
    httpOnly:true,
    secure:true,
    sameSite:"None",
}

// Matches the JWT's own expiresIn: "1y" - previously this was
// 360000 * 24 * 60 * 60 * 1000 (~986 years), almost certainly a typo where
// an extra "00" ended up in front of the intended day count. Keeping the
// cookie's lifetime aligned with the token's own expiry means neither
// outlives the other: the cookie won't disappear while the token is still
// valid, and it won't linger for centuries after the token itself expires.
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

// Verifies Google ID tokens server-side. Constructing this doesn't require
// GOOGLE_CLIENT_ID to be set yet - it only matters once a token is actually
// verified, so a missing env var fails safe (every verification attempt is
// rejected) rather than crashing the server on boot.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

module.exports.registerUser = async(req,res,next)=>{
    const {firstName , lastName , email,password}=req.body;

    try {
        const isUserExist = await User.findOne({email});
        if(isUserExist){
            return res.status(409).json({message:"User already exist"});
        }
        const hashPassword =await User.hashPassword(password);
        const user = await User.create({
            firstName,
            lastName,
            email,
           password:hashPassword
        })

        const token = user.generateAuthToken();
        return res.cookie("token" , token , {...cookieOptions, maxAge:COOKIE_MAX_AGE}).status(200).json({message:"User registered successfully",role:user.role,firstName:user.firstName,email:user.email})
    } catch (error) {
        if(error.name === 'ValidationError'){
            return res.status(400).json({message:error.message});
        }
        if(error.code === 11000){
            // The findOne check above already covers the normal case; this
            // only fires if two registrations for the same email land at
            // almost the same moment and both pass that check before either
            // write finishes. The unique index is what actually stops the
            // second one - this just turns that into the same clean 409
            // used above, instead of a generic 500.
            return res.status(409).json({message:"User already exist"});
        }
        return res.status(500).json({message:"Something went wrong"})
    }
}

module.exports.loginUser = async(req,res,next)=>{
    const {email,password}=req.body;

    try {
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(401).json({message:"Invalid email or password"})
        }
        if(!user.password){
            // Account exists but was created via Google Sign-In, so there's no
            // password to compare against.
            return res.status(401).json({message:"This account uses Google Sign-In. Please continue with Google."})
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({message:"Invalid email or password"})
        }
        const token = user.generateAuthToken();
        return res.cookie("token",token,{...cookieOptions, maxAge:COOKIE_MAX_AGE}).status(200).json({message:"LoggedIn successfully",role:user.role,firstName:user.firstName,email:user.email})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Something went wrong"})
    }
}

// POST /auth/google - verifies a Google ID token (the "credential" the
// frontend gets back from Google Identity Services) and logs the person in
// exactly like a normal login: same cookie, same response shape, same
// success contract. If an account with that email already exists (password
// or already Google-linked), it's reused and linked; otherwise a new
// passwordless account is created.
module.exports.googleAuth = async(req,res)=>{
    const { credential } = req.body;

    if(!credential){
        return res.status(400).json({message:"Missing Google credential"});
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if(!payload || !payload.email_verified){
            return res.status(401).json({message:"Google account email is not verified"});
        }

        const { email, given_name, family_name, sub } = payload;

        let user = await User.findOne({email});

        if(user){
            if(!user.googleId){
                user.googleId = sub;
                await user.save();
            }
        } else {
            user = await User.create({
                firstName: given_name || "Google",
                lastName: family_name || "User",
                email,
                googleId: sub,
            });
        }

        const token = user.generateAuthToken();
        return res.cookie("token",token,{...cookieOptions, maxAge:COOKIE_MAX_AGE}).status(200).json({message:"LoggedIn successfully",role:user.role,firstName:user.firstName,email:user.email})
    } catch (error) {
        if(error.code === 11000){
            // Two sign-in attempts for the same brand-new email arrived at
            // almost the same moment and both passed the findOne check above
            // before either create() finished - the unique index is what
            // catches the second one now. Rare, and simply retrying (the
            // account now exists) succeeds normally.
            return res.status(409).json({message:"An account with this email already exists. Please try signing in again."});
        }
        console.log(error)
        return res.status(401).json({message:"Google sign-in failed. Please try again."})
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
