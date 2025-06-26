import React from "react";
import PageTitle from "@/components/ui/PageTitle";

export default function DashboardPageContainer({ 
  heading, 
  subtitle, 
  children, 
  showRedLine = true,
  containerClassName = "",
  contentClassName = ""
}) {
  return (
    <div className={`container mx-auto p-6 min-h-screen ${containerClassName}`}>
      <PageTitle 
        title={heading} 
        subtitle={subtitle} 
        showRedLine={showRedLine}
      />
      <div className={`bg-white rounded-xl shadow-lg p-4 md:p-8 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
} 