/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: Record<string, string>) => Promise<User>;
  logout: () => void;
  registerUser: (payload: Record<string, string>) => Promise<User>;
  signupUser: (payload: Record<string, string>) => Promise<User>;
  forgotPassword: (payload: Record<string, string>) => Promise<{ message: string; email: string; simulatedToken: string }>;
  resetPassword: (payload: Record<string, string>) => Promise<{ message: string }>;
  changePass: (payload: Record<string, string>) => Promise<void>;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedToken = localStorage.getItem('erp_token');
    const storedUser = localStorage.getItem('erp_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (payload: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await apiService.login(payload);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setToken(null);
    setUser(null);
  };

  const registerUser = async (payload: Record<string, string>) => {
    // Admin user registration
    return apiService.register(payload);
  };

  const signupUser = async (payload: Record<string, string>) => {
    // Public user signup
    return apiService.signup(payload);
  };

  const forgotPassword = async (payload: Record<string, string>) => {
    return apiService.forgotPassword(payload);
  };

  const resetPassword = async (payload: Record<string, string>) => {
    return apiService.resetPassword(payload);
  };

  const changePass = async (payload: Record<string, string>) => {
    await apiService.changePassword(payload);
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      logout, 
      registerUser, 
      signupUser,
      forgotPassword,
      resetPassword,
      changePass,
      hasAnyRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
