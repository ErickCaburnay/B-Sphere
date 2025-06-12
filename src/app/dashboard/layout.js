// layout
"use client";
import {
  Bell, UserCircle, LayoutDashboard, Users, Home, User, Settings,
  FileText, Folder, Archive, ClipboardList, Menu, X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-PH", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

  const formatDate = (date) =>
    date.toLocaleDateString("en-PH", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });

  return (
    <div className="font-sans text-gray-900 min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
        <div className="flex justify-between items-center py-3 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-950 text-transparent bg-clip-text">
              B-Sphere
            </h1>
          </div>
          <div className="hidden md:block text-center">
            <div className="text-sm text-gray-700">{formatDate(currentTime)}</div>
            <div className="text-lg font-semibold text-green-700">{formatTime(currentTime)}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm font-medium text-gray-700">Juan Dela Cruz</span>
            <UserCircle size={28} className="text-green-700" />
            <Bell size={24} className="text-green-700" />
            <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-[64px] left-0 z-40 w-64 h-[calc(100vh-64px)] p-4 bg-green-700 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        >
        {/* Brgy Logo and Name */}
        <div className="flex flex-col items-center justify-center pt-6 pb-4 border-b-2 border-red-600">
            <Image
            src="/images/brgy_seal2.png"
            alt="Barangay Seal"
            width={180}
            height={180}
            className="rounded-full shadow-md"
            />
            <h2 className="mt-3 text-lg font-semibold text-center leading-tight">
            Barangay San Francisco
            </h2>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" href="/dashboard" />
          <SidebarLink icon={<User size={20} />} label="Officials" href="/dashboard/officials" />
          <SidebarLink icon={<Users size={20} />} label="Resident Records" href="/dashboard/residents" />
          <SidebarLink icon={<Home size={20} />} label="Households" href="/dashboard/households" />
          <SidebarLink icon={<Settings size={20} />} label="Module 5" href="#" />
          <SidebarLink icon={<FileText size={20} />} label="Module 6" href="#" />
          <SidebarLink icon={<Folder size={20} />} label="Module 7" href="#" />
          <SidebarLink icon={<Archive size={20} />} label="Module 8" href="#" />
          <SidebarLink icon={<ClipboardList size={20} />} label="Module 9" href="#" />
          <SidebarLink icon={<Settings size={20} />} label="Module 10" href="#" />
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-[96px] px-4 md:px-8 transition-all duration-300 bg-gradient-to-b from-green-300 to-white ${
          sidebarOpen ? "ml-64" : "md:ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, href }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-800 transition cursor-pointer">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
}
