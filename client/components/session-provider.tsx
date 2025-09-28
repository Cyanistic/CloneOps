"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API, BASE_URL } from "@/lib/api";

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
      // For now, we'll just make a simple authenticated request to see if session exists
      // Using a safe endpoint that will return 401 if not authenticated
      // Since we don't have a specific /api/me endpoint, we'll check by making a request
      // to an endpoint that requires authentication.
      // We'll handle the error appropriately without logging it as a real error
      const response = await API.api.getProfile();

      // If we get 200, user is authenticated
      // If we get 401, user is not authenticated
      if (response.status < 400) {
        setIsAuthenticated(true);
        setUser(response.data); // Set user data when session is valid
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      // Network errors or other issues should be treated as not authenticated
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    await API.api.login({ username, password });
    // After successful login, fetch the user profile to set user data
    const profileResponse = await API.api.getProfile();
    if (profileResponse.status < 400) { // Success status
      setUser(profileResponse.data);
    }
    setIsAuthenticated(true);
  };

  const register = async (username: string, password: string) => {
    await API.api.register({ username, password });
    // After registration, user might need to login or be logged in automatically
    await login(username, password);
  };

  const logout = () => {
    // In a real application, you would call an API endpoint to invalidate the session
    // await apiClient.post('/api/logout');
    setUser(null);
    setIsAuthenticated(false);

    // Redirect to login page
    window.location.href = "/";
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

