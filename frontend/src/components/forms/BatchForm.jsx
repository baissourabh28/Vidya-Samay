import { useState, useEffect } from 'react'
import { batchAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function BatchForm() {
  const [batches, setBatches] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    program: 'UG',
    department: '',
    year: 1,
    semester: 1,
    student_count: 60,
    shift: 'morning'
  })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { getToken } = useAuth()

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAll()
      setBatches(response.data)
    } catch (err) {
      console.error('Error fetching batches:', err)
      setError('Failed to fetch batches')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (editing) {
        await batchAPI.update(editing, formData)
      } else {
        await batchAPI.create(formData)
      }

      await fetchBatches()
      resetForm()
    } catch (err) {
      console.error('Error saving batch:', err)
      setError(err.response?.data?.detail || 'Failed to save batch')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      program: 'UG',
      department: '',
      year: 1,
      semester: 1,
      student_count: 60,
      shift: 'morning'
    })
    setEditing(null)
    setError('')
  }

  const handleEdit = (batch) => {
    setFormData(batch)
    setEditing(batch.id)
    setError('')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch? This action cannot be undone.')) return

    try {
      await batchAPI.delete(id)
      await fetchBatches()
    } catch (err) {
      console.error('Error deleting batch:', err)
      setError(err.response?.data?.detail || 'Failed to delete batch')
    }
  }

  return (
    <div className="form-container">
      <div className="form-section">
        <h3>{editing ? 'Edit Batch' : 'Add New Batch'}</h3>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="data-form">
          <div className="form-row">
            <div className="form-group">
              <label>Batch Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., CS-A"
                required
              />
            </div>

            <div className="form-group">
              <label>Program *</label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                required
              >
                <option value="UG">UG (Undergraduate)</option>
                <option value="PG">PG (Postgraduate)</option>
              </select>
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
              <label>Year *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min="1"
                max="5"
                required
              />
            </div>

            <div className="form-group">
              <label>Semester *</label>
              <input
                type="number"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Student Count *</label>
              <input
                type="number"
                value={formData.student_count}
                onChange={(e) => setFormData({ ...formData, student_count: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Shift *</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                required
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editing ? 'Update Batch' : 'Add Batch'}
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
        <h3>Existing Batches ({batches.length})</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Program</th>
                <th>Department</th>
                <th>Year/Sem</th>
                <th>Students</th>
                <th>Shift</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(batch => (
                <tr key={batch.id}>
                  <td>{batch.name}</td>
                  <td><span className="badge">{batch.program}</span></td>
                  <td>{batch.department}</td>
                  <td>Y{batch.year}/S{batch.semester}</td>
                  <td>{batch.student_count}</td>
                  <td>{batch.shift}</td>
                  <td>
                    <button onClick={() => handleEdit(batch)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDelete(batch.id)} className="btn-icon">🗑️</button>
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
