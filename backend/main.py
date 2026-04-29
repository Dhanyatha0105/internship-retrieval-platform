from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base, get_db
from backend import models, schemas, auth
from backend.routers import internships, users

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")
except Exception as e:
    print(f"✗ Database error: {e}")

app = FastAPI(
    title="InternSafe - Internship Retrieval Platform",
    description="A real-time internship retrieval platform with scam detection and smart ranking",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(internships.router)
app.include_router(users.router)


@app.get("/")
def read_root():
    return {
        "message": "InternSafe API is running!",
        "status": "ok",
        "docs": "/docs",
    }


# --- Auth endpoints ---

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class RegisterResponse(BaseModel):
    id: int
    username: str
    email: str


@app.post("/auth/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not auth.verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = auth.create_access_token(data={"sub": user.email, "user_id": user.id})
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
    )


@app.post("/auth/register", response_model=RegisterResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        (models.User.email == req.email) | (models.User.username == req.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already registered")
    hashed = auth.get_password_hash(req.password)
    user = models.User(username=req.username, email=req.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return RegisterResponse(id=user.id, username=user.username, email=user.email)


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}


if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
