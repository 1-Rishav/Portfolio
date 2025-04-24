import React, { useEffect, useState } from 'react'
import { MeteorsDemo } from '../Meteor_Box'
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { TextHoverEffect } from "../ui/text-hover-effect";


const Connections = () => {
  const [connectionData , setConnectionData]=useState({user:[]});

  useEffect(()=>{
    const fetchData = async () => {
      try {
        const response = await axios.get('/contact/connections');
        const data = await response.data;
        setConnectionData(data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  },[])


  return (
    <>
    
    <div className='flex items-center justify-center min-h-screen h-full w-full  transform  bg-red-200 bg-gradient-to-r from-blue-100 to-teal-100 overflow-y-scroll '>
    {connectionData?.user?.length==0? 
    <div className='flex  flex-wrap gap-6 justify-around h-full min-h-screen w-full md:w-[70%]   bg-neutral-100 rounded-xl'><TextHoverEffect text="No Connections" /></div>:<div className='flex  flex-wrap gap-6 justify-around h-full min-h-screen w-full md:w-[70%]   bg-neutral-100 rounded-xl '>
       { connectionData?.user?.map((data)=>(
      <div key={data._id} >
       
          <MeteorsDemo name={data.name} number={data.phone} company={data.business} email={data.email} description={data.describe} id={data._id} checked={data.view}/>
        
     
   </div>
     ))}  
     
      
      </div>}
      
    </div>
    </>
  )
}

export default Connections