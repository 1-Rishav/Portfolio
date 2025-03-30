import React from 'react'
import About from  '../../components/Navigation/About'
import { NavbarDemo } from '../../components/Floating_Nav'
import { BackgroundBeamsWithCollisionDemo } from '../../components/Footer_BeamsCollision'
function AboutPage() {
  return (
    <>
    <NavbarDemo/>
    <About/>
    <BackgroundBeamsWithCollisionDemo/>
    </>
  )
}

export default AboutPage