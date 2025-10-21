import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is logged in
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');

      if (storedToken) {
        api.setAuthToken(storedToken);
        setToken(storedToken);
        
        try {
          if (userType === 'admin') {
            // Set admin state with stored token
            setAdmin({ token: storedToken, isAdmin: true });
          } else {
            const response = await api.get('/user/profile');
            setUser(response.data.user || response.user);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Don't logout on initialization error, token might still be valid
          if (error.status === 401) {
            logout();
          }
        }
      }
      
      setLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'user');
      api.setAuthToken(token);
      
      setToken(token);
      setUser(user);
      toast.success('Login successful!');
      
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'user');
      api.setAuthToken(token);
      
      setToken(token);
      setUser(user);
      toast.success('Signup successful!');
      
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Signup failed');
      return { success: false, error: error.message };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      const { token, admin: adminData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'admin');
      api.setAuthToken(token);
      
      setToken(token);
      setAdmin(adminData);
      toast.success('Admin login successful!');
      
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Admin login failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
    setAdmin(null);
    toast.info('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const value = {
    user,
    admin,
    token,
    loading,
    login,
    signup,
    adminLogin,
    logout,
    updateUser,
    isAuthenticated: !!token,
    isAdmin: !!admin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
