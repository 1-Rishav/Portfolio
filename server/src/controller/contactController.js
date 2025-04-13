const ContactModel = require('../models/contact');



exports.contactPage = async(req,res)=>{
   const {name,email,phone,type,describe}=req.body;
   try {
      const contactData = await ContactModel.create({name:name,email:email,phone:phone,business:type,describe:describe})
      
      return res.status(200).json({message:'Connection sent successfully'})
   } catch (error) {
      return res.status(401).json({message:"Something went wrong!"})
   }
}