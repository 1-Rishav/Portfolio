import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import CustomImages from '../Form_&_Features/CustomImages';
import { Separator } from '@/components/ui/separator'
import { GoArrowUpRight } from 'react-icons/go';
import images from '../../assets/index'

function About() {

  const carouselRight = useRef(null);
  const carouselLeft = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customCursor, setCustomCursor] = useState('default');

  const webImages=[
    images.Skill1,
    images.Skill2,
    images.Skill3,
    images.Skill4,
    images.Skill5,
    images.Skill6,
    images.Skill7,
    images.Skill8,
    images.Skill9,
    images.Skill10,
    images.Skill11,
    images.Skill12,

  ]

  const Web3Images=[
    images.Explore1,
    images.Explore2,
    images.Explore3,
    images.Explore4,
    images.Explore5,
    images.Explore6,
    images.Explore7,
    images.Explore8,
    images.Explore9,
    images.Explore10,
  ]

  // useEffect(() => {
  //   const carousel = carouselRight.current;
  //   const images = Array.from(carousel.children);
  //   const imageWidth = images[0].offsetWidth;

  //   // GSAP Timeline for Smooth Movement
  //   const timeline = gsap.timeline({
  //     repeat: -1, // Infinite loop
  //     defaults: { ease: "linear", duration: 3 }, // Smooth and consistent speed
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
      const carousel = carouselLeft.current;
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
  useEffect(() => {
    const carousel = carouselRight.current;
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

  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
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
  
    const handlePlayPause = () => {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };
  
    const toggleMute = () => {
      setIsMuted((prev) => !prev);
    };
  
    // ✅ Synchronize cursor when isMuted changes
    useEffect(() => {
      setCustomCursor(
        isMuted 
          ?  'url("/icons/volume-2.svg") 20 20, auto'
        : 'url("/icons/volume-x.svg") 20 20, auto'
      );
    }, [isMuted]); // 👈 Trigger on isMuted change
  
    const handleMouseEnter = () => {
      setCustomCursor(
        isMuted 
          ?  'url("/icons/volume-2.svg") 20 20, auto'
        : 'url("/icons/volume-x.svg") 20 20, auto'
      );
    };
  
    const handleMouseLeave = () => {
      setCustomCursor('default');
    };

  return (
    <>

      <div className=' relative pt-14 pb-10 | lg:pt-28 lg:pb-16 | xl:pt-32 flex items-center  justify-center xl:px-20 lg:px-14 md:px-10 max-md:px-5 h-full w-full'>

        <div className=' h-full w-fit md:text-7xl xl:text-9xl sm:text-4xl max-sm:text-2xl text-xl font-semibold leading-1 '>Behind the<br /><span className='flex items-center justify-center'>Code <span className='text-emerald-500'>.</span></span></div>
      </div>
      <Separator />

      <div className='h-full w-full bg-white brightness-100'>
        <div className='flex max-md:flex-wrap items-center justify-between h-full w-full'>
          <div className=' relative max-md:pt-14 max-md:pb-10    flex  flex-wrap items-center justify-center h-full w-full md:w-fit'>

            <div className='md:-mt-24 |xl:-mt-20  px-2  | sm:px-6 | xl:px-12 | 2xl:px-20 | 3xl:px-40 | 4xl:px-60 h-full w-full text-xl md:text-2-4xl xl:text-4xl 4xl:text-5xl font-medium leading-1 '><li className='text-xl text-gray-600 mb-5 '>About me</li> <span className='text-blue-800'>Hi,</span>I'm an expert web designer and developer offering professional services.I create solutions that align with your vision and   business goals <span className={`font-bold md:text-4xl xl:text-5xl sm:text-3xl max-sm:text-2xl text-xl text-emerald-500`}>.</span></div>
          </div>
          <div className="w-fit  flex flex-wrap items-center| md:justify-center"><div className="px-2  | sm:px-6 | xl:px-12 | 2xl:px-20 | 3xl:px-40 | 4xl:px-60"><div className="w-full relative  md:pt-16 pb-6 | lg:pt-24 lg:pb-10 | xl:pt-32 pr-10 | lg:pr-0  lg:pl-10"><h2 className="mb-3 text-pretty tracking-tight text-gray-700 | dark:text-grayDark-100 text-lg md:text-2-4xl xl:text-3xl 4xl:text-3xl leading-tight   ">With years of hands-on experience in web development, I bring <span className='underline'>creativity</span>, technical expertise, and a strong commitment to <span className='underline'>quality </span>.</h2>
            <h2 className="mb-3 mt-5 text-pretty tracking-tight text-gray-700 | dark:text-grayDark-100 text-lg md:text-2-4xl xl:text-3xl 4xl:text-3xl leading-tight   ">I have worked with startups, entrepreneurs, and growing businesses. My approach is <span className='underline'>flexible</span> and dedicated to delivering results that make an impact .</h2></div></div></div>
        </div>
      </div>

      <Separator className="mt-16 " />

       {/* <div className='px-2 | lg:px-3 | xl:px-4 | w-full mt-[2rem] md:mt-[4rem] max-sm:mt-[3rem] md:mb-[3rem] xl:mb-0'>
        <div className='px-2 | sm:px-4 | xl:px-10 | 2xl:px-16 | 3xl:px-32 | 4xl:px-40 h-[14rem] sm:h-[20rem] md:h-[32rem] lg:h-[42rem] 3xl:h-[50rem]  w-full text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-3xl   '>
          <div className='relative group'>

            <img
              src={'GemX'}
              alt=""
              className=" rounded-3xl h-[14rem] sm:h-[20rem] md:h-[32rem] lg:h-[42rem] 3xl:h-[50rem] w-full "
            /> 

          </div>
        </div>
      </div>  */}

      <div className='px-2 | lg:px-3 | xl:px-4 | w-full mt-[2rem] md:mt-[4rem] max-sm:mt-[3rem] md:mb-[3rem] xl:mb-0' style={{ cursor: customCursor }}>
                  <div className=' px-2 | sm:px-4 | xl:px-10 | 2xl:px-16 | 3xl:px-32 | 4xl:px-40 h-[14rem] sm:h-[20rem] md:h-[32rem] lg:h-[42rem] 3xl:h-[50rem]  w-full text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-3xl '>
                    <div className='relative group' onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={toggleMute}>
          
                    <video
                  ref={videoRef}
                  src="/ProjectVideos/about.mp4"
                  className="rounded-3xl h-[14rem] sm:h-[20rem] md:h-[32rem] lg:h-[42rem] 3xl:h-[50rem] w-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                />
      
      <button
                onClick={handlePlayPause}
                className="flex items-center justify-between gap-5 absolute group  bottom-4 right-2 bg-emerald-300 text-black px-1 py-0 | sm:px-2 sm:py-1 | md:px-3 md:py-1 | lg:px-4 lg:py-1 rounded-full shadow-md hover:bg-emerald-500 transition"
              >
                {isPlaying ? 'Pause' : 'Play'}
                <div className="bg-emerald-300 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon"><GoArrowUpRight /></div>
              </button>
         
                    </div>
                    
                  </div>
                </div>

      
      <Separator className="mt-14 " />
      <div className='w-full min-h-screen h-full px-2 | lg:px-3 | xl:px-4 flex  items-center justify-center overflow-hidden overflow-x-scroll whitespace-nowrap scroll-smooth [scrollbar-width:none]'>
        <div className='px-2 | sm:px-4 | xl:px-10 | 2xl:px-16 | 3xl:px-32 | 4xl:px-40 overflow-hidden '>

          <div className=' overflow-hidden  my-10 | lg:my-16 | 2xl:my-20 | 4xl:my-24 py-20 | lg:py-24 | 2xl:py-32 | 4xl:py-40 rounded-2xl | px-2 lg:rounded-3xl w-full min-h-screen h-full flex gap-10 flex-col items-center justify-center bg-black'>
            <div className=' relative  pb-10 | lg:pb-16 |  flex flex-col items-center  justify-center xl:px-20 lg:px-14 md:px-10 max-md:px-5 h-full w-full'>

              <div className=' h-full w-fit md:text-5xl xl:text-7xl sm:text-3xl max-sm:text-xl text-xl font-semibold leading-1 text-white'><li className='md:text-xl text-sm text-gray-400 mb-5 '>Know me</li> Skill is Best Way to Know About<span className='text-emerald-500'>.</span></div>
              <div className='w-full pl-2 | max-sm:pl-5 | md:pl-28 | lg:pl-40 | xl:pl-40 | 4xl:pl-80 mt-5 inline-flex items-start justify-start relative group outline-none  | focus:outline-none '>
                <a href="/contact" className="w-fit mt-5 inline-flex items-start justify-start relative group outline-none  | focus:outline-none "><div className="w-auto  bg-emerald-300 inline-flex items-center justify-center relative leading-tight shadow-none overflow-hidden rounded-full border-default text-gray-600 py-2 px-5"><div className="relative inline-flex items-center justify-center top-px flex-shrink-0 bg-emerald-300"><div>
                  Let's Connect</div></div></div><div className="bg-emerald-300 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon"><GoArrowUpRight /></div></a>
              </div>

            </div>
            <div className=' overflow-hidden  transform-gpu  | dark:bg-grayDark-500 h-[50%] flex  gap-5 items-center justify-center '>

              <div ref={carouselRight} style={{ display: "flex", willChange: "transform" }} className=' h-40  flex flex-shrink-0  items-center gap-7 overflow-x-auto '>

                <CustomImages images={webImages} />

              </div>
            </div>
            <div className='w-full pl-2 | max-sm:pl-5 | md:pl-10 | lg:pl-10 | xl:pl-20 | 4xl:pl-40 mt-5 inline-flex items-start justify-start relative group outline-none  | focus:outline-none '>
                <a className="w-fit mt-5 inline-flex items-start justify-start relative group outline-none  | focus:outline-none "><div className="w-auto  bg-amber-400 inline-flex items-center justify-center relative leading-tight shadow-none overflow-hidden rounded-full border-default text-gray-600 py-2 px-5"><div className="md:text-xl font-bold relative inline-flex items-center justify-center top-px flex-shrink-0 bg-amber-400"><div>
                  Exploring</div></div></div><div className="md:text-xl font-bold bg-amber-400 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | md:w-11 md:h-11 | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-180 | js-button-icon"><GoArrowUpRight /></div></a>
              </div>
            <div className=' overflow-hidden transform-gpu  | dark:bg-grayDark-500 h-[50%] flex   gap-5 items-center justify-center'>

              <div ref={carouselLeft} style={{ display: "flex", willChange: "transform" }} className=' h-40 flex flex-shrink-0  items-center gap-7 overflow-x-auto '>

                <CustomImages images={Web3Images} />

              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default About