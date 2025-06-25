import React from "react";

export default function DashboardPageContainer({ heading, children }) {
  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{heading}</h1>
      <div className="h-1 w-full bg-red-500 rounded mb-8"></div>
      <div className="bg-white rounded-xl shadow p-4 md:p-8">
        {children}
      </div>
    </div>
  );
} 