import React from 'react'
import { Separator } from '@/components/ui/separator'

function FeatureComponent({ heading, subheading, service, end }) {
  return (
    <div className='flex flex-wrap mb-10 | lg:mb-2 w-[94vw] h-full'>
      <div className='px-2 | lg:px-3 | xl:px-4 w-full '>
        <div className='w-full'>
          <h2 className='text-[20vw] | lg:text-[17vw] font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-0.9 text-balance '>
            {heading}
          </h2>
        </div>
      </div>
      <div className='flex max-md:flex-wrap items-start justify-between   w-full h-fit mt-[5rem]'>
        <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-5 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16'>
          <h2 className='
                          text-2xl | md:text-2xl | xl:text-3xl | 4xl:text-5xl
                          font-sans-primary tracking-tight
                          font-semibold
                          text-black  | dark:text-grayDark-100
                          
                          leading-0.9
                          text-balance
                          
                          '>
            {/* I ensure that each project is cohesive, user-centric, and aligned with your brand’s goals.Let’s work together to design something extraordinary <span className='font-bold text-4xl text-emerald-500'>!</span> */}
            {subheading}
            <span className={`font-bold text-4xl text-emerald-500`}>{end}</span>
          </h2>
        </div>
        <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-10 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16 '>
          <h2 className=' relative h-[100%] sm:h-[100%] md:h-fit w-full text-3xl | md:text-2-4xl | xl:text-2xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
            <div className="relative  flex flex-col w-full h-full">
              <div className=''>
                {service.map((tech) => (
                  <>
                    <div key={tech.id} className=' transition-all delay-100 tracking-normal hover:max-sm:text-xl text-base font-serif hover:text-2xl group'>
                      <a href="" className={`group  `}><span className='text-base text-center p-4'>{`0${tech.id}`}</span>  {tech.service ?? tech.feature}</a>
                      <Separator className='my-3 ml-5 w-full group-hover:bg-black      hover:transition duration-700 delay-150' />
                    </div>
                  </>
                ))}

              </div>
            </div>

          </h2>
        </div>

      </div>
    </div>
  )
}

export default FeatureComponent