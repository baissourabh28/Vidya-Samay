"""
FastAPI Backend for College Timetable Scheduler

This module provides the main API endpoints for the timetable scheduling system.
It handles authentication, data management, timetable generation, and approval workflows.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, time

# Local imports
from database import get_db, engine, Base
from services.auth_service import AuthService
from services.data_service import (
    ClassroomService, BatchService, SubjectService, 
    FacultyService, TimetableService, ConstraintsService
)
from auth import verify_token as verify_jwt_token
from scheduler import TimetableScheduler
from models import *

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="College Timetable Scheduler API",
    description="API for managing college timetable scheduling with constraint optimization",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# ==================== Pydantic Models ====================

class LoginRequest(BaseModel):
    """Login request model"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class ClassroomCreate(BaseModel):
    """Classroom creation model"""
    name: str = Field(..., min_length=1, max_length=100)
    capacity: int = Field(..., gt=0, le=500)
    type: str = Field(..., pattern="^(classroom|lab|auditorium)$")
    building: Optional[str] = Field(None, max_length=50)
    floor: Optional[int] = Field(None, ge=0, le=20)

class ClassroomUpdate(BaseModel):
    """Classroom update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    capacity: Optional[int] = Field(None, gt=0, le=500)
    type: Optional[str] = Field(None, pattern="^(classroom|lab|auditorium)$")
    building: Optional[str] = Field(None, max_length=50)
    floor: Optional[int] = Field(None, ge=0, le=20)
    available: Optional[bool] = None

class BatchCreate(BaseModel):
    """Batch creation model"""
    name: str = Field(..., min_length=1, max_length=100)
    program: str = Field(..., pattern="^(UG|PG)$")
    department: str = Field(..., min_length=1, max_length=100)
    year: int = Field(..., ge=1, le=5)
    semester: int = Field(..., ge=1, le=10)
    student_count: int = Field(..., gt=0, le=500)
    shift: str = Field(default="morning", pattern="^(morning|afternoon|evening)$")

class BatchUpdate(BaseModel):
    """Batch update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    program: Optional[str] = Field(None, pattern="^(UG|PG)$")
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    year: Optional[int] = Field(None, ge=1, le=5)
    semester: Optional[int] = Field(None, ge=1, le=10)
    student_count: Optional[int] = Field(None, gt=0, le=500)
    shift: Optional[str] = Field(None, pattern="^(morning|afternoon|evening)$")

class SubjectCreate(BaseModel):
    """Subject creation model"""
    code: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=200)
    department: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., pattern="^(core|elective|lab)$")
    credits: int = Field(..., ge=1, le=6)
    hours_per_week: int = Field(..., ge=1, le=10)
    requires_lab: bool = Field(default=False)

class SubjectUpdate(BaseModel):
    """Subject update model"""
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, pattern="^(core|elective|lab)$")
    credits: Optional[int] = Field(None, ge=1, le=6)
    hours_per_week: Optional[int] = Field(None, ge=1, le=10)
    requires_lab: Optional[bool] = None

class FacultyCreate(BaseModel):
    """Faculty creation model"""
    name: str = Field(..., min_length=1, max_length=200)
    employee_id: str = Field(..., min_length=1, max_length=50)
    department: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    max_hours_per_week: int = Field(default=20, ge=1, le=40)
    availability: Optional[Dict] = None
    leaves: Optional[List[Dict]] = None

class FacultyUpdate(BaseModel):
    """Faculty update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    employee_id: Optional[str] = Field(None, min_length=1, max_length=50)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    max_hours_per_week: Optional[int] = Field(None, ge=1, le=40)
    availability: Optional[Dict] = None
    leaves: Optional[List[Dict]] = None

class ConstraintsUpdate(BaseModel):
    """Scheduling constraints update model"""
    classes_per_day_min: Optional[int] = Field(None, ge=1, le=10)
    classes_per_day_max: Optional[int] = Field(None, ge=1, le=10)
    classes_per_week: Optional[int] = Field(None, ge=5, le=50)
    break_duration_minutes: Optional[int] = Field(None, ge=0, le=30)
    lunch_break_start: Optional[str] = None
    lunch_break_end: Optional[str] = None
    target_utilization_rate: Optional[float] = Field(None, ge=0.5, le=1.0)

class ScheduleInput(BaseModel):
    """Timetable generation input model"""
    classrooms: List[dict]
    faculty: List[dict]
    subjects: List[dict]
    batches: List[dict]
    constraints: dict

class ApprovalAction(BaseModel):
    """Timetable approval/rejection model"""
    comments: Optional[str] = Field(None, max_length=1000)

# ==================== Dependencies ====================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user.
    
    Args:
        credentials: HTTP Bearer token
        db: Database session
    
    Returns:
        User object
    
    Raises:
        HTTPException: If authentication fails
    """
    payload = verify_jwt_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    auth_service = AuthService(db)
    user = auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

