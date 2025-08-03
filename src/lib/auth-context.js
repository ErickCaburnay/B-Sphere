import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { ensureTokenCookie, clearAuthToken } from './auth-utils';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // OPTIMIZATION: Removed excessive logging for better performance
        if (process.env.NODE_ENV === 'development') {
          console.log('AuthProvider - Starting authentication initialization');
        }
        
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        const jwtToken = localStorage.getItem('token');
        
        // OPTIMIZATION: Reduced logging, only in development
        if (process.env.NODE_ENV === 'development') {
          console.log('AuthProvider - Initial localStorage check:', {
            hasUserData: !!userData,
            hasJwtToken: !!jwtToken
          });
        }

        if (userData && jwtToken) {
          const parsedUser = JSON.parse(userData);
          
          // OPTIMIZATION: Set user immediately without waiting for cookie
          setUser({ 
            uid: parsedUser.firebaseUid || parsedUser.uid, 
            email: parsedUser.email,
            role: parsedUser.role,
            userType: parsedUser.userType
          });
          
          // OPTIMIZATION: Set cookie asynchronously to avoid blocking
          setTimeout(() => {
            try {
              ensureTokenCookie();
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Cookie error:', error);
              }
            }
          }, 0);
          
        } else if (process.env.NODE_ENV === 'development') {
          console.log('AuthProvider - No user data or token found in localStorage');
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth initialization error:', error);
        }
        // Don't logout user on initialization errors
      } finally {
        setLoading(false);
        if (process.env.NODE_ENV === 'development') {
          console.log('AuthProvider - Authentication initialization complete');
        }
      }
    };

    initializeAuth();
  }, []);

  // Remove Firebase Auth state listener to prevent automatic logout
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
  //     // Disabled to prevent automatic logout
  //   });
  //   return () => unsubscribe();
  // }, []);

  const logout = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthProvider - Logging out user');
      }
      
      // Clear Firebase Auth if available, but don't wait for it
      try {
        await signOut(auth);
        if (process.env.NODE_ENV === 'development') {
          console.log('AuthProvider - Firebase sign out successful');
        }
      } catch (firebaseError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('AuthProvider - Firebase sign out failed, continuing with logout:', firebaseError);
        }
      }
      
      // Clear all auth data
      clearAuthToken();
      setUser(null);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthProvider - Logout complete');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
      // Still clear auth data even if everything fails
      clearAuthToken();
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 