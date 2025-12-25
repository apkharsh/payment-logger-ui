// lib/api.ts
import axios from 'axios';

// ✅ Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

// ✅ Timer for automatic token refresh
let refreshTimer: NodeJS.Timeout | null = null;

// ✅ Function to setup automatic refresh
export const setupTokenRefresh = (expiresInSeconds: number) => {
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  
  // Calculate when to refresh (refresh 1 minute before expiration)
  const refreshTime = (expiresInSeconds - 60) * 1000; // Convert to milliseconds
  
  console.log(`Token will be refreshed in ${refreshTime / 1000} seconds`);
  
  // Set timer to refresh token
  refreshTimer = setTimeout(async () => {
    console.log('Proactively refreshing access token...');
    
    try {
      // ⭐ Just call the endpoint - cookies are automatically updated
      await api.post('/auth/refresh');
      
      console.log('Token refreshed successfully!');
      
      // ⭐ Setup next refresh (15 minutes = 900 seconds)
      setupTokenRefresh(900);
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear user data and redirect to login
      clearTokenRefresh();
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, refreshTime);
};

// ✅ Function to clear refresh timer
export const clearTokenRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
    console.log('Token refresh timer cleared');
  }
};

// ✅ Response interceptor (backup fallback)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 401, try to refresh as fallback
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (originalRequest.url.includes('/auth/refresh')) {
        console.log('Refresh token expired, logging out...');
        clearTokenRefresh();
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        console.log('Fallback: Refreshing token after 401...');
        // ⭐ Just call refresh - no need to handle response
        await api.post('/auth/refresh');
        
        // Setup proactive refresh again
        setupTokenRefresh(900);
        
        // Retry original request
        return api(originalRequest);
        
      } catch (refreshError) {
        console.log('Refresh failed, logging out...');
        clearTokenRefresh();
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
