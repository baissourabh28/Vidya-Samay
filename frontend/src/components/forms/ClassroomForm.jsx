import { useState, useEffect } from 'react'
import { classroomAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ClassroomForm() {
  const [classrooms, setClassrooms] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    capacity: 60,
    type: 'classroom',
    building: '',
    floor: 1
  })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { getToken } = useAuth()

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    try {
      const response = await classroomAPI.getAll()
      setClassrooms(response.data)
    } catch (err) {
      console.error('Error fetching classrooms:', err)
      setError('Failed to fetch classrooms')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (editing) {
        await classroomAPI.update(editing, formData)
      } else {
        await classroomAPI.create(formData)
      }

      // Refresh list
      await fetchClassrooms()

      // Reset form
      setFormData({
        name: '',
        capacity: 60,
        type: 'classroom',
        building: '',
        floor: 1
      })
      setEditing(null)
    } catch (err) {
      console.error('Error saving classroom:', err)
      setError(err.response?.data?.detail || 'Failed to save classroom')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (classroom) => {
    setFormData(classroom)
    setEditing(classroom.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return

    try {
      await classroomAPI.delete(id)
      await fetchClassrooms()
    } catch (err) {
      console.error('Error deleting classroom:', err)
      setError(err.response?.data?.detail || 'Failed to delete classroom')
    }
  }

  return (
    <div className="form-container">
      <div className="form-section">
        <h3>{editing ? 'Edit Classroom' : 'Add New Classroom'}</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="data-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Room 101"
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
              </select>
            </div>

            <div className="form-group">
              <label>Building</label>
              <input
                type="text"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="e.g., A"
              />
            </div>

            <div className="form-group">
              <label>Floor</label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editing ? 'Update' : 'Add Classroom'}
            </button>
            {editing && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {
                  setEditing(null)
                  setFormData({
                    name: '',
                    capacity: 60,
                    type: 'classroom',
                    building: '',
                    floor: 1
                  })
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list-section">
        <h3>Existing Classrooms ({classrooms.length})</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Capacity</th>
                <th>Type</th>
                <th>Building</th>
                <th>Floor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classrooms.map(classroom => (
                <tr key={classroom.id}>
                  <td>{classroom.name}</td>
                  <td>{classroom.capacity}</td>
                  <td><span className={`badge ${classroom.type}`}>{classroom.type}</span></td>
                  <td>{classroom.building || '-'}</td>
                  <td>{classroom.floor}</td>
                  <td>
                    <button onClick={() => handleEdit(classroom)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDelete(classroom.id)} className="btn-icon">🗑️</button>
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
