export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-3 text-gray-600 text-sm">Loading personal information...</p>
      </div>
    </div>
  );
} 