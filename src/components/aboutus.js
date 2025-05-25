import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";

const tabs = [
  {
    id: "mission",
    label: "Our Mission",
    content:
      "A barangay that is God-centered, capable, organized, honest, peaceful, trustworthy, gender-responsive, and committed to upholding the Code of Conduct.",
    image: "/images/mission.png",
  },
  {
    id: "vision",
    label: "Our Vision",
    content:
      "We practice transparency, integrity, professionalism, and efficiency, offering free services as public servants. We hold ourselves accountable to the residents of Barangay San Francisco.",
    image: "/images/vision.png",
  },
  {
    id: "goal",
    label: "Our Goal",
    content:
      "Barangay San Francisco strives to deliver efficient public service, recognizing that public office is a public trust. We commit to being accountable, responsible, loyal, and efficient; to act with patriotism and justice; and to live modestly. Barangay San Francisco is determined to overcome any obstacles that prevent it from becoming the best.",
    image: "/images/goal.png",
  },
];


const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

const AboutUsSection = () => {
  const [activeTab, setActiveTab] = useState("mission");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <section
      ref={ref}
      className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-14 items-center"
    >
      {/* Left Image with fade & slide animation triggered on scroll */}
      <motion.div
        key={activeTab}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
            hidden: { opacity: 0, x: -40 },
            visible: { opacity: 1, x: 0, transition: { duration: 1.2, ease: "easeOut" } },
        }}
        className="rounded-xl shadow-lg overflow-hidden"
        >
        <Image
            src={tabs.find((tab) => tab.id === activeTab)?.image || "/images/about_us_photo.jpg"}
            alt="About Us Tab Image"
            width={600}
            height={600}
            className="object-cover w-full h-full"
            priority
        />
        </motion.div>

      {/* Right Text Content with scroll-triggered fade-in */}
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.3, ease: "easeOut", duration: 1, } },
        }}
      >
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 1 } },
          }}
          className="text-blue-600 uppercase tracking-wide font-semibold mb-3"
        >
          About Us
        </motion.p>

        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 },
          }}
          className="text-4xl font-extrabold leading-tight mb-6 text-gray-900"
        >
          A change in your city sparks change across the world.
        </motion.h2>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 },
          }}
          className="text-gray-600 font-bold mb-10 max-w-lg"
        >
          Barangay San Francisco is determined to address everything that hinder its
          way to be the best.
        </motion.p>

        {/* Tabs Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Animated Content Text */}
        <AnimatePresence mode="popLayout" exitBeforeEnter>
          <motion.p
            key={activeTab}
            variants={containerVariants}
            initial={false} // Prevents re-animation on initial mount
            animate="visible"
            exit="exit"
            layout // Helps animate position changes smoothly
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="text-gray-500 leading-relaxed max-w-xl"
          >
            {activeContent}
          </motion.p>
        </AnimatePresence>

        {/* Contact + Captain Info */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.6 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-8"
        >
          <div>
            <p className="text-gray-600 mb-1">Call To Ask Any Questions</p>
            <a
              href="tel:+0468846599"
              className="text-blue-600 text-xl font-bold hover:underline"
            >
              (046) 884 6599
            </a>
          </div>

          <div className="flex items-center gap-5">
            <Image
              src="/images/kap.png"
              alt="Barangay Captain Jeffrey C."
              width={70}
              height={70}
              className="rounded-full object-cover shadow-md"
              priority
            />
            <div>
              <p className="text-gray-600 text-sm">Barangay Captain</p>
              <p className="font-bold text-xl text-gray-900">Juan Dela Cruz</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutUsSection;
