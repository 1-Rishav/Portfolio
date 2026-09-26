import React, { useLayoutEffect, useEffect, useRef, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { gsap } from 'gsap'
import { develop, support } from '../Data/Develop_DesignData'
import CustomImages from '../Form_&_Features/CustomImages'
import FeatureComponent from '../Form_&_Features/FeatureComponent'
import images from '../../assets/index'

const DevelopImages=[
   images.Project1_i,
   images.Project2,
   images.GemX_Logo,
   images.Project1,
   images.Quick_Logo,
   images.Project3,
   images.Project4,
   images.Project5,
   images.Project6,
   images.Project7,
   images.Project8,
   images.Project9
  ]
      // ✅ Image array for loop
      const image = [
        images.Gem2,
        images.Quick1,
        images.Gem3,
        images.Quick2,
        images.Gem4,
        images.Quick3,
        images.Gem5,
        images.Quick5,
      ];

function Develop_Service() {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
const firstSetRef = useRef(null);
    
      // ✅ Change Image in Every 3 Seconds
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % image.length);
        }, 4000); // 👈 Change every 3 seconds
    
        // ✅ Cleanup on unmount
        return () => clearInterval(interval);
      }, []);

      useLayoutEffect(() => {
  const track = carouselRef.current;
  const firstSet = firstSetRef.current;

  if (!track || !firstSet) return;

  const ctx = gsap.context(() => {
    const distance = firstSet.getBoundingClientRect().width;

    if (distance <= 0) return;

    const speed = 50;

    gsap.to(track, {
      x: -distance,
      duration: distance / speed,
      ease: 'none',
      repeat: -1,

      modifiers: {
        x: gsap.utils.unitize(
          gsap.utils.wrap(-distance, 0)
        ),
      },
    });
  }, track);

  return () => ctx.revert();
}, []);

  return (
    <>

      <div className='h-full w-full bg-white brightness-100'>
        <div className=' relative pt-20 pb-10 | lg:pt-32 lg:pb-16 | xl:pt-40 flex max-md:flex-wrap items-center justify-between h-full w-full'>

          <div className='px-2  | sm:px-6 | xl:px-12 | 2xl:px-20 | 3xl:px-40 | 4xl:px-60 h-full w-fit text-5xl font-semibold leading-1 '><li className='text-xl text-gray-600 mb-5 '>Services</li> Got expertise in crafting <br /> full-stack web applications <br />using the MERN and PERN <br /> stack <span className={`font-bold md:text-4xl xl:text-5xl sm:text-3xl max-sm:text-2xl text-xl text-emerald-500`}>.</span></div>
          {/* <div className=' px-2 | lg:px-3 | xl:px-4 w-fit mb-10 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16 '> */}
          <div className=' items-center justify-center max-md:pt-6 h-[12rem] sm:h-[14rem] md:h-[15rem] lg:h-[17rem] xl:h-[22rem] max-md:w-full md:w-[25%] lg:w-[25%] text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
            

              {/* Image */}
              

              
              <img
                src={image[currentIndex]}
                alt=""
                className=" rounded-2xl h-[12rem] sm:h-[14rem] md:h-[15rem] lg:h-[17rem] xl:h-[22rem]  max-md:w-[30%] md:w-[45%] lg:w-[60%] hover:translate-x-2 transition-transform-colors object-cover "
              />
              
            

            {/* </div> */}
          </div>
        </div>
        <div className="w-full flex flex-wrap | md:justify-end"><div className="px-2 | lg:px-3 | xl:px-4"><div className="w-full relative max-w-xl pr-10 | lg:pr-0 lg:max-w-2xl lg:pl-10"><h2 className="mb-3 text-pretty tracking-tight text-black | dark:text-grayDark-100 text-lg md:text-2-5xl xl:text-3xl 4xl:text-4xl leading-tight  font-semibold ">I bring my passion for seamless user experiences and scalable design to ambitious brands, delivering solutions that make an impact <span className={`font-bold md:text-3xl xl:text-4xl sm:text-2xl max-sm:text-xl text-lg text-emerald-500`}>.</span></h2></div></div></div>
      </div>
      <Separator className="mt-16 " />


      <FeatureComponent heading='Develop' subheading='I am passionate about building web solutions that align with your unique business goals. Let’s collaborate to bring your ideas to life and create something impactful together ' service={develop} end='.' />

      <Separator className=" mt-16" />

      <FeatureComponent heading='Support' subheading='I am passionate about building web solutions that align with your unique business goals. Let’s collaborate to bring your ideas to life and create something impactful together ' service={support} end='.' />

      <Separator className='mt-16' />

      {/* <div className='w-full   px-2 | lg:px-3 | xl:px-4 flex flex-row items-center justify-start overflow-x-scroll whitespace-nowrap scroll-smooth [scrollbar-width:none]'>
        <div className='px-2 | sm:px-4 | xl:px-10 | 2xl:px-16 | 3xl:px-32 | 4xl:px-40'>
          <div className='my-10 | lg:my-16 | 2xl:my-20 | 4xl:my-24 w-full py-2 | lg:py-4 | 2xl:py-6 | 4xl:py-8  relative overflow-hidden  rounded-2xl transform-gpu | lg:rounded-3xl | dark:bg-grayDark-500 h-full  flex items-center justify-center bg-black'>

            <div ref={carouselRef} style={{ display: "flex", willChange: "transform" }} className=' h-52  flex  flex-shrink-0 items-center gap-7 overflow-x-auto '>

              <CustomImages img1={GemX} img2={Gemx_front} img3={GemX_home} img4={GemX_logo} img5={QuickFundz} img6={style} img7={GemX_logo} img8={GemX_home} />

            </div>
          </div>
        </div>
      </div> */}

<div className="w-full px-2 lg:px-3 xl:px-4 flex items-center justify-center overflow-hidden">
  <div className="px-2 sm:px-4 xl:px-10 2xl:px-16 3xl:px-32 4xl:px-40 w-full overflow-hidden">

    <div
      className="
        my-10
        lg:my-16
        2xl:my-20
        4xl:my-24
        py-10
        lg:py-14
        2xl:py-24
        4xl:py-32
        rounded-2xl
        lg:rounded-3xl
        w-full
        overflow-hidden
        bg-black
      "
    >

      <div
        ref={carouselRef}
        className="flex w-max items-center will-change-transform"
      >

        {/* First copy */}
        <div
          ref={firstSetRef}
          className="flex shrink-0 gap-7 pr-5"
        >
          <CustomImages images={DevelopImages} />
        </div>

        {/* Second copy */}
        <div
          className="flex shrink-0 gap-7 pr-5"
          aria-hidden="true"
        >
          <CustomImages images={DevelopImages} />
        </div>

      </div>

    </div>

  </div>
</div>
      <Separator className='mt-8' />
    </>
  )
}

export default Develop_Service