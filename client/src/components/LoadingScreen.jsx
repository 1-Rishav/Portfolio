import React from 'react'
import {ColorRing} from 'react-loader-spinner'
const LoadingScreen = () => {
  return (
    <div><ColorRing
    visible={true}
    height="30"
    width="30"
    ariaLabel="color-ring-loading"
    wrapperStyle={{}}
    wrapperClass="color-ring-wrapper"
    colors={['#D3D3D3','#D3D3D3','#D3D3D3','#D3D3D3','#D3D3D3']}
    /></div>
  )
}

export default LoadingScreen