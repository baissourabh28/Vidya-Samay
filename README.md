# Vidya Samay - Smart Timetable Scheduler

Intelligent automated timetable scheduling system for colleges using constraint programming optimization.

## Features

- Automated timetable generation using Google OR-Tools
- Constraint satisfaction (no conflicts, room capacity, faculty availability)
- Generate 3 optimal timetable variants
- Complete data management for classrooms, batches, subjects, faculty
- Approval workflow for generated timetables
- Dashboard analytics and insights
- JWT-based authentication

## Tech Stack

**Backend:** FastAPI, SQLAlchemy, OR-Tools, JWT + Bcrypt  
**Frontend:** React 18, Vite, React Router v6, Axios

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+

### 1. Clone Repository
```bash
git clone https://github.com/baissourabh28/Vidya-Samay.git
cd Vidya-Samay
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac
pip install -r requirements.txt
python init_db.py
python -m uvicorn main:app --reload
```
Backend runs at: http://localhost:8000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

### 4. Login
Open http://localhost:5173 and login with:
- Username: `admin`
- Password: `admin123`

## Quick Start Scripts

**Windows:** Run `backend\start.bat`  
**Linux/Mac:** Run `backend/start.sh`

## API Documentation

Swagger UI: http://localhost:8000/docs

## Project Structure

```
├── backend/          # FastAPI backend
│   ├── services/     # Business logic
│   ├── main.py       # API routes
│   ├── models.py     # Database models
│   ├── scheduler.py  # Timetable solver
│   └── init_db.py    # DB initialization
│
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   ├── services/
    │   └── App.jsx
    └── package.json
```

## License

Educational purposes only.
