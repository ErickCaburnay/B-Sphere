import SmartHomeLoader from '@/components/ui/SmartHomeLoader';

export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <SmartHomeLoader size={100} message="Loading notifications..." />    
    </div>
  );
} 