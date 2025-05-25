import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "phosphor-react";

const HeroSection = () => {
  return (
    <section
      className="relative pt-50 pb-20 bg-cover text-white overflow-hidden"
      style={{ backgroundImage: "url('/images/bhall.jpg')" }}
    >
      <div className="container mx-auto px-6 relative z-10 flex justify-center items-center">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left content */}
          <div data-aos="fade-right" className="text-center bg-white/50 p-6 rounded-2xl">
            <span className="inline-block px-3 py-1 bg-blue-800 rounded-full text-sm font-medium mb-4">
              Barangay San Francisco Information Management System
            </span>
            <div className="flex justify-center mb-4">
              <Image
                src="/images/brgy_seal2.png"
                alt="Barangay San Francisco Seal"
                width={300}
                height={300}
                className="rounded-full"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 transform hover:translate-y-1">
                Button 1
                <ArrowRight size={18} />
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-lg font-medium transition-all duration-300">
                Button 2
              </button>
            </div>
          </div>

          {/* Right image */}
          <div data-aos="fade-left" data-aos-delay="200" className="hidden md:block">
            <div
              className="relative h-96 w-full flex justify-center items-center"
              style={{ top: "120px", left: "80px" }}
            >
              <Image
                src="/images/kap.png"
                alt="kap"
                fill
                className="rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#fff"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
