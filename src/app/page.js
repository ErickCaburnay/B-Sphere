"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Users, FileText, ChartBar, ShieldCheck } from "lucide-react";

// AOS Animation Library Import
import AOS from "aos";
import "aos/dist/aos.css";
import BarangayOfficialsCarousel from "@/components/officials";
import AboutUsSection from "@/components/aboutus";
import Navbar from "@/components/header";
import HeroSection from "@/components/hero";
import BarangayAnnouncements from "@/components/news";
import BrgyCaptainPortfolio from "@/components/brgycapportfolio";
import Footer from "@/components/footer";
import ServicesCarousel from "@/components/services";
import BrgyProjects from "@/components/brgyprojects";
import HowItWorksSection from "@/components/howitworks";
import LandingIntroSection from "@/components/landingintrosection";
import BarangayFaqSection from "@/components/barangayfaqsection";

const Home = () => {
  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: false,
      mirror: true,
    });
  }, []);

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">
      {/* NavBar */}
      <section className="fixed w-full z-50 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300">
        <Navbar/>
      </section>

      {/* Hero Section with Wave */}
      <section >
        <HeroSection/>
      </section>


      {/* Barangay Announcements Section */}
      <section>
        <BarangayAnnouncements />
      </section>

      {/* About Us Section */}
      <section className="bg-white">
        <AboutUsSection />
      </section>

      {/* Brgy Captain Portfolio */}
      <section>
        <BrgyCaptainPortfolio />
      </section>

      {/* Services */}
      <section>
        <ServicesCarousel />
      </section>


      {/* How It Works - Timeline */}
      <section>
        <HowItWorksSection />
      </section>


      {/* Brgy Projects */}
      <section>
        <BrgyProjects/>
      </section>

      {/* Officials Carousel Section */}
      <section className="testimonial-section bg-gray-50 py-12">
        <BarangayOfficialsCarousel />
      </section>

      {/* Landing intro */}
      <section >
        <LandingIntroSection />
      </section>

      {/* FAQ Section */}
      <section>
        <BarangayFaqSection />
      </section>

      {/* Footer */}
      <section className="testimonial-section bg-gray-50 py-12">
        <Footer/>
      </section>
      </div>
  );
};

export default Home;