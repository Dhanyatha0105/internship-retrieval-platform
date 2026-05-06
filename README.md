# Internship Retrieval Platform

A full-stack platform for finding internships with scam detection and smart ranking.

## Quick Start

### Option 1: Easy Start (Recommended)
1. Double-click `START_APP.bat` in the project root
2. Wait for both server windows to open
3. Your browser will automatically open to http://localhost:5173

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

## What You Should See

- **Homepage**: Landing page with features
- **Dashboard** (http://localhost:5173/dashboard): List of internships with scam warnings
- **Backend API** (http://localhost:8000/docs): Swagger documentation

## Troubleshooting

### "Port already in use"
Run this to kill processes:
```powershell
# Kill port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill port 5173  
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Blank Screen
1. Open browser console (F12)
2. Check for errors
3. Verify backend is running: http://localhost:8000/health

### Backend Won't Start
- Make sure you're in the project root directory
- Check that Python and all dependencies are installed: `pip install -r backend/requirements.txt`

## Project Structure

```
PE2/
├── backend/          # FastAPI backend
│   ├── main.py      # API endpoints
│   ├── models.py    # Database models
│   ├── schemas.py   # Pydantic schemas
│   └── database.py  # DB connection
├── frontend/         # React frontend
│   └── src/
│       ├── pages/   # HomePage, Dashboard
│       └── components/  # Reusable components
└── START_APP.bat    # Easy startup script
```

## Features

- ✅ Scam detection with keyword analysis
- ✅ Credibility scoring
- ✅ Smart ranking algorithm
- ✅ Modern React UI with Tailwind CSS
- ✅ RESTful API with FastAPI
- ✅ SQLite database (easy setup)
