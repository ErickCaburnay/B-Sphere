"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function PerformanceMonitor() {
  const pathname = usePathname();
  const navigationStartTime = useRef(null);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    // Track navigation start time
    if (lastPathname.current !== pathname) {
      navigationStartTime.current = performance.now();
      
      // Log navigation start
      console.log(`🚀 Navigation started: ${lastPathname.current} → ${pathname}`);
      
      lastPathname.current = pathname;
    }

    // Track when page is fully loaded
    const handleLoad = () => {
      if (navigationStartTime.current) {
        const loadTime = performance.now() - navigationStartTime.current;
        console.log(`✅ Navigation completed in ${loadTime.toFixed(2)}ms for ${pathname}`);
        
        // Log performance metrics
        if (loadTime > 1000) {
          console.warn(`⚠️ Slow navigation detected: ${loadTime.toFixed(2)}ms for ${pathname}`);
        }
        
        navigationStartTime.current = null;
      }
    };

    // Use a small timeout to ensure DOM is ready
    const timeoutId = setTimeout(handleLoad, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  // Track largest contentful paint
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`🎨 LCP for ${pathname}: ${entry.startTime.toFixed(2)}ms`);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Fallback for browsers that don't support LCP
        console.log('LCP monitoring not supported');
      }

      return () => observer.disconnect();
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

export default PerformanceMonitor; 