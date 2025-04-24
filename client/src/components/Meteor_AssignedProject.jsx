import React, { useState } from "react";
import { Meteors } from "./ui/box_effect";
import { MdPictureAsPdf } from "react-icons/md";
import { RiCheckDoubleFill } from "react-icons/ri";
import axios from "../utils/axios";
import { toast } from "react-toastify";


export function MeteorAssignedProject({name , number , company , email , description,file,id,checked}) {
    const [doubleChecked, setdoubleChecked] = useState(false)


    const handleCheck=async({id},status)=>{
        try {
            const data={
                id,
                status
            }
            const response = await axios.post('/project/checkStatus',data);
            toast.success(response.data.message)
            if(response.status==200){
                setdoubleChecked(true);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
  return (
    <div className="">
      <div className="relative w-full max-w-xl">
        <div
          className="absolute inset-0 h-full w-full scale-[0.70] transform rounded-full bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 blur-3xl" />
          
          
        <div onDoubleClick={()=>handleCheck({id},"observed")}
          className="relative flex h-[270px] flex-col items-start justify-start rounded-2xl border border-gray-300 bg-gray-100 px-4 py-5 shadow-xl ">
          {(checked=="observed" || doubleChecked) && <div className="absolute bottom-0 right-0  h-10 w-10  rounded-full flex items-center justify-center bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 "><RiCheckDoubleFill/></div>}
          
            <div className=" overflow-x-hidden  overflow-y-scroll ">
          <h1 className="relative z-50 mb-2 text-xl font-bold text-black">
            Name:-{name}
          </h1>
          <h1 className="relative z-50 mb-2 text-xl font-bold text-black">
            Phone:-{number}
          </h1>
          <h1 className="relative z-50 mb-2 text-xl font-bold text-black">
            Email:-{email}
          </h1>
          <h1 className="relative z-50 mb-2 text-xl font-bold text-black">
           Company:-{company}
          </h1>

          <p className="relative z-50 mb-3 text-medium  font-medium text-slate-500">
            Description:-{description}
          </p>

          <a href={file} target="_blank" className="rounded-lg  ">
          <MdPictureAsPdf size={30}/>
          </a>
          </div>

          {/* Meaty part - Meteor effect */}
          <Meteors number={5} />
        </div>
      </div>
    </div>
  );
}
