from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CredibilityScoreBase(BaseModel):
    score: float
    reason: str


class CredibilityScoreCreate(CredibilityScoreBase):
    internship_id: int


class CredibilityScore(CredibilityScoreBase):
    id: int
    internship_id: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class InternshipBase(BaseModel):
    title: str
    company: str
    description: str
    skills_required: str
    location: str
    source_url: str


class InternshipCreate(InternshipBase):
    pass


class Internship(InternshipBase):
    id: int
    posted_date: datetime
    is_scam: bool
    scam_score: float
    scam_report: Optional[str] = "{}"
    user_id: int
    credibility_score: Optional[CredibilityScoreBase] = None

    model_config = {"from_attributes": True}


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    preferences: Optional[str] = None
    internships: List[Internship] = []

    model_config = {"from_attributes": True}
