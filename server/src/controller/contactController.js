const ContactModel = require('../models/contact');



exports.contactPage = async(req,res)=>{
   const {name,email,phone,type,describe}=req.body;
   try {
      await ContactModel.create({name:name,email:email,phone:phone,business:type,describe:describe})
      
      return res.status(200).json({message:'Connection sent successfully'})
   } catch (error) {
      if(error.name === 'ValidationError'){
          return res.status(400).json({message:error.message});
      }
      return res.status(500).json({message:"Something went wrong!"})
   }
}

exports.allConnection = async(req,res)=>{
try {
   const user = await ContactModel.find();
   return res.status(200).json({message:"Connection retrieve successfully",user})
} catch {
   return res.status(500).json({message:"Can't fetch data"})
}
}

exports.connected = async(req,res)=>{
   const {id , status}=req.body;
   try {
      const updatedUser = await ContactModel.findByIdAndUpdate(
         id,
         { view: status },
         { new: true, runValidators: true } 
       );
   
       if (!updatedUser) {
         return res.status(404).json({ message: "User not found" });
       }
   
       res.status(200).json({
         message: "User status updated successfully"
         
       });
   } catch (error) {
      if(error.name === 'ValidationError'){
          return res.status(400).json({message:"Invalid status value"});
      }
      if(error.name === 'CastError'){
          // Same gap as projectController's completedProject: a malformed
          // id throws CastError before validation ever runs, so it needs
          // its own check to get a 400 instead of the generic 500 below.
          return res.status(400).json({message:"Invalid contact id"});
      }
      res.status(500).json({message:"Something went wrong"})
   }
}