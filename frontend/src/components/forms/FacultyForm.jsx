import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

export default function FacultyForm() {
  const [faculty, setFaculty] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    employee_id: '',
    department: '',
    email: '',
    max_hours_per_week: 20
  })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { getToken } = useAuth()

  // Fetch faculty on component mount
  useEffect(() => {
    fetchFaculty()
  }, [])

  // Fetch faculty from API
  const fetchFaculty = async () => {
    try {
      const token = getToken()
      // TODO: Replace with actual API endpoint
      // const response = await axios.get('http://localhost:8000/api/faculty', {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // setFaculty(response.data)
      
      // Mock data for now
      setFaculty([
        { id: 1, name: 'Dr. Smith', employee_id: 'F001', department: 'Computer Science', email: 'smith@college.edu', max_hours_per_week: 20 },
        { id: 2, name: 'Dr. Johnson', employee_id: 'F002', department: 'Computer Science', email: 'johnson@college.edu', max_hours_per_week: 20 },
        { id: 3, name: 'Dr. Williams', employee_id: 'F003', department: 'Computer Science', email: 'williams@college.edu', max_hours_per_week: 20 }
      ])
    } catch (err) {
      setError('Failed to fetch faculty')
      console.error('Error fetching faculty:', err)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      
      if (editing) {
        // Update existing faculty
        // TODO: Replace with actual API call
        // await axios.put(`http://localhost:8000/api/faculty/${editing}`, formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        setFaculty(faculty.map(f => f.id === editing ? { ...formData, id: editing } : f))
      } else {
        // Create new faculty
        // TODO: Replace with actual API call
        // const response = await axios.post('http://localhost:8000/api/faculty', formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        setFaculty([...faculty, { ...formData, id: Date.now() }])
      }

      // Reset form
      resetForm()
    } catch (err) {
      setError(editing ? 'Failed to update faculty' : 'Failed to add faculty')
      console.error('Error saving faculty:', err)
    } finally {
      setLoading(false)
    }
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      employee_id: '',
      department: '',
      email: '',
      max_hours_per_week: 20
    })
    setEditing(null)
    setError('')
  }

  // Handle edit action
  const handleEdit = (fac) => {
    setFormData(fac)
    setEditing(fac.id)
    setError('')
  }

  // Handle delete action
  const handleDelete = async (id) => {
    if (!confirm('Delete this faculty member? This action cannot be undone.')) return

    try {
      const token = getToken()
      // TODO: Replace with actual API call
      // await axios.delete(`http://localhost:8000/api/faculty/${id}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      setFaculty(faculty.filter(f => f.id !== id))
    } catch (err) {
      setError('Failed to delete faculty')
      console.error('Error deleting faculty:', err)
    }
  }

  return (
    <div className="form-container">
      <div className="form-section">
        <h3>{editing ? 'Edit Faculty' : 'Add New Faculty'}</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="data-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Dr. Smith"
                required
              />
            </div>

            <div className="form-group">
              <label>Employee ID *</label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="e.g., F001"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., smith@college.edu"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Max Hours per Week *</label>
              <input
                type="number"
                value={formData.max_hours_per_week}
                onChange={(e) => setFormData({ ...formData, max_hours_per_week: parseInt(e.target.value) })}
                min="1"
                max="40"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editing ? 'Update Faculty' : 'Add Faculty'}
            </button>
            {editing && (
              <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list-section">
        <h3>Existing Faculty ({faculty.length})</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Email</th>
                <th>Max Hours/Week</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map(fac => (
                <tr key={fac.id}>
                  <td>{fac.name}</td>
                  <td>{fac.employee_id}</td>
                  <td>{fac.department}</td>
                  <td>{fac.email}</td>
                  <td>{fac.max_hours_per_week}</td>
                  <td>
                    <button onClick={() => handleEdit(fac)} className="btn-icon" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(fac.id)} className="btn-icon" title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
