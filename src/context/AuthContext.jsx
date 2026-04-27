import React, { createContext, useState, useContext, useEffect } from 'react';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Email/Password login
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Email/Password signup
  const signup = async (name, email, password, role, phone, address) => {
    const { data } = await api.post('/auth/signup', { name, email, password, role, phone, address });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Google Sign-In via Firebase
  const loginWithGoogle = async (role = null) => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseToken = await result.user.getIdToken();

    const { data } = await api.post('/auth/firebase', { firebaseToken, role });

    // If the backend asks for a role (new user), return that info
    if (data.needsRole) {
      return { needsRole: true, email: data.email, name: data.name, firebaseToken };
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Complete Google signup with role selection (for new users)
  const completeGoogleSignup = async (firebaseToken, role) => {
    const { data } = await api.post('/auth/firebase', { firebaseToken, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    firebaseSignOut(auth).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, completeGoogleSignup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
