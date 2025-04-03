import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

export const HeroParallax = ({ products }) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), springConfig);
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), springConfig);
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), springConfig);
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), springConfig);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), springConfig);
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), springConfig);

  return (
    
    <div
      ref={ref}
      className="h-[280vh] lg:h-[248vh] md:-top-20 top-0 pt-36  overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        
         <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20 ">
          {firstRow.map((product) => (
            <ProductCard product={product} translate={translateX} key={product.id} />
          ))}
        </motion.div> 
        
        <motion.div className="flex flex-row mb-20 space-x-20 ">
          {secondRow.map((product) => (
            <ProductCard product={product} translate={translateXReverse} key={product.id} />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 ">
          {thirdRow.map((product) => (
            <ProductCard product={product} translate={translateX} key={product.id} />
          ))}
        </motion.div>
      </motion.div>
    </div>
    
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto pt-20 md:pt-24 px-4 w-full left-0 ">
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
       <span className='text-3xl md:text-8xl font-bold text-emerald-500'>Hi,</span>  Its <br /> Rishav Raj
      </h1>
      <p className="max-w-2xl text-base md:text-2xl font-semibold mt-8 dark:text-neutral-200">
      A passionate and detail-oriented web developer specializing in crafting high-quality digital solutions. With expertise in the MERN and PERN stack, I build seamless web applications that combine functionality with great design. I'm here to bring your ideas to life with clean, efficient, and innovative web solutions <span className='text-2xl md:text-4xl text-emerald-600'>.</span>
      </p>
      
    </div>
  );
};

export const ProductCard = ({ product, translate }) => {
  return (
    
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-64 w-[30rem] relative flex-shrink-0"
      
    >
      <Link target='_blank' to={product.link} className="block group-hover/product:shadow-2xl ">
     
        <img
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-fill object-left-top absolute h-full w-full inset-0"
          alt={product.title}
        />
        
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
         {product.title} 
      </h2>
    </motion.div>
  );
};