# ==================== Startup Event ====================

@app.on_event("startup")
async def startup_event():
    """Initialize database with default admin user if not exists."""
    db = next(get_db())
    try:
        auth_service = AuthService(db)
        
        # Create default admin user if not exists
        if not auth_service.get_user_by_username("admin"):
            auth_service.create_user("admin", "admin123", "admin")
            print("✓ Created default admin user: admin/admin123")
    finally:
        db.close()

# ==================== Health & Info Endpoints ====================

@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/datetime", tags=["System"])
async def get_datetime():
    """
    Get current server date and time.
    Returns real-time date/time information in multiple formats.
    """
    now = datetime.utcnow()
    return {
        "iso": now.isoformat(),
        "utc": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "year": now.year,
        "month": now.month,
        "day": now.day,
        "hour": now.hour,
        "minute": now.minute,
        "second": now.second,
        "weekday": now.strftime("%A"),
        "date_formatted": now.strftime("%B %d, %Y"),
        "time_formatted": now.strftime("%I:%M %p"),
        "timestamp": int(now.timestamp()),
        "timezone": "UTC"
    }

@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "College Timetable Scheduler API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

# ==================== Authentication Endpoints ====================

@app.post("/api/login", tags=["Authentication"])
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    
    Args:
        req: Login credentials
        db: Database session
    
    Returns:
        Token and user information
    
    Raises:
        HTTPException: If authentication fails
    """
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(req.username, req.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    token = auth_service.generate_token(user)
    return {
        "token": token,
        "username": user.username,
        "role": user.role
    }

@app.get("/api/me", tags=["Authentication"])
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Args:
        current_user: Authenticated user
    
    Returns:
        User information
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None
    }

@app.post("/api/logout", tags=["Authentication"])
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout user (client should discard token).
    
    Args:
        current_user: Authenticated user
    
    Returns:
        Success message
    """
    return {"message": "Logged out successfully"}


# ==================== Classroom Endpoints ====================

