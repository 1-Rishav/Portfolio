import React, { useEffect } from 'react'
import { HeroParallaxDemo } from '../../components/HeroParalax';
import { TimelineDemo } from '../../components/TimeLineData';
import { AppleCardsCarouselDemo } from '../../components/Carousel';
import { BackgroundBoxesDemo } from '../../components/Background_Boxes';
import { BackgroundBeamsWithCollisionDemo } from '../../components/Footer_BeamsCollision';
import { NavbarDemo } from '../../components/Floating_Nav';
import ContactForm from '../../components/Form_&_Features/ContactForm'
import {Separator} from '@/components/ui/separator'


function Main() {

  return (
    <>
    <NavbarDemo />
       <HeroParallaxDemo /> 
    <TimelineDemo />
     <AppleCardsCarouselDemo/> 
     <BackgroundBoxesDemo/>
     <Separator className='mt-28'/>
     <ContactForm/>
     <BackgroundBeamsWithCollisionDemo />
    </>
  )
}

export default Main