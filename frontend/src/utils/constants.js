// Application constants

// Days of the week
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

// Time slots (24-hour format)
export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
]

// Time slot labels for display
export const TIME_SLOT_LABELS = [
  '9-10 AM', '10-11 AM', '11-12 PM', '12-1 PM',
  '1-2 PM', '2-3 PM', '3-4 PM', '4-5 PM', '5-6 PM'
]

// Program types
export const PROGRAM_TYPES = [
  { value: 'UG', label: 'UG (Undergraduate)' },
  { value: 'PG', label: 'PG (Postgraduate)' }
]

// Shift types
export const SHIFT_TYPES = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' }
]

// Subject types
export const SUBJECT_TYPES = [
  { value: 'core', label: 'Core' },
  { value: 'elective', label: 'Elective' },
  { value: 'lab', label: 'Lab' }
]

// Classroom types
export const CLASSROOM_TYPES = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'lab', label: 'Lab' },
  { value: 'auditorium', label: 'Auditorium' }
]

// Timetable status
export const TIMETABLE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  ARCHIVED: 'archived'
}

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  HOD: 'hod',
  VIEWER: 'viewer'
}

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  ME: '/me',
  CLASSROOMS: '/classrooms',
  BATCHES: '/batches',
  SUBJECTS: '/subjects',
  FACULTY: '/faculty',
  CONSTRAINTS: '/constraints',
  TIMETABLES: '/timetables',
  GENERATE: '/generate',
  DASHBOARD: '/dashboard'
}

// Validation rules
export const VALIDATION = {
  MIN_CLASSES_PER_DAY: 1,
  MAX_CLASSES_PER_DAY: 10,
  MIN_CLASSES_PER_WEEK: 5,
  MAX_CLASSES_PER_WEEK: 50,
  MIN_CLASSROOM_CAPACITY: 1,
  MAX_CLASSROOM_CAPACITY: 500,
  MIN_CREDITS: 1,
  MAX_CREDITS: 6,
  MIN_HOURS_PER_WEEK: 1,
  MAX_HOURS_PER_WEEK: 40,
  MIN_UTILIZATION: 50,
  MAX_UTILIZATION: 100
}

// Default values
export const DEFAULTS = {
  CLASSROOM_CAPACITY: 60,
  STUDENT_COUNT: 60,
  CREDITS: 3,
  HOURS_PER_WEEK: 3,
  MAX_HOURS_PER_WEEK: 20,
  CLASSES_PER_DAY_MIN: 4,
  CLASSES_PER_DAY_MAX: 8,
  CLASSES_PER_WEEK: 30,
  BREAK_DURATION: 10,
  LUNCH_START: '13:00',
  LUNCH_END: '14:00',
  TARGET_UTILIZATION: 80
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please login again.',
  FETCH_FAILED: 'Failed to fetch data. Please try again.',
  SAVE_FAILED: 'Failed to save data. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  GENERATE_FAILED: 'Failed to generate timetable. Please try again.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully!',
  DELETED: 'Deleted successfully!',
  UPDATED: 'Updated successfully!',
  GENERATED: 'Timetable generated successfully!',
  APPROVED: 'Timetable approved successfully!',
  REJECTED: 'Timetable rejected successfully!'
}

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
}

// Export formats
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv'
}
