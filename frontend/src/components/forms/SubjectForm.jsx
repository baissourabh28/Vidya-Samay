import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

export default function SubjectForm() {
  const [subjects, setSubjects] = useState([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    type: 'core',
    credits: 3,
    hours_per_week: 3,
    requires_lab: false
  })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { getToken } = useAuth()

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects()
  }, [])

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      const token = getToken()
      // TODO: Replace with actual API endpoint
      // const response = await axios.get('http://localhost:8000/api/subjects', {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // setSubjects(response.data)
      
      // Mock data for now
      setSubjects([
        { id: 1, code: 'CS201', name: 'Data Structures', department: 'Computer Science', type: 'core', credits: 4, hours_per_week: 4, requires_lab: false },
        { id: 2, code: 'CS202', name: 'Algorithms', department: 'Computer Science', type: 'core', credits: 4, hours_per_week: 4, requires_lab: false },
        { id: 3, code: 'CS203', name: 'Database Systems', department: 'Computer Science', type: 'core', credits: 3, hours_per_week: 3, requires_lab: true }
      ])
    } catch (err) {
      setError('Failed to fetch subjects')
      console.error('Error fetching subjects:', err)
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
        // Update existing subject
        // TODO: Replace with actual API call
        // await axios.put(`http://localhost:8000/api/subjects/${editing}`, formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        setSubjects(subjects.map(s => s.id === editing ? { ...formData, id: editing } : s))
      } else {
        // Create new subject
        // TODO: Replace with actual API call
        // const response = await axios.post('http://localhost:8000/api/subjects', formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        setSubjects([...subjects, { ...formData, id: Date.now() }])
      }

      // Reset form
      resetForm()
    } catch (err) {
      setError(editing ? 'Failed to update subject' : 'Failed to add subject')
      console.error('Error saving subject:', err)
    } finally {
      setLoading(false)
    }
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      department: '',
      type: 'core',
      credits: 3,
      hours_per_week: 3,
      requires_lab: false
    })
    setEditing(null)
    setError('')
  }

  // Handle edit action
  const handleEdit = (subject) => {
    setFormData(subject)
    setEditing(subject.id)
    setError('')
  }

  // Handle delete action
  const handleDelete = async (id) => {
    if (!confirm('Delete this subject? This action cannot be undone.')) return

    try {
      const token = getToken()
      // TODO: Replace with actual API call
      // await axios.delete(`http://localhost:8000/api/subjects/${id}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      setSubjects(subjects.filter(s => s.id !== id))
    } catch (err) {
      setError('Failed to delete subject')
      console.error('Error deleting subject:', err)
    }
  }

  return (
    <div className="form-container">
      <div className="form-section">
        <h3>{editing ? 'Edit Subject' : 'Add New Subject'}</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="data-form">
          <div className="form-row">
            <div className="form-group">
              <label>Subject Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., CS201"
                required
              />
            </div>

            <div className="form-group">
              <label>Subject Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Data Structures"
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
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="lab">Lab</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Credits *</label>
              <input
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                min="1"
                max="6"
                required
              />
            </div>

            <div className="form-group">
              <label>Hours per Week *</label>
              <input
                type="number"
                value={formData.hours_per_week}
                onChange={(e) => setFormData({ ...formData, hours_per_week: parseInt(e.target.value) })}
                min="1"
                max="10"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.requires_lab}
                  onChange={(e) => setFormData({ ...formData, requires_lab: e.target.checked })}
                />
                Requires Lab
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editing ? 'Update Subject' : 'Add Subject'}
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
        <h3>Existing Subjects ({subjects.length})</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Type</th>
                <th>Credits</th>
                <th>Hours/Week</th>
                <th>Lab</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => (
                <tr key={subject.id}>
                  <td>{subject.code}</td>
                  <td>{subject.name}</td>
                  <td>{subject.department}</td>
                  <td><span className={`badge ${subject.type}`}>{subject.type}</span></td>
                  <td>{subject.credits}</td>
                  <td>{subject.hours_per_week}</td>
                  <td>{subject.requires_lab ? '✓' : '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(subject)} className="btn-icon" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(subject.id)} className="btn-icon" title="Delete">🗑️</button>
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
