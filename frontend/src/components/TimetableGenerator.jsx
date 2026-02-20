import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { classroomAPI, batchAPI, subjectAPI, facultyAPI, constraintsAPI, timetableAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'

export default function TimetableGenerator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [generatedCount, setGeneratedCount] = useState(0)
  const [dataReady, setDataReady] = useState(false)
  const [dataStatus, setDataStatus] = useState({
    classrooms: 0,
    batches: 0,
    subjects: 0,
    faculty: 0
  })
  const { getToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    checkDataAvailability()
  }, [])

  const checkDataAvailability = async () => {
    try {
      const [classrooms, batches, subjects, faculty] = await Promise.all([
        classroomAPI.getAll(),
        batchAPI.getAll(),
        subjectAPI.getAll(),
        facultyAPI.getAll()
      ])

      setDataStatus({
        classrooms: classrooms.data?.length || 0,
        batches: batches.data?.length || 0,
        subjects: subjects.data?.length || 0,
        faculty: faculty.data?.length || 0
      })

      const hasData = 
        (classrooms.data?.length || 0) > 0 &&
        (batches.data?.length || 0) > 0 &&
        (subjects.data?.length || 0) > 0 &&
        (faculty.data?.length || 0) > 0

      setDataReady(hasData)
    } catch (err) {
      console.error('Error checking data:', err)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Fetch all required data from database
      const [classroomsRes, batchesRes, subjectsRes, facultyRes, constraintsRes] = await Promise.all([
        classroomAPI.getAll(),
        batchAPI.getAll(),
        subjectAPI.getAll(),
        facultyAPI.getAll(),
        constraintsAPI.get()
      ])

      const classrooms = classroomsRes.data || []
      const batches = batchesRes.data || []
      const subjects = subjectsRes.data || []
      const faculty = facultyRes.data || []
      const constraints = constraintsRes.data || {}

      if (classrooms.length === 0 || batches.length === 0 || subjects.length === 0 || faculty.length === 0) {
        setError('Please add classrooms, batches, subjects, and faculty before generating timetables.')
        setLoading(false)
        return
      }

      // Prepare data for scheduler
      const data = {
        classrooms: classrooms.map(c => ({
          id: c.id,
          name: c.name,
          capacity: c.capacity,
          type: c.type
        })),
        batches: batches.map(b => ({
          id: b.id,
          name: b.name,
          student_count: b.student_count,
          department: b.department
        })),
        subjects: subjects.map(s => ({
          id: s.id,
          code: s.code,
          name: s.name,
          hours_per_week: s.hours_per_week,
          department: s.department,
          requires_lab: s.requires_lab
        })),
        faculty: faculty.map(f => ({
          id: f.id,
          name: f.name,
          employee_id: f.employee_id,
          department: f.department,
          max_hours_per_week: f.max_hours_per_week,
          availability: f.availability || {},
          leaves: f.leaves || []
        })),
        constraints: {
          days: 5,
          slots_per_day: 8,
          classes_per_day_min: constraints.classes_per_day_min || 4,
          classes_per_day_max: constraints.classes_per_day_max || 8,
          classes_per_week: constraints.classes_per_week || 30,
          break_duration_minutes: constraints.break_duration_minutes || 10,
          target_utilization_rate: constraints.target_utilization_rate || 0.8
        }
      }

      const res = await timetableAPI.generate(data)

      if (res.data.success) {
        setSuccess(true)
        setGeneratedCount(res.data.timetables?.length || 0)
        setTimeout(() => {
          navigate('/timetables')
        }, 2000)
      } else {
        setError(res.data.message || 'Failed to generate timetable')
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate timetable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="generator-container">
        <h2>Generate Timetable</h2>
        <p className="subtitle">Create optimized timetable options based on your data</p>

        <div className="generator-card">
          <div className="generator-info">
            <h3>Ready to Generate</h3>
            <p>The system will analyze your data and create multiple optimized timetable options.</p>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Optimization Algorithm:</span>
                <span className="info-value">OR-Tools Constraint Solver</span>
              </div>
              <div className="info-item">
                <span className="info-label">Options to Generate:</span>
                <span className="info-value">3 variants</span>
              </div>
              <div className="info-item">
                <span className="info-label">Target Utilization:</span>
                <span className="info-value">80%+</span>
              </div>
              <div className="info-item">
                <span className="info-label">Estimated Time:</span>
                <span className="info-value">10-30 seconds</span>
              </div>
            </div>

            <div className="constraints-check">
              <h4>Constraints to Apply:</h4>
              <ul>
                <li>✓ No faculty double-booking</li>
                <li>✓ No classroom double-booking</li>
                <li>✓ Faculty availability respected</li>
                <li>✓ Room capacity constraints</li>
                <li>✓ Fixed slots preserved</li>
                <li>✓ Lunch break honored</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="error-box">
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className="success-box">
              <strong>Success!</strong> Generated {generatedCount} timetable options. Redirecting...
            </div>
          )}

          {!dataReady && (
            <div className="warning-box">
              <strong>⚠️ Missing Data:</strong>
              <ul>
                <li>Classrooms: {dataStatus.classrooms}</li>
                <li>Batches: {dataStatus.batches}</li>
                <li>Subjects: {dataStatus.subjects}</li>
                <li>Faculty: {dataStatus.faculty}</li>
              </ul>
              <p>Please add data in the <a href="/data">Data Management</a> page before generating timetables.</p>
            </div>
          )}

          <div className="generator-actions">
            <button 
              onClick={handleGenerate} 
              className="btn-generate"
              disabled={loading || !dataReady}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Generating Timetables...
                </>
              ) : (
                <>
                  🚀 Generate Timetables
                </>
              )}
            </button>
          </div>

          <div className="generator-tips">
            <h4>💡 Tips for Better Results:</h4>
            <ul>
              <li>Ensure all classrooms, faculty, subjects, and batches are added</li>
              <li>Set realistic constraints (not too restrictive)</li>
              <li>Mark faculty availability and leaves accurately</li>
              <li>If generation fails, try reducing classes per week or adding more resources</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
