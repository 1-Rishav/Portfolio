import { Input } from "@nextui-org/input";
import { Textarea } from "@nextui-org/input";
import React, { useEffect, useState } from 'react'
import { GoArrowUpRight } from "react-icons/go";
import axios from "../../utils/axios";
import { toast } from "react-toastify";
import LoadingScreen from "../LoadingScreen";

function ContactForm() {
  const [enteredValue , setEnteredValue] =useState({
    name:'',
    email:'',
    phone:'',
    type:'',
    describe:''

  })
  const [error , setError] = useState(true)
  const [loading , setLoading] = useState(false)

  const handleChange = (name,e)=>{
    setEnteredValue((prevValue)=>{
      return{
        ...prevValue,
        [name]:e.target.value
      }
  })

  const isNameValid = enteredValue.name.trim().length > 0;
  const isEmailValid = enteredValue.email.includes('@');
  const isPhoneValid = enteredValue.phone.trim().length >= 10;
  const isTypeValid = enteredValue.type.trim().length >= 4;
  const isDescribeValid = enteredValue.describe.trim().length >= 10;

  // Check if all fields are valid
  if (isNameValid && isEmailValid && isPhoneValid && isTypeValid && isDescribeValid) {
    setError(false); // No errors
  } else {
    setError(true); // Errors exist
  }

  }  

  const handleSubmit= async()=>{
    const data = {
      ...enteredValue,
    }
    
    try {
      setLoading(true)
      const response = await axios.post('contact/contactPage',data,{ withCredentials:true});
 
      toast.success(response.data.message)
      setLoading(false)
    } catch (error) {
      toast.error(error.message)
    }
    setEnteredValue({
    name:'',
    email:'',
    phone:'',
    type:'',
    describe:''
    })
    setError(true);
    
  }
  
  return (
    <>
      <div className="w-full pb-20 | lg:pb-20 | 2xl:pb-28 | 4xl:pb-32 mt-20 xl:px-20 lg:px-14 md:px-10 max-md:px-5">
        <div className="flex w-full max-lg:flex-wrap justify-between lg:mt-4 p-1">
          <div className="px-2 mt-5 lg:px-3 xl:px-4 mb-10 lg:mb-0 flex w-fit lg:order-1 justify-center items-center lg:w-5/16 order-2">
            <div className="flex flex-col space-y-3 | lg:space-y-5 items-start"></div>
            <div className="w-full relative pr-5 | lg:max-w-sm | lg:pr-0  mb-5 flex flex-col items-start justify-center">
              <p className="text-xl font-serif | xl:text-md text-gray-600 dark:text-grayDark-200 font-sans-primary relative z-10 text-pretty font-light leading-7  mb-6">
              Have a question or an idea in mind? Fill out the form to get in touch or assign your project.Let’s work together to bring your vision to life <span className="text-2xl text-emerald-500">!</span>
              </p>
              <a href="/assign-project" className="  inline-flex relative group outline-none  | focus:outline-none "><div className="w-auto bg-emerald-300 inline-flex items-center justify-center relative leading-tight shadow-none overflow-hidden rounded-full border-default text-gray-600 py-2 px-5"><div className="relative inline-flex items-center justify-center top-px flex-shrink-0 bg-emerald-300"><div>
                Assign project</div></div></div><div className="bg-emerald-300 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon"><GoArrowUpRight /></div></a>
            </div>

          </div>
          <div className="flex lg:w-[60%] w-full flex-col order-1 lg:order-2 flex-wrap md:flex-nowrap gap-4 ">
            <div className="flex px-2 w-full flex-wrap md:flex-nowrap gap-4 ">
              <Input label="Name" size="md" variant="faded" type="name" value={enteredValue.name} onChange={(e)=>handleChange('name',e)} isRequired  />
              <Input label="Email" size="md" variant="faded" type="email" value={enteredValue.email} onChange={(e)=>handleChange('email',e)} isRequired  errorMessage="Please enter a valid email"/>
            </div>
            <div className="flex px-2 w-full flex-wrap md:flex-nowrap gap-4 ">
              <Input label="Phone" size="md" variant="faded" type="text" value={enteredValue.phone} onChange={(e)=>handleChange('phone',e)} isRequired  />
              <Input label="Company" size="md" variant="faded" type="text" value={enteredValue.type} onChange={(e)=>handleChange('type',e)} isRequired  />
            </div>
            <div className="flex px-2 w-full flex-wrap md:flex-nowrap gap-4 ">
              <Textarea label="Description" variant="faded" placeholder="Describe your query" value={enteredValue.describe} onChange={(e)=>handleChange('describe',e)}  isRequired/>
            </div>
            <button type="submit" disabled={error} onClick={handleSubmit}  className="  inline-flex relative group outline-none  | focus:outline-none "><div className={`w-auto ${error? 'bg-gray-400 cursor-not-allowed':'bg-emerald-300'} inline-flex items-center justify-center relative leading-tight shadow-none overflow-hidden rounded-full border-default text-black py-2 px-5`}><div className={`relative inline-flex items-center justify-center top-px flex-shrink-0  ${error? 'bg-gray-400 cursor-not-allowed':'bg-emerald-300'}`}><div>
              {loading ? <LoadingScreen/> : "Ready to connect"}</div></div></div><div className={`${error? 'bg-gray-400 cursor-not-allowed':'bg-emerald-300'} flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon`}><GoArrowUpRight /></div></button>
          </div>

        </div>
      </div>

    </>

  )
}

export default ContactForm