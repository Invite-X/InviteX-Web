import React from "react";
import config from "@/config.json";

export default function AuthenticateComponent(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex md:flex-row flex-col md:justify-center items-center w-screen md:h-screen md:gap-0 gap-10">
      {/*<img
        className="object-cover absolute w-screen h-screen opacity-60"
        src="https://adarshaijaz.my.canva.site/invitex/images/6fd20ef7e1402985ae7c67d32cf425df.jpg"
      />*/}
      <div className="flex z-20 flex-col justify-center items-center w-1/2 h-full bg-transparent">
        <div className="font-sans md:text-7xl text-5xl lg:text-9xl font-extrabold">
          {config.name}
        </div>
        <div className="font-sans md:text-2xl text-xl lg:text-4xl tagline">
          {config.tagline}
        </div>
      </div>
      <div className="flex z-20 justify-center items-center w-1/2 h-full bg-transparent">
        {props.children}
      </div>
    </div>
  );
}
