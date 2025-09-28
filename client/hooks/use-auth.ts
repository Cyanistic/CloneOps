import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in by fetching profile
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('session');
        if (token) {
          // We can't make API call here without importing Api, so we just check for token existence
          // In a real implementation, you would call the API to validate the session
          const user = localStorage.getItem('user');
          if (user) {
            setSession({ user: JSON.parse(user) });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('session');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Get session cookie from response
        const cookies = response.headers.get('Set-Cookie');
        if (cookies) {
          // In a real implementation, we would handle the session properly
          // For now, we'll simulate by storing user info
          localStorage.setItem('session', 'active');
          // Assuming we have user info from login response
          // In a real implementation, you would parse the user from response
        }
        // For now, we'll simulate setting a session
        setSession({
          user: {
            id: 'temp-id', // This should come from login response
            username,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        });
        localStorage.setItem('user', JSON.stringify({
          id: 'temp-id',
          username,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}