# Frontend Documentation

## Overview
React-based frontend for College Timetable Scheduling System with modern UI and comprehensive features.

## Tech Stack
- **React 18** - UI library
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling

## Quick Start

### Prerequisites
- Node.js 16+

### Installation
```bash
cd frontend
npm install
npm run dev
```

Access at: http://localhost:5173

## Project Structure
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── forms/          # Data entry forms
│   │   │   ├── BatchForm.jsx
│   │   │   ├── ClassroomForm.jsx
│   │   │   ├── ConstraintsForm.jsx
│   │   │   ├── FacultyForm.jsx
│   │   │   └── SubjectForm.jsx
│   │   ├── ApprovalWorkflow.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DataManagement.jsx
│   │   ├── Layout.jsx
│   │   ├── Login.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── TimetableGenerator.jsx
│   │   └── TimetableViewer.jsx
│   ├── context/            # React context
│   │   └── AuthContext.jsx
│   ├── services/           # API layer
│   │   └── api.js
│   ├── utils/              # Utilities
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── App.jsx             # Main app
│   ├── main.jsx            # Entry point
│   ├── App.css             # App styles
│   └── index.css           # Global styles
├── package.json
└── vite.config.js
```

## Features

### Pages
1. **Login** - User authentication
2. **Dashboard** - Overview and statistics
3. **Data Management** - CRUD operations
   - Classrooms
   - Batches
   - Subjects
   - Faculty
   - Constraints
4. **Generate** - Timetable generation
5. **View Timetables** - Browse schedules
6. **Approvals** - Review workflow

### Components

#### Authentication
- **Login.jsx** - Login form
- **AuthContext.jsx** - Auth state management
- **ProtectedRoute.jsx** - Route protection

#### Layout
- **Layout.jsx** - Main layout with navigation
- **Dashboard.jsx** - Statistics and quick actions

#### Data Management
- **DataManagement.jsx** - Tabbed interface
- **Form Components** - CRUD for each entity

#### Timetable
- **TimetableGenerator.jsx** - Generation interface
- **TimetableViewer.jsx** - View and compare
- **ApprovalWorkflow.jsx** - Approve/reject

## API Integration

### Service Layer (services/api.js)
Centralized API client with:
- Axios instance
- Request interceptors (token injection)
- Response interceptors (error handling)
- Organized endpoints

### API Methods
```javascript
// Authentication
authAPI.login(username, password)
authAPI.getMe()
authAPI.logout()

// Classrooms
classroomAPI.getAll()
classroomAPI.create(data)
classroomAPI.update(id, data)
classroomAPI.delete(id)

// Similar for batches, subjects, faculty

// Constraints
constraintsAPI.get()
constraintsAPI.update(data)

// Timetable
timetableAPI.generate(data)
timetableAPI.getAll()
timetableAPI.approve(id, comments)
timetableAPI.reject(id, comments)

// Dashboard
dashboardAPI.getStats()
```

## Routing

```javascript
/                    → Redirect to /dashboard
/login              → Login page (public)
/dashboard          → Dashboard (protected)
/data               → Data Management (protected)
/generate           → Timetable Generator (protected)
/timetables         → Timetable Viewer (protected)
/approvals          → Approval Workflow (protected)
```

## State Management

### Authentication State (AuthContext)
- User information
- JWT token
- Login/logout methods
- Authentication status

### Component State
Each component manages local state:
- Form data
- Loading states
- Error messages
- UI state

## Styling

### CSS Architecture
- CSS Custom Properties for theming
- Component-based classes
- Responsive design
- Mobile-first approach

### Color Scheme
```css
--primary: #667eea
--success: #48bb78
--danger: #e53e3e
--warning: #ed8936
--info: #4299e1
```

## Utilities

### helpers.js
- Date/time formatting
- Validation functions
- Array manipulation
- File download

### constants.js
- Days, time slots
- Entity types
- Validation rules
- Default values
- Error messages

## Development

### Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Variables
Create `.env`:
```bash
VITE_API_URL=http://localhost:8000/api
```

## Error Handling

### API Errors
```javascript
// Automatic token expiration handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Component Errors
```javascript
try {
  const response = await api.create(data)
  // Success
} catch (error) {
  setError(error.response?.data?.detail || 'Operation failed')
}
```

## Best Practices

### Code Organization
- One component per file
- Logical folder structure
- Reusable utilities
- Separation of concerns

### Component Design
- Functional components with hooks
- Clear responsibilities
- Comprehensive comments
- Props validation

### Performance
- Efficient re-renders
- Optimized bundle size
- Lazy loading ready
- Memoization where needed

## Building for Production

```bash
npm run build
```

Output in `dist/` folder. Serve with:
- Nginx
- Apache
- Static hosting (Vercel, Netlify)

Update API URL for production in `.env`

## Troubleshooting

**CORS Error**
- Check backend CORS configuration
- Ensure frontend URL is allowed

**401 Unauthorized**
- Check token in localStorage
- Try logging in again
- Verify token expiration

**Connection Refused**
- Ensure backend is running
- Check API_URL configuration

**Build Errors**
- Clear node_modules
- Run `npm install` again
- Check Node.js version

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

## Support
For issues:
- Check browser console
- Check network tab
- Verify backend is running
- Check API responses
