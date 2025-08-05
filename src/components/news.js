"use client";

import React, { useState, useEffect } from "react";
import AnnouncementDetailModal from "./AnnouncementDetailModal";
import ViewAllAnnouncementsModal from "./ViewAllAnnouncementsModal";

const BarangayAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements?status=published&limit=6');
        const result = await response.json();
        
        if (result.success) {
          setAnnouncements(result.data);
        } else {
          console.error('Failed to fetch announcements:', result.error);
          setAnnouncements([]);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Helper function to get styling based on category
  const getCategoryStyling = (category) => {
    const categoryMap = {
      'Community': { bg: 'bg-green-100', text: 'text-green-800', color: 'green' },
      'Health': { bg: 'bg-yellow-100', text: 'text-yellow-800', color: 'yellow' },
      'Governance': { bg: 'bg-blue-100', text: 'text-blue-800', color: 'blue' },
      'Education': { bg: 'bg-purple-100', text: 'text-purple-800', color: 'purple' },
      'Safety': { bg: 'bg-red-100', text: 'text-red-800', color: 'red' },
      'Events': { bg: 'bg-pink-100', text: 'text-pink-800', color: 'pink' }
    };
    return categoryMap[category] || categoryMap['Community'];
  };

  // Helper function to get icon based on category
  const getCategoryIcon = (category, color) => {
    const iconMap = {
      'Community': (
        <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      'Health': (
        <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      ),
      'Governance': (
        <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      ),
      'Education': (
        <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
      'Safety': (
        <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      'Events': (
        <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
        </svg>
      )
    };
    return iconMap[category] || iconMap['Community'];
  };

  // Transform database announcements to display format
  const transformAnnouncements = (dbAnnouncements) => {
    return dbAnnouncements.map((announcement, index) => {
      const styling = getCategoryStyling(announcement.category);
      return {
        id: announcement.id,
        color: styling.color,
        date: new Date(announcement.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        title: announcement.title,
        description: announcement.description,
        category: announcement.category,
        categoryBg: styling.bg,
        categoryText: styling.text,
        icon: getCategoryIcon(announcement.category, styling.color),
        views: announcement.views || 0,
        imageUrl: announcement.imageUrl || ''
      };
    });
  };

  // Transform announcements data
  const displayAnnouncements = loading ? [] : transformAnnouncements(announcements);

  // Create duplicated array for endless scrolling
  const getScrollingAnnouncements = () => {
    if (displayAnnouncements.length === 0) return [];
    
    // If we have few announcements, duplicate them to ensure smooth scrolling
    let scrollingData = [...displayAnnouncements];
    while (scrollingData.length < 9) { // Ensure we have enough cards for smooth scrolling
      scrollingData = [...scrollingData, ...displayAnnouncements];
    }
    
    // Create two sets for seamless loop
    return [...scrollingData, ...scrollingData];
  };

  const scrollingAnnouncements = getScrollingAnnouncements();

  // Add CSS for endless scrolling animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-left {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      
      .scroll-container {
        animation: scroll-left 20s linear infinite;
      }
      
      .scroll-container.paused {
        animation-play-state: paused;
      }
      
      .scroll-card {
        min-width: 320px;
        max-width: 320px;
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Sample data as fallback
  const getSampleAnnouncements = () => [
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

  return (
    <section
      className="py-24 px-4 bg-gradient-to-br from-blue-600 to-indigo-800 relative overflow-hidden bg-cover"
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
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full border-2 border-solid border-orange-500 bg-orange-100 text-orange-500 text-sm font-medium mb-4">
            Stay Updated
          </span>
          <h2 className="text-4xl text-black font-bold mb-4">Barangay Announcements</h2>
          <p className="text-gray-900 text-lg max-w-2xl mx-auto">
            Important news, events, and updates from your local community. Check here regularly to stay informed.
          </p>
        </div>

        {/* Endless Scrolling Announcements */}
        {scrollingAnnouncements.length > 0 ? (
          <div className="overflow-hidden">
            <div 
              className={`flex gap-6 scroll-container ${isPaused ? 'paused' : ''}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {scrollingAnnouncements.map((announcement, index) => {
                const { id, color, date, title, description, category, categoryBg, categoryText, icon, views, imageUrl } = announcement;
                return (
                  <div
                    key={`${id}-${index}`}
                    className="scroll-card"
                  >
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:translate-y-[-2px] transition-all duration-300 h-full">
                      <div className={`h-2 bg-${color}-500`}></div>
                      {imageUrl && (
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center mb-3">
                          <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center mr-2`}>
                            {icon}
                          </div>
                          <span className="text-xs font-medium text-gray-500">{date}</span>
                        </div>
                        <h3 className="font-semibold text-base mb-2">{title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className={`text-xs ${categoryBg} ${categoryText} py-1 px-2 rounded-full`}>{category}</span>
                          <div className="flex items-center gap-2">
                            {views > 0 && (
                              <span className="text-xs text-gray-500">{views} views</span>
                            )}
                            <button 
                              onClick={() => {
                                // Find the original announcement data from the announcements array
                                const originalAnnouncement = announcements.find(a => a.id === id);
                                setSelectedAnnouncement(originalAnnouncement);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                            >
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="ml-3 text-white text-lg">Loading announcements...</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements Yet</h3>
                <p className="text-gray-600">Check back later for important updates from your barangay.</p>
              </div>
            )}
          </div>
        )}

        {/* View all button */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => setShowAllModal(true)}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-md"
          >
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

      {/* Modals */}
      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
      
      <ViewAllAnnouncementsModal
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
      />
    </section>
  );
};

export default BarangayAnnouncements;