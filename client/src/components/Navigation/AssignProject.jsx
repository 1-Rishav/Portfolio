import React, { useState } from 'react'
import { FileUploadDemo } from '../File_upload'
import {Separator} from '@/components/ui/separator'
import ProjectForm from '../Form_&_Features/ProjectForm'

function AssignProject() {
const [fileData , setFileData] = useState(null);
const [fileValue , setFileValue] = useState(false);

  const handleFile=(file)=>{
    // try {
    //   const formData=new FormData();
    //   formData.append(file);
      //console.log(Object.fromEntries(formData.entries()));
      setFileData(file)
    // } catch(error){
    //   console.log(error);
    // }
  }

  
  return (
    <>
    <div className=' relative pt-14 pb-10 | lg:pt-28 lg:pb-16 | xl:pt-32 flex items-center  justify-center xl:px-20 lg:px-14 md:px-10 max-md:px-5 h-full w-full'>
        
                  <div className=' h-full w-fit md:text-7xl xl:text-9xl sm:text-4xl max-sm:text-2xl text-xl font-semibold leading-1 '><li className='md:text-xl text-sm text-gray-600 mb-5 '>Project</li> <span className='px-2  | sm:px-6 | xl:px-12 | 2xl:px-20 | 3xl:px-40 | 4xl:px-60'>Let’s Collaborate</span><br/> and Create<span className='text-emerald-500'>.</span></div>
                </div>
                <Separator/>
                <div className='flex flex-wrap mb-10 | lg:mb-2 w-[94vw] h-full'>
                        <div className='px-5 | lg:px-12 | xl:px-16 w-full '>
                          <div className='w-full'>
                            <h2 className='text-[20vw] | lg:text-[17vw] font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-0.9 text-balance '>
                              Docs
                            </h2>
                          </div>
                        </div>
                        <div className='flex max-md:flex-wrap items-center justify-center   w-full h-fit mt-[2rem]'>
                          <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-5 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16'>
                            <div className='text-3xl | md:text-2-5xl | xl:text-4xl | 4xl:text-5xl font-sans-primary tracking-normal font-semibold text-balance'>
                              <FileUploadDemo selectedFile={handleFile} setValue={fileValue}/>
                            </div>
                          </div>                
                        </div>
                      </div>
             <Separator className='mt-20'/>
             <ProjectForm file={fileData} setFileValue={setFileValue}/>
             <Separator/>
    </>
  )
}

export default AssignProject