"use client";

// Simple client-side cache for API responses
class ClientCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  set(key, data, ttl = 300000) { // Default 5 minutes TTL
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() > timestamp) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }
}

// Global cache instance
const apiCache = new ClientCache();

// Enhanced fetch with caching
export async function cachedFetch(url, options = {}, ttl = 300000) {
  const cacheKey = `${url}${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached && !options.bypassCache) {
    console.log(`📦 Cache hit for: ${url}`);
    return cached;
  }

  try {
    console.log(`🌐 Fetching: ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    apiCache.set(cacheKey, data, ttl);
    
    return data;
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error);
    throw error;
  }
}

// Invalidate cache for specific patterns
export function invalidateCache(pattern) {
  const keys = Array.from(apiCache.cache.keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  });
}

// Clear all cache
export function clearCache() {
  apiCache.clear();
}

export default apiCache; 