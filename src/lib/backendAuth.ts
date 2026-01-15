import { useState, useCallback, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  updateProfile: (data: UpdateProfileData) => Promise<User>;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

// Token storage utilities
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

const getStoredTokens = () => ({
  accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  user: localStorage.getItem(STORAGE_KEYS.USER) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)!) : null,
});

const setStoredTokens = (accessToken: string | null, refreshToken: string | null, user: User | null) => {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

const clearStoredTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// API helper with token refresh
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const { accessToken, refreshToken } = getStoredTokens();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // If unauthorized, try to refresh token
  if (response.status === 401 && refreshToken) {
    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      const newAccessToken = data.accessToken;
      const { user } = getStoredTokens();

      setStoredTokens(newAccessToken, refreshToken, user);

      // Retry original request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed, clear tokens
      clearStoredTokens();
      window.location.href = '/auth/login';
    }
  }

  return response;
};

// Auth functions
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  setStoredTokens(data.accessToken, data.refreshToken, data.user);
  return data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const authData: AuthResponse = await response.json();
  setStoredTokens(authData.accessToken, authData.refreshToken, authData.user);
  return authData;
};

export const logout = async (): Promise<void> => {
  const { accessToken } = getStoredTokens();

  if (accessToken) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  clearStoredTokens();
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken } = getStoredTokens();

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearStoredTokens();
    return null;
  }

  const data = await response.json();
  const { user } = getStoredTokens();
  setStoredTokens(data.accessToken, refreshToken, user);
  return data.accessToken;
};

export const getProfile = async (): Promise<User> => {
  const response = await fetchWithAuth('/api/auth/me');

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  const data = await response.json();
  return data.user;
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await fetchWithAuth('/api/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  const result = await response.json();
  const updatedUser = result.user;

  const { accessToken, refreshToken } = getStoredTokens();
  setStoredTokens(accessToken, refreshToken, updatedUser);

  return updatedUser;
};

// React hook for auth
export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tokens from localStorage on mount
    const stored = getStoredTokens();
    setUser(stored.user);
    setAccessToken(stored.accessToken);
    setRefreshToken(stored.refreshToken);
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const data = await login(email, password);
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  }, []);

  const handleRegister = useCallback(async (registerData: RegisterData) => {
    const data = await register(registerData);
    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  const handleRefreshToken = useCallback(async () => {
    const newToken = await refreshAccessToken();
    if (newToken) {
      setAccessToken(newToken);
    }
    return newToken;
  }, []);

  const handleUpdateProfile = useCallback(async (profileData: UpdateProfileData) => {
    const updatedUser = await updateProfile(profileData);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshAccessToken: handleRefreshToken,
    updateProfile: handleUpdateProfile,
  };
};

export { fetchWithAuth };
