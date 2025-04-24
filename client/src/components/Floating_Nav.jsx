"use client";
import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { GoArrowUpRight } from "react-icons/go";

import { cn } from "../utils/cn";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineClose } from "react-icons/ai";
import images from '../assets/index'
import {useDispatch, useSelector} from 'react-redux'
import { LogOut } from "../store/slices/authSlice";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

const MenuItem = ({ setActive, active, item, children, ...props }) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative max-sm:mt-6">
      <motion.p
        transition={{ duration: 0.3 }}
        className="relative cursor-pointer max-md:px-8 max-md:text-5xl max-md:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group"
      >
        {item}
        <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 md:group-hover:w-full"></span>
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-2 md:left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div layout className="w-max h-full p-4" {...props}>
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

const Menu = ({ setActive, children }) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className=" max-lg:hidden relative rounded-full  dark:bg-black  bg-transparent  flex justify-center items-center space-x-4 px-8 py-6 gap-4"
    >
      {children}
    </nav>
  );
};


const ProductItem = ({ title, description, href, src }) => {
  return (
    <Link to={href} className="flex space-x-2">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">{title}</h4>
        <p className="text-neutral-800 text-sm max-sm:max-w-[8rem] md:max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};
export const NavbarDemo = () => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  const [isTop, setIsTop] = useState(true);
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {role}=useSelector(state=>state.auth);
  useMotionValueEvent(scrollYProgress, "change", (current) => {
    const direction = current - scrollYProgress.getPrevious();
    if (current < 0.03) {
      setIsTop(true);
      setVisible(true);
    } else if (current < 0.08) {
      setIsTop(false);
      setVisible(true);
    } else if (direction < 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  const containerClassName = isTop
    ? "flex max-w-sm sm:max-w-[90%] lg:max-w-[90%] h-14 lg:h-20 fixed top-3 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black z-[5000] pr-2 pl-8 py-2 items-center justify-between "
    : "flex max-w-sm sm:max-w-screen-lg lg:max-w-screen-lg h-14 lg:h-20 fixed top-3 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black white-glassmorphism shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2 items-center justify-between";

    const handleLogout = async()=>{
      dispatch(LogOut());
      navigate('/', { replace: true })
    }
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 1, y: -100 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={containerClassName}
        >
          <motion.div onClick={()=>navigate('/')} className="text-3xl cursor-pointer hover:text-emerald-500 hover:duration-100 hover:transition-all hover:animate-pulse  hover:ease-in-out font-bold">Rishav</motion.div>
          <Menu setActive={setActive} >
            {role==="admin" ? (
              <>
              <button onClick={() => navigate('/admin/connections')} className="relative cursor-pointer max-sm:px-5 max-sm:text-5xl max-sm:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
              Connections
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 sm:group-hover:w-full"></span>
            </button>
              <button onClick={() => navigate('/admin/assignedProjects')} className="relative cursor-pointer max-sm:px-5 max-sm:text-5xl max-sm:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
              AssignedProjects
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 sm:group-hover:w-full"></span>
            </button>
              </>
              
            ):
            (<>
            
            <MenuItem setActive={setActive} active={active} item="Highlights" >
              <div className=" text-sm grid justify-start items-center  md:grid-cols-2 gap-4 md:gap-10 p-1 md:p-4">
                <ProductItem
                  title="MERN Pride Project"
                  src={images.Gem2}
                  description="Prepare for tech interviews like never before."
                  href='/mern-highlights'
                />
                <ProductItem
                  title="PERN Pride Project"
                  src={images.Quick1}
                  description="Production ready Tailwind css components for your next project"
                  href='/pern-highlights'
                />

              </div>
            </MenuItem>
            <MenuItem setActive={setActive} active={active} item="Services">
              <div className=" text-sm grid justify-start items-center  md:grid-cols-2 gap-4 md:gap-10 p-1 md:p-4">

                <ProductItem
                  title="Web Development"
                  href='/develop-services'
                  src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
                  description="Never write from scratch again. Go from idea to blog in minutes."
                />
                <ProductItem
                  title="Web Design"
                  href='/design-services'
                  src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
                  description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
                />
              </div>
            </MenuItem>

            <button onClick={() => navigate('/about')} className="relative cursor-pointer max-sm:px-5 max-sm:text-5xl max-sm:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
              About
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 sm:group-hover:w-full"></span>
            </button>



            <button onClick={()=>navigate('/contact')} className="relative cursor-pointer max-sm:px-5 max-sm:text-5xl max-sm:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
              Contact
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 sm:group-hover:w-full"></span>
            </button>
            <button onClick={()=>navigate('/tech_lab')} className="relative cursor-pointer max-sm:px-5 max-sm:text-5xl max-sm:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
              Labs
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 sm:group-hover:w-full"></span>
            </button>
            </>
            )
            }
            
            {/*<MenuItem setActive={setActive} active={active} item="Contact">
               <div className="flex flex-col space-y-4 text-medium">
                <Link to="/hobby">Hobby</Link>
                <Link to="/individual">Individual</Link>
                <Link to="/team">Team</Link>
                <Link to="/enterprise">Enterprise</Link>
              </div> 
            </MenuItem>*/}
          </Menu>

          <motion.div className="flex  items-center justify-center space-x-4 ">

            {open && (
              <motion.div className=" absolute z-10 lg:hidden  left-0  h-[70vh] w-[100vw] rounded-xl  bg-neutral-100 flex flex-col gap-5 top-20">
                {role==="admin" ?(
                  <>
                  <div onClick={()=>navigate('/admin/connections')} className="relative cursor-pointer max-lg:px-8 max-sm:text-3xl md:text-5xl  max-lg:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
                  Connections
                   <span className="ml-10  absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 max-sm:group-hover:w-[50%]  group-hover:w-[22%]"></span>
                </div>
                  <div onClick={()=>navigate('/admin/assignedProjects')} className="relative cursor-pointer max-lg:px-8 max-sm:text-3xl md:text-5xl  max-lg:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
                  AssignedProjects
                   <span className="ml-10  absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 max-sm:group-hover:w-[70%] group-hover:w-[22%]"></span>
                </div>

                <div onClick={handleLogout} className="top-10 px-8 inline-flex relative group outline-none  | focus:outline-none "><div className="w-auto bg-emerald-300
inline-flex
items-center
justify-center
relative
leading-tight
shadow-none
overflow-hidden
rounded-full
border-default
 text-gray-600 py-2 px-5"><div className=" cursor-pointer relative inline-flex items-center justify-center top-px flex-shrink-0 bg-emerald-300"><div>
                    Logout</div></div></div><div className="bg-emerald-300 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon"><GoArrowUpRight /></div></div>
                  </>
                ):(
                  <>
                  <div onClick={()=>navigate('/highlights')} className="relative cursor-pointer max-lg:px-8 max-lg:text-5xl  max-lg:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
                  Highlights
                   <span className="ml-10  absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 max-sm:group-hover:w-[52%] group-hover:w-[26%]"></span>
                </div>
                <div onClick={()=>navigate('/services')} className="relative cursor-pointer max-lg:px-8 max-lg:text-5xl max-lg:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
                  Services
                  <span className="ml-10  absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 max-sm:group-hover:w-[40%] group-hover:w-[20%]"></span>
                </div>
                <div onClick={()=>navigate('/about')} className="relative cursor-pointer max-lg:px-8 max-lg:text-5xl max-md:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
                  About
                  <span className="ml-10  absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 max-sm:group-hover:w-[32%] group-hover:w-[15%]"></span>
                </div>
                <div onClick={()=>navigate('/contact')} className="relative cursor-pointer max-lg:px-8 max-lg:text-5xl max-md:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
                  Contact
                  <span className="ml-10  absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 max-sm:group-hover:w-[40%] group-hover:w-[20%]"></span>
                </div>
                <div onClick={()=>navigate('/tech_lab')} className="relative cursor-pointer max-lg:px-8 max-lg:text-5xl max-md:font-semibold text-xl font-semibold text-black hover:opacity-[0.9] dark:text-white group">
                  Labs
                  <span className="ml-10  absolute left-0 bottom-0 h-[2px] w-0 bg-black dark:bg-white transition-all duration-1000 max-sm:group-hover:w-[24%] group-hover:w-[11%]"></span>
                </div>
                {/* <MenuItem setActive={setActive} active={active} item="Pricing">
              <div className="flex flex-col space-y-4 text-medium">
                <Link to="/hobby">Hobby</Link>
                <Link to="/individual">Individual</Link>
                <Link to="/team">Team</Link>
                <Link to="/enterprise">Enterprise</Link>
              </div>
            </MenuItem> */}

                <a href="/assign-project" className="top-10 px-8 inline-flex relative group outline-none  | focus:outline-none "><div className="w-auto bg-emerald-300
inline-flex
items-center
justify-center
relative
leading-tight
shadow-none
overflow-hidden
rounded-full
border-default
 text-gray-600 py-2 px-5"><div className="relative inline-flex items-center justify-center top-px flex-shrink-0 bg-emerald-300"><div>
                    Assign project</div></div></div><div className="bg-emerald-300 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon"><GoArrowUpRight /></div></a>
                  </>
                )}
                
              </motion.div>

            )}

            <button
              onClick={() => setOpen(!open)}
              className=" lg:hidden h-10 w-10 rounded-full bg-transparent dark:bg-neutral-800 flex flex-col items-center justify-center">
              {open ? (<AiOutlineClose className="h-7 w-6 text-black dark:text-neutral-400" />) : (<RxHamburgerMenu className="h-7 w-6 text-black dark:text-neutral-400" />)
              }

            </button>
            {/* <button className="max-sm:hidden animate-pulse bg-emerald-200 border text-md font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full">
              <span>Assign Project</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
            </button> */}
            {role==='admin' ? (
<>
<div onClick={handleLogout} className=" max-lg:hidden inline-flex relative group outline-none  | focus:outline-none "><div className="w-auto bg-emerald-300
inline-flex
items-center
justify-center
relative
leading-tight
shadow-none
overflow-hidden
rounded-full
border-default
 text-gray-600 py-2 px-5"><div className=" cursor-pointer relative inline-flex items-center justify-center top-px flex-shrink-0 bg-emerald-300"><div>
                Logout</div></div></div><div className="bg-emerald-300 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon"><GoArrowUpRight /></div></div>
</>
            ):(
<>
<a href="/assign-project" className=" max-lg:hidden inline-flex relative group outline-none  | focus:outline-none "><div className="w-auto bg-emerald-300
inline-flex
items-center
justify-center
relative
leading-tight
shadow-none
overflow-hidden
rounded-full
border-default
 text-gray-600 py-2 px-5"><div className="relative inline-flex items-center justify-center top-px flex-shrink-0 bg-emerald-300"><div>
                Assign project</div></div></div><div className="bg-emerald-300 flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3  xl:group-hover:rotate-45 | js-button-icon"><GoArrowUpRight /></div></a>
</>
            )}
            

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};