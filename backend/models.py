from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Time, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="admin")
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Classroom(Base):
    __tablename__ = "classrooms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    type = Column(String, nullable=False)  # 'classroom' or 'lab'
    building = Column(String, nullable=True)
    floor = Column(Integer, nullable=True)
    available = Column(Boolean, default=True)
    
    timetable_entries = relationship("TimetableEntry", back_populates="classroom")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    program = Column(String, nullable=False)  # 'UG' or 'PG'
    department = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    student_count = Column(Integer, nullable=False)
    shift = Column(String, default="morning")  # 'morning', 'afternoon', 'evening'
    
    timetable_entries = relationship("TimetableEntry", back_populates="batch")
    elective_preferences = relationship("ElectivePreference", back_populates="batch")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'core', 'elective', 'lab'
    credits = Column(Integer, nullable=False)
    hours_per_week = Column(Integer, nullable=False)
    requires_lab = Column(Boolean, default=False)
    
    timetable_entries = relationship("TimetableEntry", back_populates="subject")
    elective_preferences = relationship("ElectivePreference", back_populates="subject")

class Faculty(Base):
    __tablename__ = "faculty"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    employee_id = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    max_hours_per_week = Column(Integer, default=20)
    availability = Column(JSON, nullable=True)  # Store as JSON array
    leaves = Column(JSON, nullable=True)  # Store as JSON array
    
    timetable_entries = relationship("TimetableEntry", back_populates="faculty")

class TimeSlot(Base):
    __tablename__ = "time_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    day = Column(String, nullable=False)  # 'Monday', 'Tuesday', etc.
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    slot_number = Column(Integer, nullable=False)
    
    timetable_entries = relationship("TimetableEntry", back_populates="time_slot")

class FixedSlot(Base):
    __tablename__ = "fixed_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    time_slot_id = Column(Integer, ForeignKey("time_slots.id"), nullable=False)
    reason = Column(String, nullable=True)

class ElectivePreference(Base):
    __tablename__ = "elective_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    priority = Column(Integer, nullable=False)  # 1 = first choice, 2 = second choice
    
    batch = relationship("Batch", back_populates="elective_preferences")
    subject = relationship("Subject", back_populates="elective_preferences")

class SchedulingConstraints(Base):
    __tablename__ = "scheduling_constraints"
    
    id = Column(Integer, primary_key=True, index=True)
    classes_per_day_min = Column(Integer, default=4)
    classes_per_day_max = Column(Integer, default=8)
    classes_per_week = Column(Integer, default=30)
    break_duration_minutes = Column(Integer, default=10)
    lunch_break_start = Column(Time, nullable=True)
    lunch_break_end = Column(Time, nullable=True)
    target_utilization_rate = Column(Float, default=0.8)

class TimetableOption(Base):
    __tablename__ = "timetable_options"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="draft")  # 'draft', 'approved', 'rejected', 'active'
    utilization_rate = Column(Float, nullable=True)
    conflict_count = Column(Integer, default=0)
    quality_score = Column(Float, nullable=True)
    
    entries = relationship("TimetableEntry", back_populates="timetable")
    approval_logs = relationship("ApprovalRecord", back_populates="timetable")
    conflicts = relationship("Conflict", back_populates="timetable")
    adjustments = relationship("Adjustment", back_populates="timetable")
    change_logs = relationship("ChangeLog", back_populates="timetable")

class TimetableEntry(Base):
    __tablename__ = "timetable_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetable_options.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    time_slot_id = Column(Integer, ForeignKey("time_slots.id"), nullable=False)
    is_fixed = Column(Boolean, default=False)
    
    timetable = relationship("TimetableOption", back_populates="entries")
    subject = relationship("Subject", back_populates="timetable_entries")
    faculty = relationship("Faculty", back_populates="timetable_entries")
    batch = relationship("Batch", back_populates="timetable_entries")
    classroom = relationship("Classroom", back_populates="timetable_entries")
    time_slot = relationship("TimeSlot", back_populates="timetable_entries")

class Conflict(Base):
    __tablename__ = "conflicts"
    
    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetable_options.id"), nullable=False)
    type = Column(String, nullable=False)
    severity = Column(String, default="critical")
    description = Column(Text, nullable=False)
    affected_entries = Column(JSON, nullable=True)
    suggested_resolutions = Column(JSON, nullable=True)
    
    timetable = relationship("TimetableOption", back_populates="conflicts")

class Resolution(Base):
    __tablename__ = "resolutions"
    
    id = Column(Integer, primary_key=True, index=True)
    conflict_id = Column(Integer, ForeignKey("conflicts.id"), nullable=False)
    description = Column(Text, nullable=False)
    changes = Column(JSON, nullable=False)
    impact_score = Column(Float, nullable=True)

class Adjustment(Base):
    __tablename__ = "adjustments"
    
    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetable_options.id"), nullable=False)
    type = Column(String, nullable=False)
    affected_entry_id = Column(Integer, nullable=True)
    new_faculty_id = Column(Integer, nullable=True)
    new_classroom_id = Column(Integer, nullable=True)
    new_time_slot_id = Column(Integer, nullable=True)
    reason = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    timetable = relationship("TimetableOption", back_populates="adjustments")

class ApprovalRecord(Base):
    __tablename__ = "approval_records"
    
    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetable_options.id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # 'approved', 'rejected'
    comments = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    timetable = relationship("TimetableOption", back_populates="approval_logs")

class ChangeLog(Base):
    __tablename__ = "change_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetable_options.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    timetable = relationship("TimetableOption", back_populates="change_logs")
