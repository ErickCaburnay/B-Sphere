export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      <span className="mt-4 text-lg text-green-700">Loading households...</span>
    </div>
  );
} 