import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16 pb-8 px-6">
      <div className="container mx-auto">
        {/* Top Section with Logo and Seals */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1 className="text-3xl font-bold text-white">B-Sphere</h1>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[
                { label: "Cavite", key: "cavite" },
                { label: "General Trias", key: "gtc" },
                { label: "San Francisco", key: "brgy" },
            ].map((item, index) => {
                const sealPaths = {
                cavite: "/images/cavite_seal.png",
                gtc: "/images/gtc_seal.png",
                brgy: "/images/brgy_seal.png",
                };

    return (
      <div key={index} className="flex flex-col items-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-2">
          <img
            src={sealPaths[item.key]}
            alt={`${item.label} Seal`}
            className="w-16 h-16 rounded-full object-contain"
          />
        </div>
        <span className="text-xs text-gray-400">{item.label} Seal</span>
      </div>
    );
  })}
</div>


        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Modern solutions for modern barangays. Empowering local governance through technology.
            </p>
            <div className="flex space-x-4 mt-4">
              {["blue-600", "blue-400", "red-600"].map((color, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center hover:bg-${color} transition-all duration-300 shadow-md`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {["Quick Links", "Resources"].map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg mb-5 flex items-center">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block mr-3"></span>
                {section}
              </h3>
              <ul className="space-y-3">
                {[
                  "Features",
                  "How It Works",
                  "Pricing",
                  "Testimonials",
                  "FAQ",
                ].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-semibold text-lg mb-5 flex items-center">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block mr-3"></span>
              Contact Us
            </h3>
            <ul className="space-y-4">
              {[
                { icon: "phone", text: "+63 (2) 8123 4567" },
                { icon: "email", text: "info@bsphere.ph" },
                { icon: "map", text: "Makati City, Philippines" },
              ].map((contact, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-400">🔹</span>
                  <span>{contact.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block mr-3"></span>
                Newsletter
              </h3>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-900/20"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative mt-16">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <div className="text-center text-gray-400 text-sm mt-8">
            <p>© {new Date().getFullYear()} B-Sphere. All rights reserved.</p>
            <p className="mt-2 text-xs text-gray-500">
              A modern solution for empowering local governance
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;