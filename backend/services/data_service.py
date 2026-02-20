"""Services for managing input data entities."""
from sqlalchemy.orm import Session
from models import Classroom, Batch, Subject, Faculty, SchedulingConstraints, TimetableOption, TimetableEntry, ApprovalRecord
from typing import List, Optional

class ClassroomService:
    """Service for classroom CRUD operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, name: str, capacity: int, type: str, building: str = None, floor: int = None) -> Classroom:
        """Create a new classroom."""
        classroom = Classroom(
            name=name,
            capacity=capacity,
            type=type,
            building=building,
            floor=floor
        )
        self.db.add(classroom)
        self.db.commit()
        self.db.refresh(classroom)
        return classroom
    
    def get_by_id(self, classroom_id: int) -> Optional[Classroom]:
        """Get classroom by ID."""
        return self.db.query(Classroom).filter(Classroom.id == classroom_id).first()
    
    def get_all(self) -> List[Classroom]:
        """Get all classrooms."""
        return self.db.query(Classroom).all()
    
    def update(self, classroom_id: int, **kwargs) -> Optional[Classroom]:
        """Update classroom."""
        classroom = self.get_by_id(classroom_id)
        if not classroom:
            return None
        
        for key, value in kwargs.items():
            if hasattr(classroom, key):
                setattr(classroom, key, value)
        
        self.db.commit()
        self.db.refresh(classroom)
        return classroom
    
    def delete(self, classroom_id: int) -> bool:
        """Delete classroom."""
        classroom = self.get_by_id(classroom_id)
        if not classroom:
            return False
        
        self.db.delete(classroom)
        self.db.commit()
        return True

class BatchService:
    """Service for batch CRUD operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, name: str, program: str, department: str, year: int, 
               semester: int, student_count: int, shift: str = "morning") -> Batch:
        """Create a new batch."""
        batch = Batch(
            name=name,
            program=program,
            department=department,
            year=year,
            semester=semester,
            student_count=student_count,
            shift=shift
        )
        self.db.add(batch)
        self.db.commit()
        self.db.refresh(batch)
        return batch
    
    def get_by_id(self, batch_id: int) -> Optional[Batch]:
        """Get batch by ID."""
        return self.db.query(Batch).filter(Batch.id == batch_id).first()
    
    def get_all(self) -> List[Batch]:
        """Get all batches."""
        return self.db.query(Batch).all()
    
    def update(self, batch_id: int, **kwargs) -> Optional[Batch]:
        """Update batch."""
        batch = self.get_by_id(batch_id)
        if not batch:
            return None
        
        for key, value in kwargs.items():
            if hasattr(batch, key):
                setattr(batch, key, value)
        
        self.db.commit()
        self.db.refresh(batch)
        return batch
    
    def delete(self, batch_id: int) -> bool:
        """Delete batch."""
        batch = self.get_by_id(batch_id)
        if not batch:
            return False
        
        self.db.delete(batch)
        self.db.commit()
        return True

class SubjectService:
    """Service for subject CRUD operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, code: str, name: str, department: str, type: str,
               credits: int, hours_per_week: int, requires_lab: bool = False) -> Subject:
        """Create a new subject."""
        subject = Subject(
            code=code,
            name=name,
            department=department,
            type=type,
            credits=credits,
            hours_per_week=hours_per_week,
            requires_lab=requires_lab
        )
        self.db.add(subject)
        self.db.commit()
        self.db.refresh(subject)
        return subject
    
    def get_by_id(self, subject_id: int) -> Optional[Subject]:
        """Get subject by ID."""
        return self.db.query(Subject).filter(Subject.id == subject_id).first()
    
    def get_all(self) -> List[Subject]:
        """Get all subjects."""
        return self.db.query(Subject).all()
    
    def update(self, subject_id: int, **kwargs) -> Optional[Subject]:
        """Update subject."""
        subject = self.get_by_id(subject_id)
        if not subject:
            return None
        
        for key, value in kwargs.items():
            if hasattr(subject, key):
                setattr(subject, key, value)
        
        self.db.commit()
        self.db.refresh(subject)
        return subject
    
    def delete(self, subject_id: int) -> bool:
        """Delete subject."""
        subject = self.get_by_id(subject_id)
        if not subject:
            return False
        
        self.db.delete(subject)
        self.db.commit()
        return True

class FacultyService:
    """Service for faculty CRUD operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, name: str, employee_id: str, department: str, email: str,
               max_hours_per_week: int = 20, availability: dict = None, leaves: dict = None) -> Faculty:
        """Create a new faculty member."""
        faculty = Faculty(
            name=name,
            employee_id=employee_id,
            department=department,
            email=email,
            max_hours_per_week=max_hours_per_week,
            availability=availability,
            leaves=leaves
        )
        self.db.add(faculty)
        self.db.commit()
        self.db.refresh(faculty)
        return faculty
    
    def get_by_id(self, faculty_id: int) -> Optional[Faculty]:
        """Get faculty by ID."""
        return self.db.query(Faculty).filter(Faculty.id == faculty_id).first()
    
    def get_all(self) -> List[Faculty]:
        """Get all faculty."""
        return self.db.query(Faculty).all()
    
    def update(self, faculty_id: int, **kwargs) -> Optional[Faculty]:
        """Update faculty."""
        faculty = self.get_by_id(faculty_id)
        if not faculty:
            return None
        
        for key, value in kwargs.items():
            if hasattr(faculty, key):
                setattr(faculty, key, value)
        
        self.db.commit()
        self.db.refresh(faculty)
        return faculty
    
    def delete(self, faculty_id: int) -> bool:
        """Delete faculty."""
        faculty = self.get_by_id(faculty_id)
        if not faculty:
            return False
        
        self.db.delete(faculty)
        self.db.commit()
        return True
    
    def update_availability(self, faculty_id: int, availability: dict) -> Optional[Faculty]:
        """Update faculty availability."""
        return self.update(faculty_id, availability=availability)
    
    def add_leave(self, faculty_id: int, leave_data: dict) -> Optional[Faculty]:
        """Add leave for faculty."""
        faculty = self.get_by_id(faculty_id)
        if not faculty:
            return None
        
        leaves = faculty.leaves or []
        leaves.append(leave_data)
        return self.update(faculty_id, leaves=leaves)


