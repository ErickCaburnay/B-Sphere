// layout
"use client";
import {
  Bell, UserCircle, LayoutDashboard, Users, Home, User, Settings,
  FileText, Folder, Archive, ClipboardList, Menu, X, Activity,
  Sun, Moon, MessageCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from '@/components/ui/ThemeContext';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';
import AccountMenu from '@/components/AccountMenu';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to true for desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // New state for collapsed mode
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNavigating, setIsNavigating] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Optimize time updates with useCallback
  const updateTime = useCallback(() => {
    setCurrentTime(new Date());
  }, []);

  useEffect(() => {
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [updateTime]);

  // Handle client-side mounting and responsive behavior
  useEffect(() => {
    setIsClient(true);
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, start with collapsed sidebar (icon-only)
      if (mobile) {
        setSidebarOpen(true);
        setSidebarCollapsed(true);
      } else {
        // On desktop, keep sidebar behavior as is
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add navigation loading state
  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    // Listen for route changes
    const originalPush = router.push;
    router.push = (...args) => {
      handleStart();
      return originalPush.apply(router, args).finally(handleComplete);
    };

    return () => {
      router.push = originalPush;
    };
  }, [router]);

  const formatTime = useCallback((date) =>
    date.toLocaleTimeString("en-PH", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }), []);

  const formatDate = useCallback((date) =>
    date.toLocaleDateString("en-PH", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    }), []);

  // Handle sidebar toggle for mobile
  const handleMobileSidebarToggle = () => {
    if (isMobile) {
      if (sidebarOpen && !sidebarCollapsed) {
        // If expanded, collapse to icons
        setSidebarCollapsed(true);
      } else if (sidebarOpen && sidebarCollapsed) {
        // If collapsed, close completely
        setSidebarOpen(false);
      } else {
        // If closed, open in collapsed (icon-only) mode
        setSidebarOpen(true);
        setSidebarCollapsed(true);
      }
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Handle sidebar collapse/expand for desktop and mobile
  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Calculate sidebar width based on state
  const getSidebarWidth = () => {
    if (!sidebarOpen) return 0;
    if (sidebarCollapsed) return "72px"; // Icon-only width for both mobile and desktop
    if (isMobile) return "200px"; // Reduced width for mobile when expanded
    return "256px"; // Full width (w-64) for desktop when expanded
  };

  const sidebarWidth = getSidebarWidth();

  return (
    <div className="font-sans text-gray-900 min-h-screen flex flex-col">
      {/* Performance Monitor */}
      <PerformanceMonitor />
      
      {/* Navigation Loading Indicator */}
      {isNavigating && (
        <div className="fixed top-0 left-0 w-full h-1 bg-green-600 z-50 animate-pulse">
          <div className="h-full bg-green-400 animate-pulse"></div>
        </div>
      )}

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
        <div className="flex justify-between items-center py-3 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image 
              src="/images/logo.png" 
              alt="Logo" 
              width={40} 
              height={40}
              priority
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-950 text-transparent bg-clip-text">
              B-Sphere
            </h1>
          </div>
          <div className="hidden md:block text-center">
            <div className="text-sm text-gray-700">{formatDate(currentTime)}</div>
            <div className="text-lg font-semibold text-green-700">{formatTime(currentTime)}</div>
          </div>
          <div className="flex items-center gap-3">
            <AccountMenu />
            <MessageCircle size={24} className="text-green-700" />
            <Bell size={24} className="text-green-700" />
            {/* Neumorphic Toggle Switch for Dark Mode with icon inside thumb */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className={`relative w-14 h-8 flex items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-[#3a3d4d]' : 'bg-gray-200'}`}
              style={{ boxShadow: darkMode
                ? 'inset 2px 2px 8px #232533, inset -2px -2px 8px #44475a'
                : 'inset 2px 2px 8px #e0e0e0, inset -2px -2px 8px #ffffff' }}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${darkMode ? 'translate-x-6 bg-gray-500' : 'translate-x-0 bg-white'}`}
                style={{ boxShadow: darkMode
                  ? '2px 2px 6px #232533, -2px -2px 6px #44475a'
                  : '2px 2px 6px #e0e0e0, -2px -2px 6px #ffffff' }}
              >
                {darkMode ? <Moon size={18} className="text-yellow-300" /> : <Sun size={18} className="text-yellow-400" />}
              </span>
            </button>
            <button className="md:hidden" onClick={handleMobileSidebarToggle}>
              {sidebarOpen && !sidebarCollapsed ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay - only show when sidebar is expanded (not collapsed) */}
      {isMobile && sidebarOpen && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-[64px] left-0 z-40 h-[calc(100vh-64px)] text-white shadow-xl transform transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: sidebarWidth,
          backgroundImage: "url('/images/hero_bg.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
        >
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-700/90 via-green-800/50 to-green-900/30"></div>
        
        {/* Splash screen effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-transparent to-green-900/25 pointer-events-none"></div>
        
        {/* Additional decorative elements for splash effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/8 to-transparent rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-green-300/12 to-transparent rounded-full translate-y-12 -translate-x-12 pointer-events-none"></div>
        
        {/* Content wrapper with relative positioning to appear above overlays */}
        <div className={`relative z-10 h-full flex flex-col ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Header with collapse button */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-4`}>
            {!sidebarCollapsed && (
              <h3 className="text-sm font-semibold text-white/90"></h3>
            )}
            <button
              onClick={handleSidebarCollapse}
              className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm ${sidebarCollapsed ? 'w-full' : ''}`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Brgy Logo and Name */}
          {!sidebarCollapsed && (
            <div className="flex flex-col items-center justify-center py-6 mb-6 border-b border-white/20 backdrop-blur-sm bg-white/5 rounded-xl">
                <div className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} mb-3 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20`}>
                  <Image
                  src="/images/brgy_seal2.png"
                  alt="Barangay Seal"
                  width={isMobile ? 60 : 80}
                  height={isMobile ? 60 : 80}
                  className="rounded-full"
                  loading="lazy"
                  />
                </div>
                <h2 className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-center leading-tight text-white drop-shadow-lg`}>
                Barangay San Francisco
                </h2>
            </div>
          )}

          {/* Collapsed Logo */}
          {sidebarCollapsed && (
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
                <Image
                src="/images/brgy_seal2.png"
                alt="Barangay Seal"
                width={40}
                height={40}
                className="rounded-full"
                loading="lazy"
                />
              </div>
            </div>
          )}
          
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <SidebarLink icon={<LayoutDashboard size={18} />} label="Dashboard" href="/dashboard" collapsed={sidebarCollapsed} />
            <SidebarLink icon={<User size={18} />} label="Officials" href="/dashboard/officials" collapsed={sidebarCollapsed} />
            <SidebarLink icon={<Users size={18} />} label="Resident Records" href="/dashboard/residents" collapsed={sidebarCollapsed} />
            <SidebarLink icon={<Home size={18} />} label="Households" href="/dashboard/household" collapsed={sidebarCollapsed} />
            <SidebarLink icon={<Settings size={18} />} label="Services" href="/dashboard/services" collapsed={sidebarCollapsed} />
            <SidebarLink icon={<Folder size={18} />} label="Complaints" href="/dashboard/complaints" collapsed={sidebarCollapsed} />
            <SidebarLink icon={<FileText size={18} />} label="Reports" href="/dashboard/reports" collapsed={sidebarCollapsed} />          
            <SidebarLink icon={<Activity size={18} />} label="Logs" href="/dashboard/logs" collapsed={sidebarCollapsed} />
            <SidebarLink icon={<ClipboardList size={18} />} label="Module 9" href="/dashboard/module9" collapsed={sidebarCollapsed} />
            <SidebarLink icon={<Settings size={18} />} label="Module 10" href="/dashboard/module10" collapsed={sidebarCollapsed} />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="pt-[96px] px-4 md:px-8 transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? sidebarWidth : '0'
        }}
      >
        {/* Loading overlay for navigation */}
        {isNavigating && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <span className="text-lg text-green-700">Loading...</span>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, href, collapsed = false }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const isActive = pathname === href;

  const handleClick = useCallback((e) => {
    if (pathname !== href) {
      setIsLoading(true);
      // Reset loading state after navigation
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [pathname, href]);

  return (
    <Link href={href} passHref>
      <div 
        className={`flex items-center ${collapsed ? 'justify-center px-1 py-3 mx-1' : 'gap-3 px-3 py-2.5'} rounded-lg transition-all duration-200 cursor-pointer relative backdrop-blur-sm group ${
          isActive 
            ? 'bg-white/25 font-semibold shadow-md border border-white/30 text-white' 
            : 'hover:bg-white/15 hover:shadow-sm border border-transparent hover:border-white/20 text-white/85 hover:text-white'
        }`}
        onClick={handleClick}
        title={collapsed ? label : undefined}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </div>
        )}
        <div className={`flex-shrink-0 ${collapsed ? 'text-white' : ''} ${isActive ? 'text-white' : 'text-white/75'}`}>
          {icon}
        </div>
        {!collapsed && (
          <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-white/85'}`}>
            {label}
          </span>
        )}
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900/90 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-sm">
            {label}
            <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
          </div>
        )}
      </div>
    </Link>
  );
}

