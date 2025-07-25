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
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        const jwtToken = localStorage.getItem('token');

        if (userData && jwtToken) {
          const parsedUser = JSON.parse(userData);
          
          // Ensure token cookie is set for middleware
          ensureTokenCookie();
          
          try {
            // Get Firebase custom token from your backend
            const response = await fetch('/api/auth/firebase-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
              },
              body: JSON.stringify({
                uid: parsedUser.firebaseUid || parsedUser.uid,
                claims: {
                  role: parsedUser.role || 'resident',
                  userType: parsedUser.userType || 'resident',
                  uniqueId: parsedUser.uniqueId,
                  residentId: parsedUser.residentId,
                  email: parsedUser.email
                }
              })
            });

            if (response.ok) {
              const { customToken } = await response.json();
              
              // Sign in with custom token
              const userCredential = await signInWithCustomToken(auth, customToken);
              setUser(userCredential.user);
            } else {
              // If Firebase token generation fails, still keep user logged in
              // The app can function without Firebase Auth for basic operations
              console.warn('Firebase custom token generation failed, but keeping user session');
              setUser({ uid: parsedUser.firebaseUid || parsedUser.uid, email: parsedUser.email });
            }
          } catch (firebaseError) {
            console.warn('Firebase authentication failed, but keeping user session:', firebaseError);
            // Keep user logged in even if Firebase Auth fails
            setUser({ uid: parsedUser.firebaseUid || parsedUser.uid, email: parsedUser.email });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't logout user on initialization errors
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      clearAuthToken();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear auth data even if Firebase signOut fails
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