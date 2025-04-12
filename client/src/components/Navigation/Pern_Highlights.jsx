import React, { useEffect, useState } from 'react'
import HighlightDesign from '../Form_&_Features/HighlightDesign'
import HighlightImages from '../Form_&_Features/HighlightImages'
import { pernTechStack } from '../Data/TechStackData'
import { Separator } from "@/components/ui/separator"
import { pernHighlight } from '../Data/HighlightData'
import FeatureComponent from '../Form_&_Features/FeatureComponent'
import images from '../../assets/index'


function Pern_Highlights() {

  const [currentIndex, setCurrentIndex] = useState(0);
    const [currentIndex1, setCurrentIndex1] = useState(0);
  
    // ✅ Image array for loop
    const image = [
      images.Quick1,
      images.Quick2,
      images.Quick3,
    ];
    const image1 = [
      images.Quick4,
      images.Quick5,
      images.Quick6,
    ];
  
    // ✅ Change Image in Every 3 Seconds
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % image.length);
      }, 4000); // 👈 Change every 3 seconds
  
      // ✅ Cleanup on unmount
      return () => clearInterval(interval);
    }, []);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex1((prevIndex) => (prevIndex + 1) % image1.length);
      }, 4000); // 👈 Change every 3 seconds
  
      // ✅ Cleanup on unmount
      return () => clearInterval(interval);
    }, []);
  return (
    <>
      <div className='h-full w-full bg-white brightness-100'>
        <div className=' relative pt-20 pb-10 | lg:pt-32 lg:pb-16 | xl:pt-40   flex  items-center justify-between h-full w-full'>

          <div className='px-2  | sm:px-6 | xl:px-12 | 2xl:px-20 | 3xl:px-40 | 4xl:px-60 h-full w-full text-5xl font-semibold leading-1 '><li className='text-xl text-gray-600 mb-5 '>Pern Project</li> <span className='text-green-800'>QUICKFUNDZ</span>  is a comprehensive <br /> peer-to-peer lending and <br /> borrowing  web application <span className={`font-bold md:text-4xl xl:text-5xl sm:text-3xl max-sm:text-2xl text-xl text-emerald-500`}>.</span> </div>
        </div>
        <div className="w-full flex flex-wrap | md:justify-end"><div className="px-2 | lg:px-3 | xl:px-4"><div className="w-full relative max-w-xl pr-10 | lg:pr-0 lg:max-w-2xl lg:pl-10"><h2 className="mb-3 text-pretty tracking-tight text-black | dark:text-grayDark-100 text-lg md:text-2-5xl xl:text-3xl 4xl:text-4xl leading-tight  font-semibold ">This project mission is to empower individuals and businesses by simplifying access to financial opportunities through technology <span className={`font-bold md:text-3xl xl:text-4xl sm:text-2xl max-sm:text-xl text-lg text-emerald-500`}>.</span></h2></div></div></div>
      </div>
      <Separator className="mt-16 " />

      <HighlightDesign heading='Design' subheading='Crafting user-friendly interfaces tailored to enhance user interaction.Ensures optimal viewing experiences across all devices ' image={images.Quick_Logo} end="."/>

      <Separator className=" mt-96" />

      <HighlightImages videoSrc={images.QuickFundzVideo} img2={image[currentIndex]} img3={image1[currentIndex1]} />

      <Separator className='mt-10' />

      <div className='flex flex-wrap mb-10 | lg:mb-2 w-[94vw] h-full'>
        <div className='px-2 | lg:px-3 | xl:px-4 w-full '>
          <div className='w-full'>
            <h2 className='text-[20vw] | lg:text-[17vw] font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-0.9 text-balance '>
              Tech Stack
            </h2>
          </div>
        </div>
        <div className='flex max-md:flex-wrap items-start justify-between   w-full h-fit mt-[5rem]'>
          <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-5 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16'>
            <h2 className='
    text-3xl | md:text-2-5xl | xl:text-4xl | 4xl:text-5xl
    font-sans-primary tracking-tight
    font-semibold
    text-black  | dark:text-grayDark-100
    
    leading-0.9
    text-balance
    
    '>
              My project is built using a robust and modern tech stack, ensuring optimal performance, scalability, and security <span className={`font-bold md:text-4xl xl:text-5xl sm:text-3xl max-sm:text-2xl text-xl text-emerald-500`}>:</span>
            </h2>
          </div>
          <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-10 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16 '>
            <h2 className=' relative h-[100%] sm:h-[100%] md:h-fit w-full text-3xl | md:text-2-4xl | xl:text-2xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
              <div className="relative  flex flex-col w-full h-full">
                <div className=''>
                  {pernTechStack.map((tech) => (
                    <>
                      <div key={tech.id} className='  group'>
                        <a href={tech.link} className={`group  ${tech.color}`}><span className='text-base text-center p-4'>{`0${tech.id}`}</span> <img
                          src={tech.logo}
                          alt={`${tech.name} logo`}
                          className="w-6 h-6 mr-2 inline-flex"
                        /> {tech.name}</a>
                        <Separator className='my-3 ml-5 w-full group-hover:bg-black      hover:transition duration-300 delay-150' />
                      </div>
                    </>
                  ))}

                </div>
              </div>

            </h2>
          </div>

        </div>
      </div>

      <Separator className='md:mt-20' />

      <FeatureComponent heading='Highlights' subheading='The platform provides investors and borrowers have access to flexible, user-friendly dashboard for investments and loan application processes and various other features ' service={pernHighlight} end=':' />

      <Separator className='mt-10' />
    </>
  )
}

export default Pern_Highlights