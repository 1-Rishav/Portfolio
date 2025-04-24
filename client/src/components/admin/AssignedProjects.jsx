import React, { useEffect, useState } from 'react'
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { MeteorAssignedProject } from '../Meteor_AssignedProject';
import { TextHoverEffect } from "../ui/text-hover-effect";

const AssignedProjects = () => {
  const [assignedProject , setAssignedProject]=useState({projects:[]});
  
    useEffect(()=>{
      const fetchData = async () => {
        try {
          const response = await axios.get('/project/projects');
          const data = await response.data;
          setAssignedProject(data);
        } catch (error) {
          toast.error(error.message);
        }
      };
  
      fetchData();
    },[])
  
    return (
      <>
      
      <div className='flex items-center justify-center min-h-screen h-full w-full  transform  bg-red-200 bg-gradient-to-r from-blue-100 to-teal-100 overflow-y-scroll '>
        {assignedProject?.projects?.length==0? 
            <div className='flex  flex-wrap gap-6 justify-around h-full min-h-screen w-full md:w-[70%]   bg-neutral-100 rounded-xl'><TextHoverEffect text="No Projects" /></div>:<div className='flex  flex-wrap gap-6 justify-around h-full min-h-screen w-full md:w-[70%]   bg-neutral-100 rounded-xl '>
            { assignedProject?.projects?.map((data)=>(
           <div key={data._id} >
            
               <MeteorAssignedProject name={data.name} number={data.phone} company={data.business} email={data.email} description={data.describe} file={data.file} id={data._id} checked={data.view}/>
               
        </div>
          ))}  
          
           
           </div>}
        
      </div>
      </>
    )
}

export default AssignedProjects