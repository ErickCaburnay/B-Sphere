import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from './firebase';

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
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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