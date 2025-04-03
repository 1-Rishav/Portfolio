import React, { useEffect, useRef, useState} from 'react'
import { gsap } from 'gsap'
import { Separator } from '@/components/ui/separator'
import { design, other } from '../Data/Develop_DesignData'
import CustomImages from '../Form_&_Features/CustomImages'
import FeatureComponent from '../Form_&_Features/FeatureComponent'
import images from '../../assets/index'
function Design_Service() {
  const carouselRef = useRef(null);
  const videoRef = useRef(null);
  //const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              videoRef.current.play();
              //setIsPlaying(true);
            } else {
              videoRef.current.pause();
              //setIsPlaying(false);
            }
          },
          { threshold: 0.5 }
        );
    
        if (videoRef.current) {
          observer.observe(videoRef.current);
        }
    
        return () => {
          if (videoRef.current) {
            observer.unobserve(videoRef.current);
          }
        };
      }, []);


  // useEffect(() => {
  //   const carousel = carouselRef.current;
  //   const images = Array.from(carousel.children);
  //   const imageWidth = images[0].offsetWidth;

  //   // GSAP Timeline for Smooth Movement
  //   const timeline = gsap.timeline({
  //     repeat: -1, // Infinite loop
  //     defaults: { ease: "linear", duration: 2 }, // Smooth and consistent speed
  //   });

  //   timeline.to(carousel, {
  //     x: `+=${imageWidth}`, // Move the carousel left by one image width
  //     onComplete: () => {
  //       // Reposition logic for smooth prepend
  //       const firstImage = carousel.firstElementChild;
  //       const lastImage = carousel.lastElementChild;

  //       // Clone the last image to visually prepend it
  //       const cloneLastImage = lastImage.cloneNode(true);
  //       carousel.insertBefore(cloneLastImage, firstImage);

  //       // Adjust carousel position to include the cloned image smoothly
  //       gsap.set(carousel, { x: `+=${imageWidth}` });

  //       // Remove the actual last image to avoid duplication
  //       lastImage.remove();
  //     },
  //   });

  //   return () => {
  //     timeline.kill(); // Cleanup GSAP animation on unmount
  //   };
  // }, []);

useEffect(() => {
      const carousel = carouselRef.current;
      const images = Array.from(carousel.children);
      const imageWidth = images[0].offsetWidth;
  
      // Set initial position to create space for smooth transition
      gsap.set(carousel, { x: `-${imageWidth}px` });
  
      // GSAP Timeline for Smooth Movement
      const timeline = gsap.timeline({
        repeat: -1, // Infinite loop
        defaults: { ease: "linear", duration: 5 }, // Smooth and consistent speed
      });
  
      timeline.to(carousel, {
        x: `+=${imageWidth}`, // Move carousel to the right
        onComplete: () => {
          // Clone the last image instead of moving it
          const lastImage = carousel.lastElementChild;
          const cloneLastImage = lastImage.cloneNode(true);
  
          // Prepend the cloned image to the front
          carousel.insertBefore(cloneLastImage, carousel.firstElementChild);
  
          // Instantly shift the position backward to maintain smoothness
          gsap.set(carousel, { x: `-${imageWidth}px` });
  
          // Remove the original last image to prevent duplication
          lastImage.remove();
        },
      });
  
      return () => {
        timeline.kill(); // Cleanup GSAP animation on unmount
      };
    }, []);
  

  return (
    <>

      <div className='h-full w-full bg-white brightness-100'>
        <div className=' relative pt-20 pb-10 | lg:pt-32 lg:pb-16 | xl:pt-40   flex max-md:flex-wrap items-center justify-between h-full w-full'>

          <div className='px-2  | sm:px-6 | xl:px-12 | 2xl:px-20 | 3xl:px-40 | 4xl:px-60 h-full w-fit text-5xl font-semibold leading-1 '><li className='text-xl text-gray-600 mb-5 '>Services</li> Got expertise in crafting <br /> digital experiences that<br />connect brands with their <br />audiences .</div>
          {/* <div className=' px-2 | lg:px-3 | xl:px-4 w-fit mb-10 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16 '> */}
          
          <div className=' items-center justify-center max-md:pt-6 h-[12rem] sm:h-[14rem] md:h-[15rem] lg:h-[17rem] xl:h-[22rem] max-md:w-full md:w-[25%] lg:w-[25%] text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
            

              {/* Image */}
              <video
              ref={videoRef}
                src={images.AdvertiseVideo}
                alt=""
                loop
                playsInline
                  preload="auto"
                className=" rounded-2xl h-[12rem] sm:h-[14rem] md:h-[15rem] lg:h-[17rem] xl:h-[22rem]  max-md:w-[30%] md:w-[45%] lg:w-[60%] hover:translate-x-2 transition-transform-colors object-cover "
              />
           

            {/* </div> */}
          </div>
        </div>
        <div className="w-full flex flex-wrap | md:justify-end justify-center"><div className="px-2 | lg:px-3 | xl:px-4"><div className="w-full relative max-w-xl  | lg:pr-0 lg:max-w-2xl lg:pl-10"><h2 className="mb-3 text-pretty tracking-tight text-black | dark:text-grayDark-100 text-lg md:text-2-5xl xl:text-3xl 4xl:text-4xl leading-tight  font-semibold ">My goal is to deliver user-centered designs that are responsive, intuitive, and aligned with the client’s vision .</h2></div></div></div>
      </div>
      <Separator className="mt-16 " />

      <FeatureComponent heading=' Design' subheading='As a web designer, I blend creativity with functionality to ensure that each website not only looks stunning but also performs seamlessly ' service={design} end='.' />

      <Separator className=" mt-16" />

      <FeatureComponent heading='Other' subheading='I ensure that each project is cohesive, user-centric, and aligned with your brand’s goals.Let’s work together to design something extraordinary ' service={other} end='!' />

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

                <CustomImages img1={images.Project1_i} img2={images.Project2} img3={images.GemX_Logo} img4={images.Project1} img5={images.Quick_Logo} img6={images.Project3} img7={images.Project4} img8={images.Project5} img9={images.Project6} img10={images.Project7} img11={images.Project8} img12={images.Project9} />

              </div>
            </div>
            </div>
            </div>
            </div>

      <Separator className='' />
    </>
  )
}

export default Design_Service