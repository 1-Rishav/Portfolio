import React from "react";

function CustomImages({ images = [] }) {
  return (
    <>
      {images.map((img, index) => (
        <div
          key={`${index}-${img}`}
          className="
            w-[180px]
            sm:w-[200px]
            lg:w-[280px]
            xl:w-[300px]
            aspect-[16/9]
            shrink-0
            flex-none
            overflow-hidden
            rounded-xl
            bg-black
          "
        >
          <img
            src={img}
            alt={`custom-img-${index}`}
            draggable={false}
            className="w-full h-full object-cover block rounded-xl"
          />
        </div>
      ))}
    </>
  );
}

export default CustomImages;
