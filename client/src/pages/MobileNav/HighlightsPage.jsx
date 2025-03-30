import React from 'react'
import { NavbarDemo } from '../../components/Floating_Nav'
import { BackgroundBeamsWithCollisionDemo } from '../../components/Footer_BeamsCollision'
import Highlights from '../../components/MobileNavigation/Highlights'

const HighlightsPage = () => {
  return (
    <>
    <NavbarDemo/>
    <Highlights/>
    <BackgroundBeamsWithCollisionDemo/>
    </>
  )
}

export default HighlightsPage