import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  // Scroll event handler to toggle 'scrolled' state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Clean up listener on unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Date time updater (optional, from your previous)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const options = {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setCurrentDateTime(now.toLocaleString("en-US", options));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <header
        className={`
            fixed w-full z-50 transition-all duration-500
            ${scrolled
            ? "bg-white backdrop-blur-md shadow-md"
            : "bg-white/40 backdrop-blur-sm"
            }
        `}
        >
        <div className="w-full text-center text-white py-2 bg-green-500 bg-opacity-50 z-20">
            <span>{currentDateTime}</span>
        </div>
        <div className="container mx-auto flex justify-between items-center px-6 mt-2 mb-2">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-950 text-transparent bg-clip-text">
              B-Sphere
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-white font-extrabold hover:text-blue-600 transition duration-300">
              Home
            </Link>
            <Link href="#news" className="text-white font-extrabold hover:text-blue-600 transition duration-300">
              News
            </Link>
            <Link href="#services" className="text-white font-extrabold hover:text-blue-600 transition duration-300">
              Services
            </Link>
            <Link href="#about" className="text-white font-extrabold hover:text-blue-600 transition duration-300">
              About Us
            </Link>
          </nav>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-blue-600 font-medium py-2 hover:text-blue-800 transition duration-300"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
