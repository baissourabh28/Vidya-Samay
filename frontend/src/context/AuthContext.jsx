import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

// Create authentication context
const AuthContext = createContext(null)

/**
 * Custom hook to use authentication context
 * Must be used within AuthProvider
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides auth methods to child components.
 * Handles token storage, user session, and API authentication.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Verify token and fetch user info on mount
  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  /**
   * Verify stored token and fetch user information
   */
  const verifyToken = async () => {
    try {
      const res = await authAPI.getMe()
      setUser(res.data)
    } catch (error) {
      // Token invalid or backend unavailable
      console.error('Token verification failed:', error)
      setToken(null)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Login user with credentials
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Object} Result object with success status and error message
   */
  const login = async (username, password) => {
    try {
      console.log('Attempting login for:', username)
      console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
      
      const res = await authAPI.login(username, password)
      
      const { token: newToken, username: userName, role } = res.data
      
      // Store token and user info
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser({ username: userName, role })
      
      return { success: true }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      })
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = 'Network error: Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000'
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password. Please check your credentials.'
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check backend configuration.'
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  /**
   * Logout user and clear session
   */
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  const isAuthenticated = () => {
    return !!token && !!user
  }

  /**
   * Get current authentication token
   * @returns {string|null} Current token or null
   */
  const getToken = () => token

  // Context value provided to children
  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    getToken,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
