# Vidya Samay - Smart Timetable Scheduler

Intelligent automated timetable scheduling system for Indian colleges using constraint programming optimization.

## Project Name
**Vidya Samay** (विद्या समय) - Sanskrit for "Education Time" / "Knowledge Schedule"

## Features

- **Automated Scheduling** - AI-powered timetable generation using Google OR-Tools
- **Constraint Satisfaction** - No conflicts, room capacity validation, faculty availability
- **Multiple Options** - Generate 3 optimal timetable variants
- **Data Management** - Complete CRUD for classrooms, batches, subjects, faculty
- **Approval Workflow** - Review and approve/reject generated timetables
- **Real-time Validation** - Automatic conflict detection and resolution suggestions
- **Dashboard Analytics** - Statistics and insights
- **Secure Authentication** - JWT-based user authentication

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **OR-Tools** - Google's constraint solver
- **JWT + Bcrypt** - Authentication & security

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Axios** - HTTP client
- **CSS3** - Modern styling

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 12+

### 1. Start Backend

**Windows:**
```bash
cd backend
start.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x start.sh
./start.sh
```

Backend runs at: http://localhost:8000

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### 3. Access Application

Open browser: http://localhost:5173

**Default Login:**
- Username: `admin`
- Password: `admin123`

## Project Structure

```
college-timetable-scheduling/
├── backend/                    # FastAPI backend
│   ├── services/              # Business logic
│   │   ├── auth_service.py
│   │   └── data_service.py
│   ├── main.py                # API routes
│   ├── models.py              # Database models
│   ├── database.py            # DB config
│   ├── auth.py                # Auth utilities
│   ├── scheduler.py           # Timetable solver
│   ├── init_db.py             # DB initialization
│   ├── requirements.txt       # Dependencies
│   ├── start.bat              # Windows startup
│   ├── start.sh               # Linux/Mac startup
│   └── README.md              # Backend docs
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── forms/        # Data entry forms
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   ├── context/          # React context
│   │   ├── services/         # API layer
│   │   ├── utils/            # Utilities
│   │   ├── App.jsx           # Main app
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── README.md             # Frontend docs
│
└── README.md                  # This file
```

## Usage Guide

### 1. Data Management
Navigate to **Data Management** page to add:
- **Classrooms** - Rooms, labs, capacity, location
- **Batches** - Student groups, programs, departments
- **Subjects** - Courses, credits, hours
- **Faculty** - Teachers, availability, workload
- **Constraints** - Scheduling rules and preferences

### 2. Generate Timetable
1. Go to **Generate** page
2. Click "Generate Timetables"
3. System creates 3 optimal options
4. View quality scores and utilization rates

### 3. Review Timetables
1. Go to **View Timetables** page
2. Compare different options
3. Check for conflicts
4. View in grid or list format

### 4. Approval Workflow
1. Go to **Approvals** page
2. Review pending timetables
3. Add comments
4. Approve or reject

## API Documentation

Interactive API docs available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints
```
POST   /api/login              # Authentication
GET    /api/classrooms         # List classrooms
POST   /api/classrooms         # Create classroom
GET    /api/batches            # List batches
POST   /api/generate           # Generate timetables
GET    /api/dashboard/stats    # Get statistics
```

## Configuration

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/timetable_db
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000/api
```

## Database Schema

### Core Tables
- users, classrooms, batches, subjects, faculty
- time_slots, scheduling_constraints

### Timetable Tables
- timetable_options, timetable_entries
- approval_records, conflicts

## Security Features

- JWT token authentication
- Bcrypt password hashing
- Input validation (Pydantic)
- SQL injection prevention (ORM)
- CORS configuration
- Protected API endpoints

## Development

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Troubleshooting

### Backend Issues
- **Database Error**: Check PostgreSQL is running and DATABASE_URL is correct
- **Import Error**: Activate virtual environment and install requirements
- **Port in Use**: Change port in start script

### Frontend Issues
- **CORS Error**: Check backend CORS configuration
- **401 Error**: Token expired, login again
- **Connection Refused**: Ensure backend is running

## Production Deployment

### Backend
1. Change SECRET_KEY to strong random value
2. Use production database
3. Enable HTTPS
4. Configure logging
5. Set up monitoring

### Frontend
1. Build: `npm run build`
2. Serve `dist/` folder
3. Update API_URL to production backend
4. Configure CDN if needed

## Testing

### Manual Testing
- Use Swagger UI at /docs
- Test all CRUD operations
- Verify authentication flow
- Test timetable generation

### Automated Testing (Future)
- Unit tests for services
- Integration tests for APIs
- Component tests for React
- E2E tests for workflows

## Documentation

- **Backend**: See `backend/README.md`
- **Frontend**: See `frontend/README.md`
- **API**: http://localhost:8000/docs

## Support

For issues or questions:
1. Check documentation in respective README files
2. Review API documentation at /docs
3. Check server logs
4. Verify configuration files

## License

This project is for educational purposes.

## Contributors

Developed as a comprehensive timetable scheduling solution for educational institutions.
