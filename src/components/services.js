"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, IdCard, FileText, FilePlus, Users, Home, ClipboardCheck, CalendarCheck, Book, Shield, Search } from "lucide-react";
import { ChartBar, User, ScrollText, ShieldCheck, Building2, Stamp, Layers3 } from "lucide-react";

import Link from "next/link";


const services = [
  { title: "Barangay ID", icon: IdCard, gradient: "from-blue-500 to-blue-700" },
  { title: "Barangay Clearance", icon: FileText, gradient: "from-green-500 to-green-700" },
  { title: "Certificate of Indigency", icon: ScrollText, gradient: "from-purple-500 to-purple-700" },
  { title: "Certificate of Residency", icon: User, gradient: "from-amber-500 to-amber-700" },
  { title: "Business Clearance", icon: ClipboardCheck, gradient: "from-cyan-500 to-cyan-700" },
  { title: "Barangay Certification", icon: Stamp, gradient: "from-red-500 to-red-700" },
  { title: "Solo Parent Certification", icon: ShieldCheck, gradient: "from-fuchsia-500 to-fuchsia-700" },
  { title: "Senior Citizen ID", icon: Building2, gradient: "from-lime-500 to-lime-700" },
  { title: "PWD ID", icon: Layers3, gradient: "from-rose-500 to-rose-700" },
  { title: "Good Moral Certificate", icon: FileText, gradient: "from-indigo-500 to-indigo-700" },
];

const ServicesCarousel = () => {
  return (
    <section className="py-20 px-6 bg-gray-50 overflow-hidden relative" id="services">
      <div className="container mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-blue-600 font-medium">Our Services</span>
          <h2 className="text-3xl font-bold mt-2 mb-6">What We Offer</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore the range of certificates and clearances available to every resident of Barangay San Francisco.
          </p>
        </div>

        <div className="flex space-x-6 animate-scroll-slow w-[200%]">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${service.gradient} p-1 rounded-xl min-w-[220px] w-[220px] h-[360px]
                            transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl`}
                data-aos="fade-up"
                data-aos-delay={100 + index * 100}
              >
                <div className="bg-white h-full p-6 rounded-lg flex flex-col">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                    <Icon size={24} className="text-gray-800" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
                  <p className="text-sm text-gray-600 mb-6 flex-grow">
                    Secure and easy access to official Barangay services.
                  </p>
                  <Link
                    href="#"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-all"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <style jsx>{`
          @keyframes scroll-slow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-slow {
            animation: scroll-slow 60s linear infinite;
          }
        `}</style>
      </div>
    </section>
  );
};

export default ServicesCarousel;
