export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-lg animate-pulse"></div>
            <div>
              <div className="w-48 h-8 bg-white/20 rounded animate-pulse mb-2"></div>
              <div className="w-64 h-5 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="w-16 h-8 bg-white/20 rounded animate-pulse mb-1"></div>
            <div className="w-32 h-4 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-4">
          <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="ml-auto w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Notifications Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border-l-4 border-gray-300 p-6">
            <div className="flex items-start gap-4">
              <div className="w-5 h-5 bg-gray-300 rounded animate-pulse mt-1"></div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-48 h-6 bg-gray-300 rounded animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="w-20 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="flex gap-4">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 