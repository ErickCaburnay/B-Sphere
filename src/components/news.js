import React from "react";

const announcements = [
  {
    id: 1,
    color: "green",
    date: "May 20, 2025",
    title: "Monthly Barangay Clean-up Drive",
    description:
      "Join us this Saturday at 8 AM for our monthly clean-up drive. Let's work together to keep our barangay clean!",
    category: "Community",
    categoryBg: "bg-green-100",
    categoryText: "text-green-800",
    icon: (
      <svg
        className="w-5 h-5 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
    ),
  },
  {
    id: 2,
    color: "yellow",
    date: "May 15, 2025",
    title: "Vaccination Schedule Update",
    description:
      "The next vaccination schedule will be on the 15th of this month at the barangay health center. Be sure to register online.",
    category: "Health",
    categoryBg: "bg-yellow-100",
    categoryText: "text-yellow-800",
    icon: (
      <svg
        className="w-5 h-5 text-yellow-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        ></path>
      </svg>
    ),
  },
  {
    id: 3,
    color: "blue",
    date: "May 10, 2025",
    title: "Barangay Council Meeting",
    description:
      "Attend the Barangay Council meeting on the 10th. Important decisions regarding local projects and budgets.",
    category: "Governance",
    categoryBg: "bg-blue-100",
    categoryText: "text-blue-800",
    icon: (
      <svg
        className="w-5 h-5 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        ></path>
      </svg>
    ),
  },
];

const BarangayAnnouncements = () => {
  return (
    <section
      className="py-24 px-4  bg-gradient-to-br from-blue-600 to-indigo-800 relative overflow-hidden bg-cover"
      id="announcements"
      style={{ backgroundImage: "url('/images/bg_news.jpg')" }}
    >
      {/* Background pattern elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-green-800"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-green-800"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-green-800"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block py-1 px-3 rounded-full border-2 border-solid border-orange-500 bg-orange-100 text-orange-500 text-sm font-medium mb-4">
            Stay Updated
          </span>
          <h2 className="text-4xl text-black font-bold mb-4">Barangay Announcements</h2>
          <p className="text-gray-900 text-lg max-w-2xl mx-auto">
            Important news, events, and updates from your local community. Check here regularly to stay informed.
          </p>
        </div>

        {/* Announcements Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map(({ id, color, date, title, description, category, categoryBg, categoryText, icon }) => (
            <div
              key={id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={id * 100}
            >
              <div className={`h-3 bg-${color}-500`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center mr-3`}>
                    {icon}
                  </div>
                  <span className="text-xs font-medium text-gray-500">{date}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className={`text-xs ${categoryBg} ${categoryText} py-1 px-2 rounded-full`}>{category}</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                    Details
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center" data-aos="fade-up" data-aos-delay="400">
          <button className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-md">
            View All Announcements
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BarangayAnnouncements;
