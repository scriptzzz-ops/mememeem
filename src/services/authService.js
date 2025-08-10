/**
 * Authentication Service
 * Handles JWT authentication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: Object, token: string}>}
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {string} name - User full name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: Object, token: string}>}
   */
  async register(name, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User data
   */
  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token verification failed');
      }

      return data.user;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  /**
   * Get current user from token
   * @returns {Promise<Object|null>} User data or null
   */
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      return await this.verifyToken(token);
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('token');
      return null;
    }
  }

  /**
   * Logout user (remove token)
   */
  logout() {
    localStorage.removeItem('token');
  }

  /**
   * Get authorization header for API requests
   * @returns {Object} Authorization header
   */
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();