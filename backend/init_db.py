"""Initialize database with sample data for testing."""
from database import SessionLocal, engine, Base
from services.auth_service import AuthService
from models import *
from datetime import time

def init_database():
    """Create tables and populate with sample data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create admin user
        auth_service = AuthService(db)
        if not auth_service.get_user_by_username("admin"):
            auth_service.create_user("admin", "admin123", "admin")
            print("[OK] Created admin user")
        
        # Create time slots (5 days, 8 slots per day)
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        times = [
            (time(9, 0), time(10, 0)),
            (time(10, 0), time(11, 0)),
            (time(11, 0), time(12, 0)),
            (time(12, 0), time(13, 0)),
            (time(14, 0), time(15, 0)),
            (time(15, 0), time(16, 0)),
            (time(16, 0), time(17, 0)),
            (time(17, 0), time(18, 0)),
        ]
        
        if db.query(TimeSlot).count() == 0:
            slot_num = 0
            for day in days:
                for start, end in times:
                    slot = TimeSlot(
                        day=day,
                        start_time=start,
                        end_time=end,
                        slot_number=slot_num
                    )
                    db.add(slot)
                    slot_num += 1
            db.commit()
            print(f"[OK] Created {slot_num} time slots")
        
        # Create sample classrooms
        if db.query(Classroom).count() == 0:
            classrooms = [
                Classroom(name="Room 101", capacity=60, type="classroom", building="A", floor=1),
                Classroom(name="Room 102", capacity=60, type="classroom", building="A", floor=1),
                Classroom(name="Room 201", capacity=80, type="classroom", building="A", floor=2),
                Classroom(name="Lab 301", capacity=40, type="lab", building="B", floor=3),
                Classroom(name="Lab 302", capacity=40, type="lab", building="B", floor=3),
            ]
            for classroom in classrooms:
                db.add(classroom)
            db.commit()
            print(f"[OK] Created {len(classrooms)} classrooms")
        
        # Create sample batches
        if db.query(Batch).count() == 0:
            batches = [
                Batch(name="CS-A", program="UG", department="Computer Science", year=2, semester=3, student_count=60, shift="morning"),
                Batch(name="CS-B", program="UG", department="Computer Science", year=2, semester=3, student_count=60, shift="morning"),
                Batch(name="ME-A", program="UG", department="Mechanical", year=3, semester=5, student_count=50, shift="morning"),
            ]
            for batch in batches:
                db.add(batch)
            db.commit()
            print(f"[OK] Created {len(batches)} batches")
        
        # Create sample subjects
        if db.query(Subject).count() == 0:
            subjects = [
                Subject(code="CS201", name="Data Structures", department="Computer Science", type="core", credits=4, hours_per_week=4),
                Subject(code="CS202", name="Algorithms", department="Computer Science", type="core", credits=4, hours_per_week=4),
                Subject(code="CS203", name="Database Systems", department="Computer Science", type="core", credits=3, hours_per_week=3),
                Subject(code="CS204", name="Operating Systems", department="Computer Science", type="core", credits=3, hours_per_week=3),
                Subject(code="ME301", name="Thermodynamics", department="Mechanical", type="core", credits=4, hours_per_week=4),
            ]
            for subject in subjects:
                db.add(subject)
            db.commit()
            print(f"[OK] Created {len(subjects)} subjects")
        
        # Create sample faculty with Indian names
        if db.query(Faculty).count() == 0:
            faculty = [
                Faculty(name="Dr. Rajesh Kumar", employee_id="F001", department="Computer Science", email="rajesh.kumar@college.edu", max_hours_per_week=20),
                Faculty(name="Dr. Priya Sharma", employee_id="F002", department="Computer Science", email="priya.sharma@college.edu", max_hours_per_week=20),
                Faculty(name="Dr. Amit Patel", employee_id="F003", department="Computer Science", email="amit.patel@college.edu", max_hours_per_week=20),
                Faculty(name="Dr. Sunita Reddy", employee_id="F004", department="Mechanical", email="sunita.reddy@college.edu", max_hours_per_week=20),
                Faculty(name="Dr. Vikram Singh", employee_id="F005", department="Computer Science", email="vikram.singh@college.edu", max_hours_per_week=20),
                Faculty(name="Dr. Anjali Desai", employee_id="F006", department="Mechanical", email="anjali.desai@college.edu", max_hours_per_week=20),
                Faculty(name="Prof. Arjun Mehta", employee_id="F007", department="Computer Science", email="arjun.mehta@college.edu", max_hours_per_week=20),
                Faculty(name="Dr. Kavita Nair", employee_id="F008", department="Computer Science", email="kavita.nair@college.edu", max_hours_per_week=20),
                Faculty(name="Prof. Rohan Iyer", employee_id="F009", department="Mechanical", email="rohan.iyer@college.edu", max_hours_per_week=20),
                Faculty(name="Dr. Sneha Joshi", employee_id="F010", department="Computer Science", email="sneha.joshi@college.edu", max_hours_per_week=20),
            ]
            for fac in faculty:
                db.add(fac)
            db.commit()
            print(f"[OK] Created {len(faculty)} faculty members")
        
        # Create default scheduling constraints
        if db.query(SchedulingConstraints).count() == 0:
            constraints = SchedulingConstraints(
                classes_per_day_min=4,
                classes_per_day_max=8,
                classes_per_week=30,
                break_duration_minutes=10,
                lunch_break_start=time(13, 0),
                lunch_break_end=time(14, 0),
                target_utilization_rate=0.8
            )
            db.add(constraints)
            db.commit()
            print("[OK] Created default scheduling constraints")
        
        print("\n[OK] Database initialized successfully!")
        print("   Login with: admin / admin123")
        
    except Exception as e:
        print(f"[ERROR] Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
