"use client";

import type { User } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
  updateUserVerificationStatus: (isVerified: boolean) => void; // For updating after verification
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('onlyfansly-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure essential fields like isVerified exist, default if not
      setUser({
        ...parsedUser,
        isVerified: parsedUser.isVerified !== undefined ? parsedUser.isVerified : false,
        isAdmin: parsedUser.isAdmin !== undefined ? parsedUser.isAdmin : false,
      });
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    const userToStore = {
        ...userData,
        // Ensure critical fields are always present
        isVerified: userData.isVerified !== undefined ? userData.isVerified : false,
        isAdmin: userData.isAdmin !== undefined ? userData.isAdmin : false,
    };
    setUser(userToStore);
    localStorage.setItem('onlyfansly-user', JSON.stringify(userToStore));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('onlyfansly-user');
  };
  
  const updateUserVerificationStatus = (isVerified: boolean) => {
    setUser(currentUser => {
      if (currentUser) {
        const updatedUser = { ...currentUser, isVerified };
        localStorage.setItem('onlyfansly-user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  };

  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, loading, updateUserVerificationStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
