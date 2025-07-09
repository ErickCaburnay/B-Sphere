"use client";

import DashboardPageContainer from '@/components/DashboardPageContainer';

export default function Loading() {
  return (
    <DashboardPageContainer heading="System Management">
      <div className="w-full space-y-4">
        {/* Tabs skeleton */}
        <div className="w-full lg:max-w-[800px] h-10 bg-gray-200 rounded-lg animate-pulse" />
        
        {/* Content skeleton */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </DashboardPageContainer>
  );
} 