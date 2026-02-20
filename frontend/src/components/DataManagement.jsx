import { useState } from 'react'
import Layout from './Layout'
import ClassroomForm from './forms/ClassroomForm'
import BatchForm from './forms/BatchForm'
import SubjectForm from './forms/SubjectForm'
import FacultyForm from './forms/FacultyForm'
import ConstraintsForm from './forms/ConstraintsForm'

/**
 * Data Management Component
 * 
 * Central hub for managing all timetable-related data including:
 * - Classrooms: Physical spaces for classes
 * - Batches: Student groups
 * - Subjects: Courses to be scheduled
 * - Faculty: Teachers and instructors
 * - Constraints: Scheduling rules and preferences
 * 
 * Features:
 * - Tabbed interface for different data types
 * - CRUD operations for each data type
 * - Form validation
 * - Real-time updates
 */
export default function DataManagement() {
  const [activeTab, setActiveTab] = useState('classrooms')

  // Tab configuration
  const tabs = [
    { id: 'classrooms', label: 'Classrooms', icon: '🏫' },
    { id: 'batches', label: 'Batches', icon: '👥' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
    { id: 'constraints', label: 'Constraints', icon: '⚙️' }
  ]

  return (
    <Layout>
      <div className="data-management">
        <h2>Data Management</h2>
        <p className="subtitle">Manage all scheduling data and constraints</p>

        {/* Tab navigation */}
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={`Manage ${tab.label}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content - renders appropriate form based on active tab */}
        <div className="tab-content">
          {activeTab === 'classrooms' && <ClassroomForm />}
          {activeTab === 'batches' && <BatchForm />}
          {activeTab === 'subjects' && <SubjectForm />}
          {activeTab === 'faculty' && <FacultyForm />}
          {activeTab === 'constraints' && <ConstraintsForm />}
        </div>
      </div>
    </Layout>
  )
}
