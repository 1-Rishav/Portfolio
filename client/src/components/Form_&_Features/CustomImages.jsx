import React from 'react'

function CustomImages({images=[]}) {
  return (
    <>
    
    {images.map((img, index) => (
            <div key={index} className='h-full w-full flex items-center justify-center '>
              <img src={img} alt={`custom-img-${index}`} className=' object-cover rounded-xl h-full w-60 '/>
            </div>
            ))}
            
            
            
        
    </>
  )
}

export default CustomImages