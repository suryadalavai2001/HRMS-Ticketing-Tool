import React, { createContext, useState, useEffect } from 'react';
import authService from '../api/authService';
import employeeService from '../api/employeeService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const profile = await employeeService.getMyProfile();
        setUser(profile);
        setIsAuthenticated(true);
        localStorage.setItem('user_profile', JSON.stringify(profile));
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const profile = await employeeService.getMyProfile();
    setUser(profile);
    setIsAuthenticated(true);
    document.cookie = `access_token=${data.access}; path=/; domain=localhost; SameSite=Lax`;
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    document.cookie = "access_token=; path=/; domain=localhost; max-age=0";
    window.location.href = '/login';
  };
  const refreshUser = async () => {
    try {
      const profile = await employeeService.getMyProfile();
      setUser(profile);
      localStorage.setItem('userprofile', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
