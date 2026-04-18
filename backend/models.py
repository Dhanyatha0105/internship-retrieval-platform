from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    preferences = Column(Text)  # JSON string or detailed fields
    created_at = Column(DateTime, default=datetime.utcnow)

    internships = relationship("Internship", back_populates="posted_by")

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    description = Column(Text)
    skills_required = Column(Text)
    location = Column(String)
    posted_date = Column(DateTime, default=datetime.utcnow)
    source_url = Column(String)
    is_scam = Column(Boolean, default=False)
    scam_score = Column(Float, default=0.0)
    scam_report = Column(Text, default="[]")
    user_id = Column(Integer, ForeignKey("users.id"))
    
    posted_by = relationship("User", back_populates="internships")
    credibility_score = relationship("CredibilityScore", back_populates="internship", uselist=False, lazy="joined")

class CredibilityScore(Base):
    __tablename__ = "credibility_scores"

    id = Column(Integer, primary_key=True, index=True)
    internship_id = Column(Integer, ForeignKey("internships.id"), unique=True)
    score = Column(Float)
    reason = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)

    internship = relationship("Internship", back_populates="credibility_score")
