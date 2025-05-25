import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BarangayOfficialsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3; // 12 officials ÷ 4 per slide = 3 slides
  const timeoutRef = useRef(null);
  
  // Official data - 12 barangay officials with names and positions
  const officials = [
    { name: "Hon. Maria Santos", position: "Barangay Captain", image: "/api/placeholder/200/200" },
    { name: "Hon. Juan Dela Cruz", position: "Barangay Secretary", image: "/api/placeholder/200/200" },
    { name: "Hon. Ana Reyes", position: "Barangay Treasurer", image: "/api/placeholder/200/200" },
    { name: "Hon. Pedro Lim", position: "Kagawad - Peace & Order", image: "/api/placeholder/200/200" },
    { name: "Hon. Elena Morales", position: "Kagawad - Health", image: "/api/placeholder/200/200" },
    { name: "Hon. Miguel Castro", position: "Kagawad - Education", image: "/api/placeholder/200/200" },
    { name: "Hon. Sofia Garcia", position: "Kagawad - Infrastructure", image: "/api/placeholder/200/200" },
    { name: "Hon. Rafael Tan", position: "Kagawad - Youth & Sports", image: "/api/placeholder/200/200" },
    { name: "Hon. Isabella Cruz", position: "Kagawad - Environment", image: "/api/placeholder/200/200" },
    { name: "Hon. Gabriel Mendoza", position: "Kagawad - Senior Citizens", image: "/api/placeholder/200/200" },
    { name: "Hon. Carmen Villanueva", position: "SK Chairperson", image: "/api/placeholder/200/200" },
    { name: "Hon. Antonio Aquino", position: "Barangay Executive Officer", image: "/api/placeholder/200/200" },
  ];

  // Reset the auto slide interval when the slide changes
  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds
    
    return () => {
      resetTimeout();
    };
  }, [currentSlide, totalSlides]);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  // Get current slide's officials (4 per slide)
  const getCurrentSlideOfficials = () => {
    const startIndex = currentSlide * 4;
    return officials.slice(startIndex, startIndex + 4);
  };
  
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-blue-50 to-gray-50" id="officials">
      <div className="container mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-blue-600 font-medium">Our Team</span>
          <h2 className="text-3xl font-bold mt-2 mb-6">Meet Our Barangay Officials</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Dedicated public servants working together to build a stronger, safer, and more prosperous community.
          </p>
        </div>
        
        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto px-4">
          {/* Carousel Navigation Buttons */}
          <button 
            onClick={goToPrevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={goToNextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
          
          {/* Carousel Slides */}
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out" 
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Generate all slides */}
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="min-w-full flex gap-4 px-2">
                  {officials.slice(slideIndex * 4, slideIndex * 4 + 4).map((official, officialIndex) => (
                    <div 
                      key={officialIndex} 
                      className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-1"
                      data-aos="fade-up" 
                      data-aos-delay={officialIndex * 100}
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img 
                          src={official.image} 
                          alt={official.name} 
                          className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg">{official.name}</h3>
                        <p className="text-blue-600 mt-1">{official.position}</p>
                        <div className="flex gap-3 mt-4">
                          <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                            <span className="sr-only">Facebook</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                          </a>
                          <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                            <span className="sr-only">Email</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-blue-600 w-6" : "bg-gray-300"
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}