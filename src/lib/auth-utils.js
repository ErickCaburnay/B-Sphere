// Utility functions for managing authentication tokens

export function setAuthToken(token) {
  // Set in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    
    // Set in cookie for middleware
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;
  
  // Fallback to cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') return value;
  }
  
  return null;
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
  
  // Clear cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function ensureTokenCookie() {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('token');
  if (token) {
    // Ensure cookie is set with proper attributes
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? '; Secure' : '';
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
  }
} 