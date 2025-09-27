'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface SessionContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check session status on mount
  useEffect(() => {
    checkSessionStatus();
  }, []);

  const checkSessionStatus = async () => {
    try {
      // In a real app, we might have a /api/me endpoint to verify session
      // For now, we assume if we have the proper cookies, we're authenticated
      setIsAuthenticated(true); // This would be determined by actual API call
      // setUser(data); // Actual user data from API
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    await apiClient.login({ username, password });
    setIsAuthenticated(true);
    // Optionally fetch user data after login
    // const userData = await fetchUser();
    // setUser(userData);
  };

  const register = async (username: string, password: string) => {
    await apiClient.register({ username, password });
    // After registration, user might need to login or be logged in automatically
    await login(username, password);
  };

  const logout = () => {
    // In a real application, you would call an API endpoint to invalidate the session
    // await apiClient.post('/api/logout');
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login page
    window.location.href = '/';
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}