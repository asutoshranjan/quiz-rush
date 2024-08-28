import React from "react";

export function GridBackgroundDemo({children, url}: {children?: React.ReactNode, url?: string}) {
  return (
    <div className="min-h-screen w-full bg-light-pink bg-grid-black/[0.2] relative flex items-center justify-center">
      { url && <div
          className="absolute inset-0 bg-cover bg-center rounded-lg"
          style={{
           backgroundImage: `url(${url})`,
           backgroundSize: "cover",
           backgroundPosition: "center",
           }}
       />}
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-tea-green [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {/* <p className="text-4xl sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
        Backgrounds
      </p> */}
      {children}
    </div>
  );
}