class ConstraintsService:
    """Service for scheduling constraints operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_constraints(self) -> Optional[SchedulingConstraints]:
        """Get scheduling constraints (returns first record)."""
        return self.db.query(SchedulingConstraints).first()
    
    def update_constraints(self, **kwargs) -> SchedulingConstraints:
        """Update or create scheduling constraints."""
        constraints = self.get_constraints()
        
        if not constraints:
            # Create new constraints
            constraints = SchedulingConstraints(**kwargs)
            self.db.add(constraints)
        else:
            # Update existing
            for key, value in kwargs.items():
                if hasattr(constraints, key):
                    setattr(constraints, key, value)
        
        self.db.commit()
        self.db.refresh(constraints)
        return constraints

class TimetableService:
    """Service for timetable operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_timetable(self, name: str, entries: List[dict], generated_by: int) -> TimetableOption:
        """Create a new timetable option."""
        from datetime import datetime
        from models import TimeSlot
        
        timetable = TimetableOption(
            name=name,
            generated_at=datetime.utcnow(),
            status="draft"
        )
        self.db.add(timetable)
        self.db.commit()
        self.db.refresh(timetable)
        
        # Get all time slots to map day/slot to time_slot_id
        time_slots = self.db.query(TimeSlot).order_by(TimeSlot.slot_number).all()
        time_slot_map = {}
        for ts in time_slots:
            day_map = {
                'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4
            }
            day_idx = day_map.get(ts.day, 0)
            slot_idx = ts.slot_number % 8  # Assuming 8 slots per day
            key = (day_idx, slot_idx)
            if key not in time_slot_map:
                time_slot_map[key] = ts.id
        
        # Add entries
        for entry in entries:
            day = entry.get('day', 0)
            slot = entry.get('slot', 0)
            
            # Find matching time slot
            time_slot_id = time_slot_map.get((day, slot))
            if not time_slot_id:
                # Fallback: calculate slot number (day * 8 + slot)
                slot_number = day * 8 + slot
                time_slot = self.db.query(TimeSlot).filter(
                    TimeSlot.slot_number == slot_number
                ).first()
                if time_slot:
                    time_slot_id = time_slot.id
                else:
                    # If still not found, use first time slot as fallback
                    first_slot = self.db.query(TimeSlot).first()
                    time_slot_id = first_slot.id if first_slot else 1
            
            tt_entry = TimetableEntry(
                timetable_id=timetable.id,
                subject_id=entry.get('subject'),
                faculty_id=entry.get('faculty'),
                batch_id=entry.get('batch'),
                classroom_id=entry.get('classroom'),
                time_slot_id=time_slot_id
            )
            self.db.add(tt_entry)
        
        self.db.commit()
        return timetable
    
    def get_all_timetables(self) -> List[TimetableOption]:
        """Get all timetables."""
        return self.db.query(TimetableOption).order_by(TimetableOption.generated_at.desc()).all()
    
    def get_by_id(self, timetable_id: int) -> Optional[TimetableOption]:
        """Get timetable by ID."""
        return self.db.query(TimetableOption).filter(TimetableOption.id == timetable_id).first()
    
    def approve_timetable(self, timetable_id: int, admin_id: int, comments: str = None) -> bool:
        """Approve a timetable."""
        timetable = self.get_by_id(timetable_id)
        if not timetable:
            return False
        
        # Create approval record
        approval = ApprovalRecord(
            timetable_id=timetable_id,
            admin_id=admin_id,
            action="approved",
            comments=comments
        )
        self.db.add(approval)
        self.db.commit()
        return True
    
    def reject_timetable(self, timetable_id: int, admin_id: int, comments: str) -> bool:
        """Reject a timetable."""
        timetable = self.get_by_id(timetable_id)
        if not timetable:
            return False
        
        timetable.status = "rejected"
        
        # Create approval record
        approval = ApprovalRecord(
            timetable_id=timetable_id,
            admin_id=admin_id,
            action="rejected",
            comments=comments
        )
        self.db.add(approval)
        self.db.commit()
        return True
    
    def delete_timetable(self, timetable_id: int) -> bool:
        """Delete a timetable."""
        timetable = self.get_by_id(timetable_id)
        if not timetable:
            return False
        
        self.db.delete(timetable)
        self.db.commit()
        return True
