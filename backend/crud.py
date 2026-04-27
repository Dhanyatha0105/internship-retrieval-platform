from sqlalchemy.orm import Session, joinedload
from . import models, schemas
import datetime


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, username=user.username, hashed_password=fake_hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_internships(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Internship).options(joinedload(models.Internship.credibility_score)).offset(skip).limit(limit).all()


def create_internship(db: Session, internship: schemas.InternshipCreate, user_id: int):
    db_internship = models.Internship(
        **internship.dict(),
        user_id=user_id,
        posted_date=datetime.datetime.utcnow(),
        is_scam=False,
        scam_score=0.0,
        scam_report="{}",
    )
    db.add(db_internship)
    db.commit()
    db.refresh(db_internship)
    return db_internship


def update_internship_scam_status(db: Session, internship_id: int, is_scam: bool, scam_score: float, scam_report: str = "{}"):
    internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if internship:
        internship.is_scam = is_scam
        internship.scam_score = scam_score
        internship.scam_report = scam_report
        db.commit()
        db.refresh(internship)
    return internship
