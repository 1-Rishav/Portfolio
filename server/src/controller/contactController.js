const Contact = require('../models/contact');
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

exports.allConnection = async(req,res)=>{
try {
   const user = await ContactModel.find();
   return res.status(200).json({message:"Connection retrieve successfully",user})
} catch (error) {
   return res.status(401).json({message:"Can't fetch data"})
}
}

exports.connected = async(req,res)=>{
   const {id , status}=req.body;
   try {
      const updatedUser = await ContactModel.findByIdAndUpdate(
         id,
         { view: status },
         { new: true } 
       );
   
       if (!updatedUser) {
         return res.status(404).json({ message: "User not found" });
       }
   
       res.status(200).json({
         message: "User status updated successfully"
         
       });
   } catch (error) {
      res.status(401).json({message:"Something went wrong"})
   }
}