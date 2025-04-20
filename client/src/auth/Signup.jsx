import React, { useState } from 'react'
import { toast } from 'react-toastify'
import axios from '../utils/axios'
import { GoArrowUpRight } from "react-icons/go";
import { Input } from '@nextui-org/input'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RegisterUser } from '../store/slices/authSlice';
import LoadingScreen from '../components/LoadingScreen';


const Signup = () => {
  const [enteredValue , setEnteredValue] =useState({
      firstName:'',
      lastName:'',
      email:'',
      password:''
  
    })
    const [error , setError] = useState(true)
    const [loading ,setLoading] = useState(false)
    const navigate = useNavigate();
    const dispatch = useDispatch();
  
    const handleChange = (name,e)=>{
      setEnteredValue((prevValue)=>{
        return{
          ...prevValue,
          [name]:e.target.value
        }
    })
    const isFirstNameValid = enteredValue.firstName.trim().length>=3;
    const isEmailValid = enteredValue.email.includes('@');
    const isPasswordValid = enteredValue.password.trim().length>=6;
  
    // Check if all fields are valid
    if (isFirstNameValid && isEmailValid && isPasswordValid ) {
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
        const response = await dispatch(RegisterUser(data))
        if(response ===200){
          navigate("/admin/menu")
        }
        setLoading(false)

      } catch (error) {
        toast.error(error.message)
      }
      setEnteredValue({
      firstName:'',
      lastName:'',
      email:'',
      password:'',
      
      })
      setError(true);
      
    }

  return (
    <>
    <div className="h-screen flex items-center justify-center w-full xl:px-20 lg:px-14 md:px-10 max-md:px-5">
          <div className="flex lg:w-[40%] w-full max-lg:flex-wrap justify-center lg:mt-4 p-1">
          
            <div className="flex w-full flex-col order-1 lg:order-2 flex-wrap md:flex-nowrap gap-4 ">
            <div className="text-start text-sm text-gray-500 mt-4">
            Already have an account?{' '}
          <Link to="/admin/login" className="text-green-500 hover:underline">
            Login
          </Link>
        </div>
              <div className="flex px-2 w-full flex-wrap md:flex-nowrap gap-4 ">
                <Input label="FirstName" size="md" variant="faded" type="text" value={enteredValue.firstName} onChange={(e)=>handleChange('firstName',e)} isRequired  errorMessage="Please enter a valid name"/>
                <Input label="LastName" size="md" variant="faded" type="text" value={enteredValue.lastName} onChange={(e)=>handleChange('lastName',e)} />
              </div>

              <div className="flex px-2 w-full flex-wrap md:flex-nowrap gap-4 ">
                <Input label="Email" size="md" variant="faded" type="email" value={enteredValue.email} onChange={(e)=>handleChange('email',e)} isRequired  errorMessage="Please enter a valid email"/>
                
              </div>

              <div className="flex px-2 w-full flex-wrap md:flex-nowrap gap-4 ">
                <Input label="Password" size="md" variant="faded" type="password" value={enteredValue.password} onChange={(e)=>handleChange('password',e)} isRequired  errorMessage="Password must be greater than 6 character"/>
                
              </div>
              
              <button type="submit" disabled={error} onClick={handleSubmit}  className="  inline-flex relative group outline-none  | focus:outline-none "><div className={`w-auto ${error? 'bg-gray-400 cursor-not-allowed':'bg-emerald-300'} inline-flex items-center justify-center relative leading-tight shadow-none overflow-hidden rounded-full border-default text-black py-2 px-5`}><div className={`relative inline-flex items-center justify-center top-px flex-shrink-0  ${error? 'bg-gray-400 cursor-not-allowed':'bg-emerald-300'}`}><div>
                 {loading ? <LoadingScreen/> : 'Signup'} </div></div></div><div className={`${error? 'bg-gray-400 cursor-not-allowed':'bg-emerald-300'} flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon`}><GoArrowUpRight /></div></button>
            </div>
  
          </div>
        </div>
    </>
  )
}

export default Signup