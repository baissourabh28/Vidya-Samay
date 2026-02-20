# Backend Documentation

## Overview
FastAPI-based REST API for College Timetable Scheduling System with constraint programming optimization.

## Tech Stack
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Database
- **OR-Tools** - Google's constraint solver
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL 12+

### Installation

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

### Manual Setup
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Access Points
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/api/health

## Default Credentials
- Username: `admin`
- Password: `admin123`

## Project Structure
```
backend/
├── services/              # Business logic
│   ├── auth_service.py   # Authentication
│   └── data_service.py   # CRUD operations
├── main.py               # API routes
├── models.py             # Database models
├── database.py           # DB configuration
├── auth.py               # Auth utilities
├── scheduler.py          # Timetable solver
├── init_db.py           # DB initialization
├── requirements.txt      # Dependencies
├── start.bat            # Windows startup
└── start.sh             # Linux/Mac startup
```

## API Endpoints

### Authentication
```
POST   /api/login       # Login
GET    /api/me          # Get current user
POST   /api/logout      # Logout
```

### Classrooms
```
GET    /api/classrooms              # List all
GET    /api/classrooms/{id}         # Get by ID
POST   /api/classrooms              # Create
PUT    /api/classrooms/{id}         # Update
DELETE /api/classrooms/{id}         # Delete
```

### Batches
```
GET    /api/batches                 # List all
GET    /api/batches/{id}            # Get by ID
POST   /api/batches                 # Create
PUT    /api/batches/{id}            # Update
DELETE /api/batches/{id}            # Delete
```

### Subjects
```
GET    /api/subjects                # List all
GET    /api/subjects/{id}           # Get by ID
POST   /api/subjects                # Create
PUT    /api/subjects/{id}           # Update
DELETE /api/subjects/{id}           # Delete
```

### Faculty
```
GET    /api/faculty                 # List all
GET    /api/faculty/{id}            # Get by ID
POST   /api/faculty                 # Create
PUT    /api/faculty/{id}            # Update
DELETE /api/faculty/{id}            # Delete
```

### Constraints
```
GET    /api/constraints             # Get constraints
POST   /api/constraints             # Update constraints
```

### Timetable
```
POST   /api/generate                # Generate timetables
GET    /api/timetables              # List all
GET    /api/timetables/{id}         # Get by ID
POST   /api/timetables/{id}/approve # Approve
POST   /api/timetables/{id}/reject  # Reject
```

### Dashboard
```
GET    /api/dashboard/stats         # Get statistics
```

## Database Models

### Core Entities
- **User** - System users
- **Classroom** - Physical spaces
- **Batch** - Student groups
- **Subject** - Courses
- **Faculty** - Teachers
- **TimeSlot** - Time periods
- **SchedulingConstraints** - Rules

### Timetable Entities
- **TimetableOption** - Generated timetables
- **TimetableEntry** - Class assignments
- **ApprovalRecord** - Approval history

## Environment Variables

Create `.env` file:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/timetable_db
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

## Security Features
- JWT token authentication
- Bcrypt password hashing
- Input validation (Pydantic)
- SQL injection prevention (ORM)
- CORS configuration

## Timetable Generation

Uses Google OR-Tools CP-SAT solver with constraints:
- No faculty double-booking
- No classroom double-booking
- No batch double-booking
- Room capacity validation
- Faculty availability
- Fixed slots preservation

## Development

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Testing
- Swagger UI: http://localhost:8000/docs
- Interactive API testing
- Try-it-out functionality

## Troubleshooting

**Database Connection Error**
- Check DATABASE_URL in .env
- Verify PostgreSQL is running

**Import Errors**
- Activate virtual environment
- Run `pip install -r requirements.txt`

**Port Already in Use**
- Change port in start script
- Or kill process on port 8000

## Production Deployment

1. Change SECRET_KEY to strong random value
2. Use production database
3. Enable HTTPS
4. Configure proper CORS
5. Set up logging and monitoring

## Support
For issues, check:
- API Documentation: /docs
- Health endpoint: /api/health
- Server logs in console
