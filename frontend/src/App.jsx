import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import DataManagement from './components/DataManagement'
import TimetableGenerator from './components/TimetableGenerator'
import TimetableViewer from './components/TimetableViewer'
import ApprovalWorkflow from './components/ApprovalWorkflow'
import './App.css'

/**
 * Main App Component
 * 
 * This is the root component that sets up routing and authentication context
 * for the entire application. All routes are wrapped with AuthProvider to
 * enable authentication state management across the app.
 * 
 * Routes:
 * - /login: Public login page
 * - /dashboard: Protected dashboard with overview stats
 * - /data: Protected data management page for CRUD operations
 * - /generate: Protected timetable generation page
 * - /timetables: Protected timetable viewer page
 * - /approvals: Protected approval workflow page
 * - /: Redirects to dashboard
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route - Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected route - Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected route - Data Management */}
          <Route path="/data" element={
            <ProtectedRoute>
              <DataManagement />
            </ProtectedRoute>
          } />
          
          {/* Protected route - Timetable Generator */}
          <Route path="/generate" element={
            <ProtectedRoute>
              <TimetableGenerator />
            </ProtectedRoute>
          } />
          
          {/* Protected route - Timetable Viewer */}
          <Route path="/timetables" element={
            <ProtectedRoute>
              <TimetableViewer />
            </ProtectedRoute>
          } />
          
          {/* Protected route - Approval Workflow */}
          <Route path="/approvals" element={
            <ProtectedRoute>
              <ApprovalWorkflow />
            </ProtectedRoute>
          } />
          
          {/* Default route - Redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch-all route - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
