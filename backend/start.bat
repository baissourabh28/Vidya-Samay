@echo off
REM College Timetable Scheduler - Backend Startup Script (Windows)

echo =========================================
echo College Timetable Scheduler - Backend
echo =========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Initialize database
echo Initializing database...
python init_db.py

echo.
echo =========================================
echo Starting FastAPI server...
echo =========================================
echo.
echo API Documentation: http://localhost:8000/docs
echo Health Check: http://localhost:8000/api/health
echo.
echo Default Login:
echo   Username: admin
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
