import React, { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const floatAnimation = {
  y: [0, -15, 0], // up 15px then back down
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const fadeSlideVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const BrgyCaptainPortfolio = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
  ref={ref}
  className="relative py-20 px-6 overflow-hidden"
>
  {/* Blurred Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center filter blur-xs scale-105 z-0"
    style={{ backgroundImage: "url('/images/officials.jpg')" }}
  />

  {/* Content layout with z-10 so it stays clear */}
  <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-center">
    
    {/* Left Side: Captain Image */}
    <motion.div
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeSlideVariants}
      className="relative w-full max-w-md mx-auto md:mx-0 rounded-3xl overflow-visible"
    >
      <Image
        src="/images/kap.png"
        alt="Barangay Captain"
        width={400}
        height={500}
        className="object-cover rounded-3xl"
        priority
      />

      {/* Floating Quote Box */}
      <motion.div
        animate={floatAnimation}
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-xl px-10 py-5 shadow-lg w-80 text-center z-30"
        style={{ boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
      >
        <p className="text-gray-700 italic font-semibold">
          "Leadership is not a position, it's an action."
        </p>
      </motion.div>
    </motion.div>

    {/* Right Side: Text Content */}
    <motion.div
  initial="hidden"
  animate={isInView ? "visible" : "hidden"}
  variants={fadeSlideVariants}
  transition={{ delay: 0.3 }}
  className="flex flex-col justify-center max-w-xl mx-auto md:mx-0"
>
  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
    <p className="text-blue-600 uppercase tracking-wide font-semibold mb-2">
      Barangay Captain
    </p>
    <h2 className="text-4xl font-extrabold mb-4 text-gray-900">Juan Dela Cruz</h2>
    <p className="text-gray-900 mb-6">
      Captain Jeffrey C. is a dedicated public servant with over 15 years of experience in
      community leadership. Committed to transparency, integrity, and improving the lives of
      every resident in Barangay San Francisco.
    </p>
    <button
      type="button"
      className="self-start bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
    >
      Learn More
    </button>
  </div>
</motion.div>
  </div>
</section>

  );
};

export default BrgyCaptainPortfolio;
