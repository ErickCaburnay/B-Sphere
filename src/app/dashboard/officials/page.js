// officials/page.js
"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

const officials = [
  {
    id: "OFF-001",
    fullName: "Juan Dela Cruz",
    position: "Barangay Captain",
    termStart: "2023-01-01",
    termEnd: "2025-12-31",
    chairmanship: "Peace and Order",
    status: "Active",
    profile: "/images/officials/juan.jpg",
  },
  {
    id: "OFF-002",
    fullName: "Maria Santos",
    position: "Barangay Kagawad",
    termStart: "2023-01-01",
    termEnd: "2025-12-31",
    chairmanship: "Health and Sanitation",
    status: "Active",
    profile: "/images/officials/maria.jpg",
  },
  // Add more officials as needed
];

const OfficialsPage = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full font-sans text-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-center">Barangay Officials</h2>
      <div className="h-1 bg-red-500 w-full mb-6"></div>

      <div className="w-full overflow-auto rounded-xl shadow border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">Profile</th>
              <th className="p-4 text-left font-semibold">Full Name</th>
              <th className="p-4 text-left font-semibold">Position</th>
              <th className="p-4 text-left font-semibold">Term Start</th>
              <th className="p-4 text-left font-semibold">Term End</th>
              <th className="p-4 text-left font-semibold">Chairmanship</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {officials.map((official) => (
              <tr key={official.id} className="hover:bg-blue-50 transition-colors border-t border-gray-100">
                <td className="p-4">
                  <Image
                    src={official.profile}
                    alt={official.fullName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </td>
                <td className="p-4">{official.fullName}</td>
                <td className="p-4">{official.position}</td>
                <td className="p-4">{official.termStart}</td>
                <td className="p-4">{official.termEnd}</td>
                <td className="p-4">{official.chairmanship}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      official.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {official.status}
                  </span>
                </td>
                <td className="p-4 relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-200 transition"
                    onClick={() => toggleMenu(official.id)}
                  >
                    <MoreVertical size={20} />
                  </button>

                  {activeMenu === official.id && (
                    <div className="absolute right-4 top-12 bg-white shadow-md rounded-md border w-36 z-10">
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => {
                          setActiveMenu(null);
                          alert(`Update ${official.fullName}`);
                        }}
                      >
                        <Pencil size={16} /> Update
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setActiveMenu(null);
                          alert(`Delete ${official.fullName}`);
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <div className="flex justify-end mt-6">
            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg shadow-md flex items-center gap-2">
                <span className="font-medium">Add Official</span>
            </button>
        </div>
    </div>
  );
};

export default OfficialsPage;
