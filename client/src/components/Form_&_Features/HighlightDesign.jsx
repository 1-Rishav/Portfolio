import React from 'react'

function HighlightDesign({heading,subheading,image,end}) {
  return (
    <div className='flex flex-wrap mb-10 | lg:mb-2 w-[94vw] h-full'>
            <div className='px-2 | lg:px-3 | xl:px-4 w-full '>
              <div className='w-full'>
                <h2 className='text-[24vw] | lg:text-[17vw] font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-0.9 text-balance '>
                  {heading}
                </h2>
              </div>
            </div>
            <div className='flex max-md:flex-wrap items-center justify-between gap-10  w-full h-72'>
              <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-5 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16'>
                <h2 className='
    text-3xl | md:text-2-5xl | xl:text-4xl | 4xl:text-5xl
    font-sans-primary tracking-tight
    text-black  | dark:text-grayDark-100
    leading-0.9
    font-semibold
    text-balance
    
    '>
                  {subheading}
                  <span className={`font-bold text-4xl text-emerald-500`}>{ end}</span>
                </h2>
              </div>
              <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-10 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16 md:mt-[22rem]'>
                <h2 className=' h-[16rem] sm:h-[25rem] md:h-[35rem] w-full text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
                  <div className="relative group">
                    <div className="absolute z-50 grid grid-cols-[14rem,auto] grid-rows-[3rem,auto] group">
                      {/* Website Button */}
                      <div className="hidden  group-hover:block   absolute  top-0 left-0 bg-white rounded-br-2xl">
                        <a href='' className="pr-4 pl-4 text-xl font-semibold text-black ">Website</a>
                        <button className='p-2 text-xl font-semibold text-black '>Github</button>
                      </div>
                    </div>
                    {/* Image */}
                    <img
                      src={image}
                      alt=""
                      className=" rounded-2xl h-[16rem] sm:h-[25rem] md:h-[35rem] w-full hover:translate-x-3 transition-transform-colors  hover:animate-pulse-2s"
                    />
                  </div>
    
                </h2>
              </div>
    
            </div>
          </div>
  )
}

export default HighlightDesign