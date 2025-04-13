import React, { useEffect, useRef, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { gsap } from 'gsap'
import { develop, support } from '../Data/Develop_DesignData'
import CustomImages from '../Form_&_Features/CustomImages'
import FeatureComponent from '../Form_&_Features/FeatureComponent'
import images from '../../assets/index'

function Develop_Service() {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
    
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
    
      // ✅ Change Image in Every 3 Seconds
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % image.length);
        }, 4000); // 👈 Change every 3 seconds
    
        // ✅ Cleanup on unmount
        return () => clearInterval(interval);
      }, []);

  // useEffect(() => {
  //   const carousel = carouselRef.current;

  //   if (carousel) {
  //     // Clone carousel items to create the looping effect
  //     const items = Array.from(carousel.children);
  //     items.forEach((item) => {
  //       const clone = item.cloneNode(true);
  //       carousel.appendChild(clone); // Add clone to the end
  //     });

  //     const totalWidth = carousel.scrollWidth / 2; // Half width for the original set

  //     // GSAP infinite scrolling animation
  //     gsap.to(carousel, {
  //       x: `-${totalWidth}px`, // Move to the left by the width of the original set
  //       duration: 80, // Adjust speed
  //       repeat: -1, // Infinite loop
  //       ease: "linear", // Smooth motion
  //       modifiers: {
  //         x: (x) => (parseFloat(x) % totalWidth) + "px", // Reset position when reaching the end
  //       },
  //     });
  //   }
  // }, []);


  useEffect(() => {
    const carousel = carouselRef.current;
    const images = Array.from(carousel.children);
    const imageWidth = images[0].offsetWidth;

    // GSAP Timeline for Smooth Movement
    const timeline = gsap.timeline({
      repeat: -1, // Infinite loop
      defaults: { ease: "linear", duration: 5 }, // Smooth and consistent speed
    });

    timeline.to(carousel, {
      x: `-=${imageWidth}`, // Move carousel to the right
      onComplete: () => {
        // Clone the first image instead of moving it
        const firstImage = carousel.firstElementChild;
        const cloneFirstImage = firstImage.cloneNode(true);

        // Append the cloned image to the end
        carousel.appendChild(cloneFirstImage);

        // Remove the original first image
        firstImage.remove();

        // Reset position to avoid jump
        gsap.set(carousel, { x: `+=${imageWidth}` });
      },
    });

    return () => {
      timeline.kill(); // Cleanup GSAP animation on unmount
    };
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

<div className='w-full  h-full px-2 | lg:px-3 | xl:px-4 flex  items-center justify-center overflow-hidden overflow-x-scroll whitespace-nowrap scroll-smooth [scrollbar-width:none]'>
        <div className='px-2 | sm:px-4 | xl:px-10 | 2xl:px-16 | 3xl:px-32 | 4xl:px-40 overflow-hidden '>

          <div className=' overflow-hidden  my-10 | lg:my-16 | 2xl:my-20 | 4xl:my-24 py-10 | lg:py-14 | 2xl:py-24 | 4xl:py-32 rounded-2xl | px-2 lg:rounded-3xl w-full  h-full flex gap-10 flex-col items-center justify-center bg-black'>
           
            <div className=' overflow-hidden  transform-gpu  | dark:bg-grayDark-500 h-[50%] flex  gap-5 items-center justify-center '>

              <div ref={carouselRef} style={{ display: "flex", willChange: "transform" }} className=' h-40  flex flex-shrink-0  items-center gap-7 overflow-x-auto '>

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