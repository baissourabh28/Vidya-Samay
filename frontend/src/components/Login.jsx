import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Login Component
 * 
 * Provides user authentication interface. Handles login form submission,
 * validates credentials, and redirects to dashboard on success.
 * 
 * Features:
 * - Username and password input
 * - Form validation
 * - Error message display
 * - Loading state during authentication
 * - Auto-redirect on successful login
 */
export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  /**
   * Handle login form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check backend connectivity first
    try {
      const healthCheck = await fetch('http://localhost:8000/api/health')
      if (!healthCheck.ok) {
        setError('Backend server is not responding. Please ensure the backend is running on http://localhost:8000')
        setLoading(false)
        return
      }
    } catch (err) {
      setError('Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000')
      setLoading(false)
      return
    }

    // Attempt login
    const result = await login(username, password)
    
    if (result.success) {
      // Redirect to dashboard on success
      navigate('/dashboard')
    } else {
      // Display error message
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🕉️ Vidya Samay - Smart Timetable Scheduler</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          {error && (
            <div className="error-box">
              <p className="error">{error}</p>
              <p className="error-hint">
                💡 Troubleshooting:
                <br />• Ensure backend is running on http://localhost:8000
                <br />• Check browser console (F12) for details
                <br />• Verify credentials: admin / admin123
              </p>
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="hint">Default credentials: admin / admin123</p>
      </div>
    </div>
  )
}
