import React, { useEffect } from 'react'
import { HeroParallaxDemo } from '../../components/HeroParalax';
import { TimelineDemo } from '../../components/TimeLineData';
import { AppleCardsCarouselDemo } from '../../components/Carousel';
import { BackgroundBoxesDemo } from '../../components/Background_Boxes';
import { BackgroundBeamsWithCollisionDemo } from '../../components/Footer_BeamsCollision';
import { NavbarDemo } from '../../components/Floating_Nav';


function Main() {

  return (
    <>
    <NavbarDemo />
       <HeroParallaxDemo /> 
    <TimelineDemo />
     <AppleCardsCarouselDemo/> 
     <BackgroundBoxesDemo/>
     <BackgroundBeamsWithCollisionDemo />
    </>
  )
}

export default Main