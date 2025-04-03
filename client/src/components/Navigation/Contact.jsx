import React from 'react'
import ContactForm from '../Form_&_Features/ContactForm'
import {Separator} from '@/components/ui/separator'
import FAQ from '../Form_&_Features/FAQ'
import images from '../../assets/index'
function Contact() {
  return (
    <>
    <div className=' relative pt-14 pb-10 | lg:pt-28 lg:pb-16 | xl:pt-32 flex items-start  justify-between xl:px-20 lg:px-14 md:px-10 max-md:px-5 h-full w-full'>
    
              <div className=' h-full w-fit md:text-7xl xl:text-9xl sm:text-4xl max-sm:text-2xl text-xl font-semibold leading-1 '><li className='md:text-xl text-sm text-gray-600 mb-5 '>Contact</li> <span className='px-2  | sm:px-6 | xl:px-12 | 2xl:px-20 | 3xl:px-40 | 4xl:px-60'>Let’s Connect</span><br/> and Create<span className='text-emerald-500'>.</span></div>
              {/* <div className=' px-2 | lg:px-3 | xl:px-4 w-fit mb-10 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16 '> */}
              <div className=' h-[11rem] sm:h-[14rem] md:h-[18rem] lg:h-[18rem] xl:h-[20rem] md:w-[16%] max-md:w-[27%] sm:w-[23%]  text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
                <div className="relative group">
    
                  {/* Image */}
                  <img
                    src={images.Project1_i}
                    alt=""
                    className=" rounded-2xl h-[11rem] sm:h-[14rem] md:h-[18rem] lg:h-[18rem] xl:h-[20rem] w-full hover:translate-x-2 transition-transform-colors "
                  />
                </div>
    
                {/* </div> */}
              </div>
            </div>
            <Separator/>

    <ContactForm/>

    <Separator/>

<div className='flex flex-wrap mb-10 | lg:mb-2 w-[94vw] h-full'>
      
      <div className='flex max-md:flex-wrap items-start justify-between   w-full h-fit mt-[5rem]'>
        <div className='  px-2 | lg:px-3 | xl:px-4 w-full mb-5 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16'>
          <div className='  md:h-96 text-2xl | md:text-3xl | xl:text-5xl | 4xl:text-8xl font-sans-primary tracking-tight font-semibold text-black  | dark:text-grayDark-100 text-balance '>
            {/* I ensure that each project is cohesive, user-centric, and aligned with your brand’s goals.Let’s work together to design something extraordinary <span className='font-bold text-4xl text-emerald-500'>!</span> */}
            <div className=' w-full sticky top-4'>
              <div className='block'><li className='text-2xl text-gray-500 mb-4'>FAQs</li></div>
            Answers to your <br/> queries 
            <span className={`font-bold text-5xl text-emerald-500`}> .</span>
            </div>
            
            
          </div>
        </div>
        <div className=' lg:px-10 md:px-8 max-md:px-5 px-2 |  | xl:px-4 w-full mb-10 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16 '>
          <h2 className=' relative h-[100%] sm:h-[100%] md:h-fit w-full text-3xl | md:text-2-4xl | xl:text-2xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
            <div className="relative  flex flex-col w-full h-full">
              <div className=''>
                <FAQ/>
              </div>
            </div>

          </h2>
        </div>

      </div>
    </div>

    </>
  )
}

export default Contact