import { useState, useEffect } from 'react';

export const EmailPerformanceMonitor = ({ isVisible = false }) => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    averageTime: 0,
    successRate: 0,
    recentTimes: []
  });

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('email_otp_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const addPerformanceData = (time, success) => {
    setStats(prev => {
      const newRecentTimes = [...prev.recentTimes, { time, success, timestamp: Date.now() }]
        .filter(item => Date.now() - item.timestamp < 300000) // Keep last 5 minutes
        .slice(-10); // Keep last 10 requests

      const successfulRequests = newRecentTimes.filter(item => item.success);
      const averageTime = successfulRequests.length > 0 
        ? Math.round(successfulRequests.reduce((sum, item) => sum + item.time, 0) / successfulRequests.length)
        : 0;

      const newStats = {
        totalRequests: prev.totalRequests + 1,
        averageTime,
        successRate: Math.round((successfulRequests.length / newRecentTimes.length) * 100),
        recentTimes: newRecentTimes
      };

      // Save to localStorage
      localStorage.setItem('email_otp_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  // Expose function globally for use in signup component
  useEffect(() => {
    window.addEmailPerformanceData = addPerformanceData;
    return () => {
      delete window.addEmailPerformanceData;
    };
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-2">📧 Email OTP Performance</div>
      <div>Total Requests: {stats.totalRequests}</div>
      <div>Average Time: {stats.averageTime}ms</div>
      <div>Success Rate: {stats.successRate}%</div>
      <div>Recent Times: {stats.recentTimes.slice(-3).map(item => 
        `${item.time}ms${item.success ? '✅' : '❌'}`
      ).join(', ')}</div>
    </div>
  );
};

export default EmailPerformanceMonitor; 