@app.get("/api/classrooms", tags=["Classrooms"])
async def get_classrooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all classrooms"""
    service = ClassroomService(db)
    classrooms = service.get_all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "capacity": c.capacity,
            "type": c.type,
            "building": c.building,
            "floor": c.floor,
            "available": c.available
        }
        for c in classrooms
    ]

@app.get("/api/classrooms/{classroom_id}", tags=["Classrooms"])
async def get_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get classroom by ID"""
    service = ClassroomService(db)
    classroom = service.get_by_id(classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    return {
        "id": classroom.id,
        "name": classroom.name,
        "capacity": classroom.capacity,
        "type": classroom.type,
        "building": classroom.building,
        "floor": classroom.floor,
        "available": classroom.available
    }

@app.post("/api/classrooms", tags=["Classrooms"], status_code=status.HTTP_201_CREATED)
async def create_classroom(
    data: ClassroomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new classroom"""
    service = ClassroomService(db)
    classroom = service.create(
        name=data.name,
        capacity=data.capacity,
        type=data.type,
        building=data.building,
        floor=data.floor
    )
    return {
        "id": classroom.id,
        "name": classroom.name,
        "capacity": classroom.capacity,
        "type": classroom.type,
        "building": classroom.building,
        "floor": classroom.floor,
        "available": classroom.available
    }

@app.put("/api/classrooms/{classroom_id}", tags=["Classrooms"])
async def update_classroom(
    classroom_id: int,
    data: ClassroomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update classroom"""
    service = ClassroomService(db)
    
    # Build update dict with only provided fields
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    classroom = service.update(classroom_id, **update_data)
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    return {
        "id": classroom.id,
        "name": classroom.name,
        "capacity": classroom.capacity,
        "type": classroom.type,
        "building": classroom.building,
        "floor": classroom.floor,
        "available": classroom.available
    }

@app.delete("/api/classrooms/{classroom_id}", tags=["Classrooms"])
async def delete_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete classroom"""
    service = ClassroomService(db)
    success = service.delete(classroom_id)
    if not success:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    return {"message": "Classroom deleted successfully"}

# ==================== Batch Endpoints ====================

@app.get("/api/batches", tags=["Batches"])
async def get_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all batches"""
    service = BatchService(db)
    batches = service.get_all()
    return [
        {
            "id": b.id,
            "name": b.name,
            "program": b.program,
            "department": b.department,
            "year": b.year,
            "semester": b.semester,
            "student_count": b.student_count,
            "shift": b.shift
        }
        for b in batches
    ]

@app.get("/api/batches/{batch_id}", tags=["Batches"])
async def get_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get batch by ID"""
    service = BatchService(db)
    batch = service.get_by_id(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return {
        "id": batch.id,
        "name": batch.name,
        "program": batch.program,
        "department": batch.department,
        "year": batch.year,
        "semester": batch.semester,
        "student_count": batch.student_count,
        "shift": batch.shift
    }

@app.post("/api/batches", tags=["Batches"], status_code=status.HTTP_201_CREATED)
async def create_batch(
    data: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new batch"""
    service = BatchService(db)
    batch = service.create(
        name=data.name,
        program=data.program,
        department=data.department,
        year=data.year,
        semester=data.semester,
        student_count=data.student_count,
        shift=data.shift
    )
    return {
        "id": batch.id,
        "name": batch.name,
        "program": batch.program,
        "department": batch.department,
        "year": batch.year,
        "semester": batch.semester,
        "student_count": batch.student_count,
        "shift": batch.shift
    }

@app.put("/api/batches/{batch_id}", tags=["Batches"])
async def update_batch(
    batch_id: int,
    data: BatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update batch"""
    service = BatchService(db)
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    batch = service.update(batch_id, **update_data)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return {
        "id": batch.id,
        "name": batch.name,
        "program": batch.program,
        "department": batch.department,
        "year": batch.year,
        "semester": batch.semester,
        "student_count": batch.student_count,
        "shift": batch.shift
    }

@app.delete("/api/batches/{batch_id}", tags=["Batches"])
async def delete_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete batch"""
    service = BatchService(db)
    success = service.delete(batch_id)
    if not success:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return {"message": "Batch deleted successfully"}

# ==================== Subject Endpoints ====================

@app.get("/api/subjects", tags=["Subjects"])
async def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all subjects"""
    service = SubjectService(db)
    subjects = service.get_all()
    return [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "department": s.department,
            "type": s.type,
            "credits": s.credits,
            "hours_per_week": s.hours_per_week,
            "requires_lab": s.requires_lab
        }
        for s in subjects
    ]

@app.get("/api/subjects/{subject_id}", tags=["Subjects"])
async def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get subject by ID"""
    service = SubjectService(db)
    subject = service.get_by_id(subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    return {
        "id": subject.id,
        "code": subject.code,
        "name": subject.name,
        "department": subject.department,
        "type": subject.type,
        "credits": subject.credits,
        "hours_per_week": subject.hours_per_week,
        "requires_lab": subject.requires_lab
    }

@app.post("/api/subjects", tags=["Subjects"], status_code=status.HTTP_201_CREATED)
async def create_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new subject"""
    service = SubjectService(db)
    
    # Check if subject code already exists
    existing = db.query(Subject).filter(Subject.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject code already exists")
    
    subject = service.create(
        code=data.code,
        name=data.name,
        department=data.department,
        type=data.type,
        credits=data.credits,
        hours_per_week=data.hours_per_week,
        requires_lab=data.requires_lab
    )
    return {
        "id": subject.id,
        "code": subject.code,
        "name": subject.name,
        "department": subject.department,
        "type": subject.type,
        "credits": subject.credits,
        "hours_per_week": subject.hours_per_week,
        "requires_lab": subject.requires_lab
    }

@app.put("/api/subjects/{subject_id}", tags=["Subjects"])
async def update_subject(
    subject_id: int,
    data: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update subject"""
    service = SubjectService(db)
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    subject = service.update(subject_id, **update_data)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    return {
        "id": subject.id,
        "code": subject.code,
        "name": subject.name,
        "department": subject.department,
        "type": subject.type,
        "credits": subject.credits,
        "hours_per_week": subject.hours_per_week,
        "requires_lab": subject.requires_lab
    }

@app.delete("/api/subjects/{subject_id}", tags=["Subjects"])
async def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete subject"""
    service = SubjectService(db)
    success = service.delete(subject_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    return {"message": "Subject deleted successfully"}

# ==================== Faculty Endpoints ====================

@app.get("/api/faculty", tags=["Faculty"])
async def get_faculty(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all faculty"""
    service = FacultyService(db)
    faculty = service.get_all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "employee_id": f.employee_id,
            "department": f.department,
            "email": f.email,
            "max_hours_per_week": f.max_hours_per_week,
            "availability": f.availability,
            "leaves": f.leaves
        }
        for f in faculty
    ]

@app.get("/api/faculty/{faculty_id}", tags=["Faculty"])
async def get_faculty_member(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get faculty by ID"""
    service = FacultyService(db)
    faculty = service.get_by_id(faculty_id)
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    return {
        "id": faculty.id,
        "name": faculty.name,
        "employee_id": faculty.employee_id,
        "department": faculty.department,
        "email": faculty.email,
        "max_hours_per_week": faculty.max_hours_per_week,
        "availability": faculty.availability,
        "leaves": faculty.leaves
    }

@app.post("/api/faculty", tags=["Faculty"], status_code=status.HTTP_201_CREATED)
async def create_faculty(
    data: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new faculty member"""
    service = FacultyService(db)
    
    # Check if employee_id or email already exists
    existing_emp = db.query(Faculty).filter(Faculty.employee_id == data.employee_id).first()
    if existing_emp:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    
    existing_email = db.query(Faculty).filter(Faculty.email == data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    faculty = service.create(
        name=data.name,
        employee_id=data.employee_id,
        department=data.department,
        email=data.email,
        max_hours_per_week=data.max_hours_per_week,
        availability=data.availability,
        leaves=data.leaves
    )
    return {
        "id": faculty.id,
        "name": faculty.name,
        "employee_id": faculty.employee_id,
        "department": faculty.department,
        "email": faculty.email,
        "max_hours_per_week": faculty.max_hours_per_week,
        "availability": faculty.availability,
        "leaves": faculty.leaves
    }

@app.put("/api/faculty/{faculty_id}", tags=["Faculty"])
async def update_faculty(
    faculty_id: int,
    data: FacultyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update faculty"""
    service = FacultyService(db)
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    faculty = service.update(faculty_id, **update_data)
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    return {
        "id": faculty.id,
        "name": faculty.name,
        "employee_id": faculty.employee_id,
        "department": faculty.department,
        "email": faculty.email,
        "max_hours_per_week": faculty.max_hours_per_week,
        "availability": faculty.availability,
        "leaves": faculty.leaves
    }

@app.delete("/api/faculty/{faculty_id}", tags=["Faculty"])
async def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete faculty"""
    service = FacultyService(db)
    success = service.delete(faculty_id)
    if not success:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    return {"message": "Faculty deleted successfully"}

# ==================== Constraints Endpoints ====================

@app.get("/api/constraints", tags=["Constraints"])
async def get_constraints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scheduling constraints"""
    service = ConstraintsService(db)
    constraints = service.get_constraints()
    
    if not constraints:
        # Return default values if not set
        return {
            "classes_per_day_min": 4,
            "classes_per_day_max": 8,
            "classes_per_week": 30,
            "break_duration_minutes": 10,
            "lunch_break_start": "13:00",
            "lunch_break_end": "14:00",
            "target_utilization_rate": 0.8
        }
    
    return {
        "id": constraints.id,
        "classes_per_day_min": constraints.classes_per_day_min,
        "classes_per_day_max": constraints.classes_per_day_max,
        "classes_per_week": constraints.classes_per_week,
        "break_duration_minutes": constraints.break_duration_minutes,
        "lunch_break_start": constraints.lunch_break_start.strftime("%H:%M") if constraints.lunch_break_start else None,
        "lunch_break_end": constraints.lunch_break_end.strftime("%H:%M") if constraints.lunch_break_end else None,
        "target_utilization_rate": constraints.target_utilization_rate
    }

@app.post("/api/constraints", tags=["Constraints"])
async def update_constraints(
    data: ConstraintsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update scheduling constraints"""
    service = ConstraintsService(db)
    
    # Convert time strings to time objects
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if 'lunch_break_start' in update_data and update_data['lunch_break_start']:
        h, m = map(int, update_data['lunch_break_start'].split(':'))
        update_data['lunch_break_start'] = time(h, m)
    
    if 'lunch_break_end' in update_data and update_data['lunch_break_end']:
        h, m = map(int, update_data['lunch_break_end'].split(':'))
        update_data['lunch_break_end'] = time(h, m)
    
    constraints = service.update_constraints(**update_data)
    
    return {
        "id": constraints.id,
        "classes_per_day_min": constraints.classes_per_day_min,
        "classes_per_day_max": constraints.classes_per_day_max,
        "classes_per_week": constraints.classes_per_week,
        "break_duration_minutes": constraints.break_duration_minutes,
        "lunch_break_start": constraints.lunch_break_start.strftime("%H:%M") if constraints.lunch_break_start else None,
        "lunch_break_end": constraints.lunch_break_end.strftime("%H:%M") if constraints.lunch_break_end else None,
        "target_utilization_rate": constraints.target_utilization_rate
    }

# ==================== Timetable Generation ====================

@app.post("/api/generate", tags=["Timetable"])
async def generate_timetable(
    data: ScheduleInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate optimized timetable options.
    
    This endpoint uses constraint programming to generate multiple
    feasible timetable solutions based on the provided data.
    """
    scheduler = TimetableScheduler(
        data.classrooms,
        data.faculty,
        data.subjects,
        data.batches,
        data.constraints
    )
    
    results = scheduler.generate_schedules(num_solutions=3)
    
    if not results:
        return {
            "success": False,
            "message": "No feasible solution found with current constraints",
            "suggestions": scheduler.get_suggestions()
        }
    
    # Save generated timetables to database
    service = TimetableService(db)
    saved_timetables = []
    
    current_date = datetime.now()
    for idx, schedule in enumerate(results):
        timetable = service.create_timetable(
            name=f"Option {idx + 1} - {current_date.strftime('%B %Y')} ({current_date.strftime('%Y-%m-%d %H:%M')})",
            entries=schedule,
            generated_by=current_user.id
        )
        saved_timetables.append({
            "id": timetable.id,
            "name": timetable.name,
            "schedule": schedule
        })
    
    return {
        "success": True,
        "timetables": saved_timetables,
        "conflicts": scheduler.check_conflicts()
    }

@app.get("/api/timetables", tags=["Timetable"])
async def get_timetables(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None
):
    """Get all timetables, optionally filtered by status."""
    service = TimetableService(db)
    timetables = service.get_all_timetables()
    
    if status:
        timetables = [tt for tt in timetables if tt.status == status]
    
    result = []
    for tt in timetables:
        entries = db.query(TimetableEntry).filter(
            TimetableEntry.timetable_id == tt.id
        ).all()
        
        entry_list = []
        for entry in entries:
            time_slot = db.query(TimeSlot).filter(TimeSlot.id == entry.time_slot_id).first()
            entry_list.append({
                "id": entry.id,
                "subject": {
                    "id": entry.subject.id,
                    "code": entry.subject.code,
                    "name": entry.subject.name
                },
                "faculty": {
                    "id": entry.faculty.id,
                    "name": entry.faculty.name,
                    "employee_id": entry.faculty.employee_id
                },
                "batch": {
                    "id": entry.batch.id,
                    "name": entry.batch.name,
                    "department": entry.batch.department
                },
                "classroom": {
                    "id": entry.classroom.id,
                    "name": entry.classroom.name,
                    "capacity": entry.classroom.capacity
                },
                "time_slot": {
                    "id": entry.time_slot_id,
                    "day": time_slot.day if time_slot else None,
                    "start_time": str(time_slot.start_time) if time_slot else None,
                    "end_time": str(time_slot.end_time) if time_slot else None,
                    "slot_number": time_slot.slot_number if time_slot else None
                },
                "is_fixed": entry.is_fixed
            })
        
        result.append({
            "id": tt.id,
            "name": tt.name,
            "status": tt.status,
            "generated_at": tt.generated_at.isoformat() if tt.generated_at else None,
            "utilization_rate": tt.utilization_rate,
            "conflict_count": tt.conflict_count,
            "quality_score": tt.quality_score,
            "entries": entry_list
        })
    
    return result

@app.get("/api/timetables/{timetable_id}", tags=["Timetable"])
async def get_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific timetable by ID."""
    service = TimetableService(db)
    timetable = service.get_by_id(timetable_id)
    
    if not timetable:
        raise HTTPException(status_code=404, detail="Timetable not found")
    
    entries = db.query(TimetableEntry).filter(
        TimetableEntry.timetable_id == timetable.id
    ).all()
    
    entry_list = []
    for entry in entries:
        time_slot = db.query(TimeSlot).filter(TimeSlot.id == entry.time_slot_id).first()
        entry_list.append({
            "id": entry.id,
            "subject": {
                "id": entry.subject.id,
                "code": entry.subject.code,
                "name": entry.subject.name
            },
            "faculty": {
                "id": entry.faculty.id,
                "name": entry.faculty.name,
                "employee_id": entry.faculty.employee_id
            },
            "batch": {
                "id": entry.batch.id,
                "name": entry.batch.name,
                "department": entry.batch.department
            },
            "classroom": {
                "id": entry.classroom.id,
                "name": entry.classroom.name,
                "capacity": entry.classroom.capacity
            },
            "time_slot": {
                "id": entry.time_slot_id,
                "day": time_slot.day if time_slot else None,
                "start_time": str(time_slot.start_time) if time_slot else None,
                "end_time": str(time_slot.end_time) if time_slot else None,
                "slot_number": time_slot.slot_number if time_slot else None
            },
            "is_fixed": entry.is_fixed
        })
    
    return {
        "id": timetable.id,
        "name": timetable.name,
        "status": timetable.status,
        "generated_at": timetable.generated_at.isoformat() if timetable.generated_at else None,
        "utilization_rate": timetable.utilization_rate,
        "conflict_count": timetable.conflict_count,
        "quality_score": timetable.quality_score,
        "entries": entry_list
    }

@app.post("/api/timetables/{timetable_id}/approve", tags=["Timetable"])
async def approve_timetable(
    timetable_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a timetable and set it as active."""
    service = TimetableService(db)
    
    # Set all other active timetables to archived
    db.query(TimetableOption).filter(
        TimetableOption.status == "active"
    ).update({"status": "archived"})
    
    # Approve and activate this timetable
    success = service.approve_timetable(
        timetable_id=timetable_id,
        admin_id=current_user.id,
        comments=action.comments
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Timetable not found")
    
    # Set status to active
    timetable = service.get_by_id(timetable_id)
    timetable.status = "active"
    db.commit()
    
    return {
        "success": True,
        "message": "Timetable approved and activated successfully",
        "timetable_id": timetable_id
    }

@app.post("/api/timetables/{timetable_id}/reject", tags=["Timetable"])
async def reject_timetable(
    timetable_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject a timetable."""
    if not action.comments or not action.comments.strip():
        raise HTTPException(
            status_code=400,
            detail="Comments are required for rejection"
        )
    
    service = TimetableService(db)
    success = service.reject_timetable(
        timetable_id=timetable_id,
        admin_id=current_user.id,
        comments=action.comments
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Timetable not found")
    
    return {
        "success": True,
        "message": "Timetable rejected successfully",
        "timetable_id": timetable_id
    }

@app.delete("/api/timetables/{timetable_id}", tags=["Timetable"])
async def delete_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a timetable."""
    service = TimetableService(db)
    success = service.delete_timetable(timetable_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Timetable not found")
    
    return {"message": "Timetable deleted successfully"}

# ==================== Dashboard Endpoints ====================

@app.get("/api/dashboard/stats", tags=["Dashboard"])
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    # Count entities
    classroom_count = db.query(Classroom).count()
    batch_count = db.query(Batch).count()
    subject_count = db.query(Subject).count()
    faculty_count = db.query(Faculty).count()
    
    # Get active timetable
    active_timetable = db.query(TimetableOption).filter(
        TimetableOption.status == "active"
    ).first()
    
    # Get pending approvals
    pending_count = db.query(TimetableOption).filter(
        TimetableOption.status == "draft"
    ).count()
    
    return {
        "activeTimetable": active_timetable.name if active_timetable else None,
        "pendingApprovals": pending_count,
        "totalClassrooms": classroom_count,
        "totalFaculty": faculty_count,
        "totalBatches": batch_count,
        "totalSubjects": subject_count,
        "utilizationRate": active_timetable.utilization_rate if active_timetable else 0
    }
