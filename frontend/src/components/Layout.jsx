import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Layout Component
 * 
 * Provides the main application layout structure with header navigation
 * and content area. Used to wrap all protected pages for consistent UI.
 * 
 * Features:
 * - Top navigation bar with links
 * - Active route highlighting
 * - User info display
 * - Logout functionality
 * - Responsive design
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render
 */
export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  /**
   * Check if current route matches the given path
   * @param {string} path - Path to check
   * @returns {boolean} True if path matches current location
   */
  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      {/* Header with navigation */}
      <header className="header">
        <div className="header-left">
          <h1>🕉️ Vidya Samay</h1>
          <nav className="nav">
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
              title="Dashboard Overview"
            >
              Dashboard
            </Link>
            <Link 
              to="/data" 
              className={isActive('/data') ? 'active' : ''}
              title="Manage Data"
            >
              Data Management
            </Link>
            <Link 
              to="/generate" 
              className={isActive('/generate') ? 'active' : ''}
              title="Generate Timetable"
            >
              Generate
            </Link>
            <Link 
              to="/timetables" 
              className={isActive('/timetables') ? 'active' : ''}
              title="View Timetables"
            >
              View Timetables
            </Link>
            <Link 
              to="/approvals" 
              className={isActive('/approvals') ? 'active' : ''}
              title="Approval Workflow"
            >
              Approvals
            </Link>
          </nav>
        </div>
        
        {/* User info and logout */}
        <div className="header-right">
          <span className="user-info">Welcome, {user?.username}</span>
          <button onClick={logout} className="logout-btn" title="Logout">
            Logout
          </button>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
