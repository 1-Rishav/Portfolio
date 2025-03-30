import React from 'react'
import Develop_Service from '../../components/Navigation/Develop_Service'
import { BackgroundBeamsWithCollisionDemo } from '../../components/Footer_BeamsCollision'
import { NavbarDemo } from '../../components/Floating_Nav'
function Develop_ServicePage() {
  return (
<>
<NavbarDemo/>
      <Develop_Service/>
      <BackgroundBeamsWithCollisionDemo/>
</>
  )
}

export default Develop_ServicePage