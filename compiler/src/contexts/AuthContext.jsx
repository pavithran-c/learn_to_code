import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Create Auth Context
const AuthContext = createContext();

// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const lastActivityRef = useRef(Date.now());

  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Update last activity
  const updateActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setLastActivity(now);
  }, []);

  // Logout function with useCallback to prevent infinite loops
  const logout = useCallback(async (reason) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      if (reason) {
        console.log('Logout reason:', reason);
      }
    }
  }, [token]);

  // Check for session timeout (reduced frequency)
  useEffect(() => {
    if (!user) return;
    
    const checkSession = () => {
      if (user && Date.now() - lastActivityRef.current > SESSION_TIMEOUT) {
        logout('Session expired due to inactivity');
      }
    };

    const interval = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes instead of 1 minute
    return () => clearInterval(interval);
  }, [user, logout]);

  // Activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [updateActivity]);

  // Auto-refresh tokens
  useEffect(() => {
    const refreshTokens = async () => {
      if (!refreshToken) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        
        const result = await response.json();
        
        if (result.access_token) {
          setToken(result.access_token);
          localStorage.setItem('access_token', result.access_token);
          
          if (result.refresh_token) {
            setRefreshToken(result.refresh_token);
            localStorage.setItem('refresh_token', result.refresh_token);
          }
          
          // Set session expiry
          const expiryTime = Date.now() + (result.expires_in * 1000);
          setSessionExpiry(expiryTime);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout('Session expired');
      }
    };

    // Refresh token 5 minutes before expiry
    if (sessionExpiry) {
      const timeUntilRefresh = sessionExpiry - Date.now() - (5 * 60 * 1000);
      if (timeUntilRefresh > 0) {
        const timeout = setTimeout(refreshTokens, timeUntilRefresh);
        return () => clearTimeout(timeout);
      }
    }
  }, [sessionExpiry, refreshToken]);

  // Initialize authentication on app start
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          // Verify token is still valid
          const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: savedToken })
          });
          
          const result = await response.json();
          
          if (result.valid) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      console.log('🔄 AuthContext: Attempting login for:', email);
      console.log('🔗 API URL:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: password 
        })
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (response.ok && data.success) {
        // Store tokens and user data correctly
        setToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setUser(data.user);
        
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (rememberMe) {
          localStorage.setItem('rememberUser', 'true');
        }
        
        // Set session expiry
        const expiryTime = Date.now() + (data.expires_in * 1000);
        setSessionExpiry(expiryTime);
        
        console.log('✅ Login successful');
        return { success: true, user: data.user };
      } else {
        console.log('❌ Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ Network error during login:', error);
      return { 
        success: false, 
        error: 'Network error. Please check if the backend server is running on http://localhost:5000' 
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        const { user, access_token, refresh_token } = data;
        
        // Store tokens and user data
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(access_token);
        setUser(user);
        
        return { success: true, user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };



  // Function to make authenticated API calls
  const apiCall = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshSuccess = await refreshTokenFunction();
        if (refreshSuccess) {
          // Retry the original request
          headers.Authorization = `Bearer ${token}`;
          return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
          });
        } else {
          // Refresh failed, logout user
          logout();
          throw new Error('Authentication expired');
        }
      }

      return response;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  // Refresh token function
  const refreshTokenFunction = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: storedRefreshToken })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('access_token', data.access_token);
        setToken(data.access_token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  // Auth context value
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    apiCall,
    updateActivity,
    refreshTokenFunction,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};