import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remove legacy persistent tokens. Sessions now live in httpOnly cookies.
    localStorage.removeItem('token'); localStorage.removeItem('user');
    authAPI.getMe().then(res => setUser(res.data.user)).catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (phone, password) => {
    try {
      const res = await authAPI.login({ phone, password });
      const { user: userData } = res.data;
      setUser(userData);
      toast.success(`Welcome back, ${userData?.name?.split(' ')[0] || 'User'}! 🌾`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      const { user: userData } = res.data;
      setUser(userData);
      toast.success(`Welcome to RuralXchange, ${userData?.name?.split(' ')[0] || 'User'}! 🎉`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
