import React from "react";

// 4.5: every caller (About's two tickers since 4.2, the Develop/Design showcase ticker as of this task) now
// passes a resolved { src, alt } pair - the transitional plain-string branch 4.2 added for the not-yet-migrated
// callers is gone, since there are none left.
function CustomImages({ images = [] }) {
  return (
    <>
      {images.map(({ src, alt }, index) => (
        <div
          key={`${index}-${src}`}
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
            src={src}
            alt={alt}
            draggable={false}
            className="w-full h-full object-cover block rounded-xl"
          />
        </div>
      ))}
    </>
  );
}

export default CustomImages;
