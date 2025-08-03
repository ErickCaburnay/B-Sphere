import SmartHomeLoader from '@/components/ui/SmartHomeLoader';

export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <SmartHomeLoader size={100} message="Loading login..." />
    </div>
  );
} 