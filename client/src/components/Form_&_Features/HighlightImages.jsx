import React,{useEffect,useRef , useState} from 'react'
import { GoArrowUpRight } from 'react-icons/go';


function HighlightImages({videoSrc ,  img2 , img3}) {


  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customCursor, setCustomCursor] = useState('default');

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
        ?'url("/icons/volume-2.svg") 20 20, auto'
        : 'url("/icons/volume-x.svg") 20 20, auto'
    );
  };

  const handleMouseLeave = () => {
    setCustomCursor('default');
  };

  return (
    <>
    <div className='px-2 | lg:px-3 | xl:px-4  mb-5 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  w-[94vw] md:mt-[10rem] max-sm:mt-[8rem] md:mb-[2rem] xl:mb-0' style={{ cursor: customCursor }}>
            <div className=' h-[16rem] sm:h-[25rem] md:h-[40rem] 3xl:h-[50rem]  w-full text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   '>
              <div className='relative group' onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleMute}>
    
              <video
            ref={videoRef}
            src={videoSrc}
            className="rounded-2xl h-[16rem] sm:h-[25rem] md:h-[40rem] 3xl:h-[50rem] w-full object-cover"
            loop
            muted={isMuted}
            playsInline
            preload="auto"
          />

<button
          onClick={handlePlayPause}
          className="flex items-center text-center justify-evenly gap-5 absolute group  bottom-2 right-2 bg-emerald-300 text-black px-1 py-0 | sm:px-2 sm:py-1 | md:px-3 md:py-1 | lg:px-4 lg:py-1 rounded-full shadow-md hover:bg-emerald-500 transition"
        >
          
          {isPlaying ? 'Pause' : 'Play'}
          <div className="bg-emerald-300 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon"><GoArrowUpRight /></div>
          
        </button>
   
              </div>
              
            </div>
          </div>
    
          <div className=' flex max-md:flex-wrap items-center justify-between gap-1  w-[94vw] md:h-[100vh]'>
            <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-5 | pl-10 md:pl-14 | lg:pl-24 | xl:pl-[6rem]  lg:mb-0 lg:w-7/16 '>
              <div className='h-[16rem] sm:h-[25rem] md:h-[40rem] lg:h-[90vh] w-full md:w-[104%] text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
                <div className="relative group">
                  <img
                    src={img2}
                    alt=""
                    className=" rounded-2xl h-[16rem] sm:h-[25rem] md:h-[40rem] lg:h-[90vh] w-full  object-cover"
                  />
                </div>
    
              </div>
            </div>
            <div className=' px-2 | lg:px-3 | xl:px-4 w-full mb-5 | max-md:pl-10 md:ml-2  lg:mb-0 lg:w-7/16  '>
              <div className='h-[16rem] sm:h-[25rem] md:h-[40rem] lg:h-[90vh] w-full text-3xl | md:text-2-5xl | xl:text-3xl | 4xl:text-4xl font-sans-primary tracking-tight text-black  | dark:text-grayDark-100 leading-tight text-balance  lg:pr-0  bg-transparent  rounded-2xl   flex '>
                <div className="relative group">
    
                  {/* Image */}
                  <img
                    src={img3}
                    alt=""
                    className=" rounded-2xl h-[16rem] sm:h-[25rem] md:h-[40rem] lg:h-[90vh] w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
    </>

  )
}

export default HighlightImages