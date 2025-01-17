import React from 'react'
import Contact from '../../components/NavNavigation/Contact'
import { BackgroundBeamsWithCollisionDemo } from '../../components/Footer_BeamsCollision'
import { NavbarDemo } from '../../components/Floating_Nav'
function ContactPage() {
  return (
    <>
    <NavbarDemo/>
    <Contact/>
    <BackgroundBeamsWithCollisionDemo/>
    </>
  )
}

export default ContactPage