const fs = require('fs');
const ProjectModel = require('../models/project');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.newProject= async(req,res)=>{
    const {name ,email, phone , type , describe} = req.body;

    // This check now runs BEFORE anything touches req.file. Previously
    // req.file.originalname was read here first, which threw a raw
    // TypeError (outside the try/catch below) whenever a request arrived
    // with no file attached - the request would then hang with no response
    // instead of returning this 400.
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'raw', // only for files 
          folder: 'Portfolio_AssignProject',
          use_filename: true,   // Use the original filename
          unique_filename: false,
          access_mode: 'public',
          format: 'pdf',
        });
    
        const file = result.secure_url;

        await ProjectModel.create({name , email , phone , business:type , describe , file})
        
        return res.status(200).json({message:'Project Assigned successfully'})
    } catch (error) {
        if(error.name === 'ValidationError'){
            return res.status(400).json({message:error.message});
        }
        return res.status(500).json({message:'Something went wrong'})
    } finally {
        // multer wrote this to the OS temp dir with no cleanup of its own -
        // remove it now that Cloudinary has (or hasn't) taken a copy, so
        // these don't quietly accumulate on the server's local disk.
        fs.unlink(req.file.path, () => {});
    }
}

exports.allAssignedProject = async(req,res)=>{
  try {
    const projects = await ProjectModel.find();
    return res.status(200).json({message:'All projects fetched successfully',projects})
  } catch {
    return res.status(500).json({message:"Can't fetch projects"})
  }
}

exports.completedProject = async(req,res)=>{
   const {id , status}=req.body;
   try {
      const projectStatus = await ProjectModel.findByIdAndUpdate(
         id,
         { view: status },
         { new: true, runValidators: true } 
       );
   
       if (!projectStatus) {
         return res.status(404).json({ message: "Project not found" });
       }
   
       res.status(200).json({
         message: "Project status updated successfully"
         
       });
   } catch (error) {
    console.log(error);
    if(error.name === 'ValidationError'){
        return res.status(400).json({message:"Invalid status value"});
    }
    if(error.name === 'CastError'){
        // A malformed id (not a valid ObjectId) never reaches the
        // ValidationError check above - Mongoose rejects it earlier, before
        // validation runs - so it needs its own check to get a 400 instead
        // of falling through to the generic 500 below.
        return res.status(400).json({message:"Invalid project id"});
    }
      res.status(500).json({message:"Something went wrong"})
   }
}