"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  FileText, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Home,
  Settings,
  HelpCircle,
  BarChart3,
  Calendar,
  Bell,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  MessageCircle
} from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeContext';
import AccountMenu from '@/components/AccountMenu';
import { NotificationProvider } from '@/components/ui/NotificationContext';
import NotificationBell from '@/components/ui/NotificationBell';
import NotificationTest from '@/components/ui/NotificationTest';
import { AuthProvider } from '@/lib/auth-context';

export default function ResidentDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    // Get user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if no user data
      router.push('/login');
    }

    // Handle responsive behavior
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(true);
        setSidebarCollapsed(true);
      } else {
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Fetch latest resident data from API and update sidebar
    const fetchLatestResident = async (id) => {
      if (!id) return;
      try {
        const res = await fetch(`/api/residents/${id}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      } catch (e) {
        // Ignore errors, fallback to localStorage
      }
    };
    // Listen for residentDataUpdated event
    const handleResidentDataUpdate = (event) => {
      const { residentId } = event.detail || {};
      const id = residentId || (user && (user.uniqueId || user.residentId || user.id));
      fetchLatestResident(id);
    };
    window.addEventListener('residentDataUpdated', handleResidentDataUpdate);
    // On mount, fetch latest data
    const id = userData ? (JSON.parse(userData).uniqueId || JSON.parse(userData).residentId || JSON.parse(userData).id) : null;
    fetchLatestResident(id);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('residentDataUpdated', handleResidentDataUpdate);
    };
  }, [router]);

  useEffect(() => {
    // Poll for real-time updates to resident name - OPTIMIZED: Reduced frequency
    let pollingInterval = null;
    const pollResidentName = () => {
      const id = user?.uniqueId || user?.residentId || user?.id;
      if (!id) return;
      fetch(`/api/residents/${id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && (data.firstName !== user?.firstName || data.middleName !== user?.middleName || data.lastName !== user?.lastName)) {
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          }
        })
        .catch(() => {});
    };
    // OPTIMIZATION: Reduced from 5000ms to 30000ms (30 seconds)
    pollingInterval = setInterval(pollResidentName, 30000);
    return () => {
      clearInterval(pollingInterval);
    };
  }, [user]);

  // Add navigation loading state
  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    // Listen for route changes
    const originalPush = router.push;
    router.push = (...args) => {
      handleStart();
      const result = originalPush.apply(router, args);
      handleComplete();
      return result;
    };

    return () => {
      router.push = originalPush;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMobileSidebarToggle = () => {
    if (isMobile) {
      if (sidebarOpen && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      } else if (sidebarOpen && sidebarCollapsed) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        setSidebarCollapsed(true);
      }
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getSidebarWidth = () => {
    if (!sidebarOpen) return 0;
    if (sidebarCollapsed) return "72px";
    if (isMobile) return "200px";
    return "256px";
  };

  const sidebarWidth = getSidebarWidth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/resident-dashboard',
      icon: BarChart3,
      current: pathname === '/resident-dashboard'
    },
    {
      name: 'Personal Info',
      href: '/resident-dashboard/personal-info',
      icon: User,
      current: pathname === '/resident-dashboard/personal-info'
    },
    {
      name: 'Notifications',
      href: '/resident-dashboard/notifications',
      icon: Bell,
      current: pathname === '/resident-dashboard/notifications'
    },
    {
      name: 'Document Request',
      href: '/resident-dashboard/document-request',
      icon: FileText,
      current: pathname === '/resident-dashboard/document-request'
    },
    {
      name: 'File a Complaint',
      href: '/resident-dashboard/file-complaint',
      icon: MessageSquare,
      current: pathname === '/resident-dashboard/file-complaint'
    },
    {
      name: 'Module 4',
      href: '/resident-dashboard/module-4',
      icon: Settings,
      current: pathname === '/resident-dashboard/module-4',
      placeholder: true
    },
    {
      name: 'Module 5',
      href: '/resident-dashboard/module-5',
      icon: HelpCircle,
      current: pathname === '/resident-dashboard/module-5',
      placeholder: true
    },
    {
      name: 'Module 6',
      href: '/resident-dashboard/module-6',
      icon: Home,
      current: pathname === '/resident-dashboard/module-6',
      placeholder: true
    },
  ];

  const formatTime = useCallback((date) =>
    date.toLocaleTimeString("en-PH", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }), []);

  const formatDate = useCallback((date) =>
    date.toLocaleDateString("en-PH", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    }), []);

  return (
    <AuthProvider>
      <NotificationProvider>
      <div className="font-sans text-gray-900 min-h-screen flex flex-col">
        {/* Navigation Loading Indicator */}
        {isNavigating && (
          <div className="fixed top-0 left-0 w-full h-1 bg-blue-600 z-50 animate-pulse">
            <div className="h-full bg-blue-400 animate-pulse"></div>
          </div>
        )}

        {/* Fixed Header */}
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
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-950 text-transparent bg-clip-text">
                B-Sphere
              </h1>
            </div>
            
            <div className="hidden md:block text-center">
              <div className="text-sm text-gray-700">{formatDate(currentTime)}</div>
              <div className="text-lg font-semibold text-blue-700">{formatTime(currentTime)}</div>
            </div>
            
            <div className="flex items-center gap-3">
              <AccountMenu />
              <NotificationBell />
              <MessageCircle size={24} className="text-blue-700" />
              {/* Neumorphic Toggle Switch for Dark Mode with icon inside thumb */}
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className={`relative w-14 h-8 flex items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-[#3a3d4d]' : 'bg-gray-200'}`}
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

        {/* Mobile Overlay */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-blue-700/90 via-blue-800/50 to-blue-900/30"></div>
          
          {/* Splash screen effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-blue-900/25 pointer-events-none"></div>
          
          {/* Additional decorative elements for splash effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/8 to-transparent rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-blue-300/12 to-transparent rounded-full translate-y-12 -translate-x-12 pointer-events-none"></div>
          
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

            {/* Barangay Logo and Name */}
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
                <p className="text-blue-200 text-xs mt-1">Resident Portal</p>
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

            {/* User info */}
            {!sidebarCollapsed && (
              <div className="px-2 py-4 mb-4 border-b border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="sidebar-user-info">
                    <div className="sidebar-user-name font-bold text-lg">
                      {user?.firstName} {user?.middleName ? user.middleName.charAt(0) + '. ' : ''}{user?.lastName}
                    </div>
                    <div className="sidebar-user-id text-xs text-gray-400">ID: {user?.uniqueId || user?.residentId}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarLink
                    key={item.name}
                    icon={<Icon size={18} />}
                    label={item.name}
                    href={item.href}
                    collapsed={sidebarCollapsed}
                    isActive={item.current}
                    placeholder={item.placeholder}
                  />
                );
              })}
            </nav>

            {/* Logout button */}
            <div className="pt-4 border-t border-blue-500/30">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-1 py-3' : 'gap-3 px-3 py-2.5'} rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-200 hover:text-red-100`}
                title={sidebarCollapsed ? "Logout" : undefined}
              >
                <LogOut className="w-5 h-5" />
                {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="text-lg text-blue-700">Loading...</span>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
      
    </NotificationProvider>
    </AuthProvider>
  );
}

function SidebarLink({ icon, label, href, collapsed = false, isActive = false, placeholder = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const handleClick = useCallback((e) => {
    if (placeholder) {
      e.preventDefault();
      return;
    }
    if (pathname !== href) {
      setIsLoading(true);
      // Reset loading state after navigation
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [pathname, href, placeholder]);

  return (
    <Link href={href} passHref>
      <div 
        className={`flex items-center ${collapsed ? 'justify-center px-1 py-3 mx-1' : 'gap-3 px-3 py-2.5'} rounded-lg transition-all duration-200 cursor-pointer relative backdrop-blur-sm group ${
          isActive 
            ? 'bg-white/25 font-semibold shadow-md border border-white/30 text-white' 
            : placeholder
            ? 'text-blue-300 hover:text-blue-200 hover:bg-white/10 cursor-not-allowed'
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
        {placeholder && !collapsed && (
          <span className="ml-auto text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
            Soon
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