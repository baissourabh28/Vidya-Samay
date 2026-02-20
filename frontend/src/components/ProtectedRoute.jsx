import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes from unauthorized access.
 * Redirects to login page if user is not authenticated.
 * Shows loading state while checking authentication.
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourComponent />
 * </ProtectedRoute>
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Protected component to render
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // Show loading state while verifying authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#667eea'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Render protected content
  return children
}
