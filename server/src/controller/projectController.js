const ProjectModel = require('../models/project');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.newProject= async(req,res)=>{
    const {name ,email, phone , type , describe} = req.body;
    const fileOriginal = req.file.originalname;
    try {
        if (!req.file) {
          return res.status(400).json({ message: 'File is required' });
        }
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'raw', // only for files 
          folder: 'Portfolio_AssignProject',
          use_filename: true,   // Use the original filename
          unique_filename: false,
          access_mode: 'public',
          format: 'pdf',
        });
    
        const file = result.secure_url;
        const publicId = result.public_id;
        
    
        const projectData = await ProjectModel.create({name , email , phone , business:type , describe , file})
        
        return res.status(200).json({message:'Project Assigned successfully'})
    } catch (error) {
        return res.status(400).json({message:'Something went wrong'})
    }
}

exports.allAssignedProject = async(req,res)=>{
  try {
    const projects = await ProjectModel.find();
    return res.status(200).json({message:'All projects fetched successfully'})
  } catch (error) {
    return res.status(401).json({message:"Can't fetch projects"})
  }
}