

// API base URL - defaults to the backend server running on port 6969
// In a production environment, this would be set via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6969";

// Function to get the base URL based on the environment
function getBaseURL(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative paths or env var
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:6969";
  } else {
    // Server-side: use env var or default to localhost
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:6969";
  }
}

interface RegisterRequest {
  username: string;
  password: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseURL();
  }

  // Note: The direct fetch methods are used instead (get, post, put, delete)
  // This makes the API calls more explicit and easier to debug

  async register(userData: RegisterRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/register`, {
      method: 'POST',
      credentials: 'include', // Include cookies in requests
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Registration failed');
    }
  }

  async login(credentials: LoginRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/login`, {
      method: 'POST',
      credentials: 'include', // Include cookies in requests
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    // Simple check to see if we have valid session cookies
    // For now, return true if we have a session cookie
    // In a real implementation, you might have a /api/me endpoint to verify session
    try {
      // This is just a placeholder - in a real app, you'd have an endpoint to check auth status
      return true; // Assume true for now since cookies handle session
    } catch {
      return false;
    }
  }

  // Generic method for other API calls that require authentication
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient();
export type { RegisterRequest, LoginRequest, ApiResponse };