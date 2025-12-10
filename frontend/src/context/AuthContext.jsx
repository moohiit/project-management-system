// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  // Runs once on app load (and on refresh)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        // Not logged in → do nothing
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);


  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);