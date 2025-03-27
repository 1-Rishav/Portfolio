const ContactModel = require('../models/contact');

exports.contactHome = async(req,res)=>{

}

exports.contactPage = async(req,res)=>{
   const {name,email,phone,type,describe}=req.body;
   const contactData = await ContactModel.create({name:name,email:email,phone:phone,business:type,describe:describe})
   
   return res.status(200).json({message:'Connection sent successfully'})
}