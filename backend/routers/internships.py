from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from .. import crud, models, schemas, database, scam_detection, ranking

router = APIRouter(
    prefix="/internships",
    tags=["internships"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Internship])
def read_internships(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    internships = crud.get_internships(db, skip=skip, limit=limit)
    ranked_internships = ranking.rank_internships(internships)
    return ranked_internships


@router.get("/search", response_model=List[schemas.Internship])
def search_internships(
    q: Optional[str] = Query(None, description="Search query"),
    location: Optional[str] = Query(None, description="Filter by location"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
):
    """Search internships by keyword across title, company, description, skills, and location."""
    query = db.query(models.Internship).options(joinedload(models.Internship.credibility_score))

    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                models.Internship.title.ilike(search_term),
                models.Internship.company.ilike(search_term),
                models.Internship.description.ilike(search_term),
                models.Internship.skills_required.ilike(search_term),
            )
        )

    if location:
        query = query.filter(models.Internship.location.ilike(f"%{location}%"))

    internships = query.offset(skip).limit(limit).all()
    ranked = ranking.rank_internships(internships)
    return ranked


@router.post("/", response_model=schemas.Internship)
def create_internship(internship: schemas.InternshipCreate, db: Session = Depends(database.get_db)):
    # Default user for now (in real app, get from JWT)
    user_id = 1

    # Detect scam
    is_scam, scam_score, scam_report = scam_detection.detect_scam(internship)

    # Save to DB
    db_internship = models.Internship(
        **internship.dict(),
        user_id=user_id,
        is_scam=is_scam,
        scam_score=scam_score,
        scam_report=scam_report,
    )
    db.add(db_internship)
    db.commit()
    db.refresh(db_internship)

    # Automatically generate credibility score if not a scam
    if not is_scam:
        # Calculate a 0-10 credibility score based on the scam score
        # Lower scam score = higher credibility
        cred_score = max(0.0, 10.0 - (scam_score / 10.0))
        
        # Get risk label for the reason
        import json
        try:
            report_data = json.loads(scam_report)
            reason = report_data.get("risk_label", "Verified by InternSafe AI")
        except:
            reason = "Verified by InternSafe AI"

        db_cred = models.CredibilityScore(
            internship_id=db_internship.id,
            score=round(cred_score, 1),
            reason=reason
        )
        db_internship.credibility_score = db_cred
        db.add(db_cred)
        db.commit()
        db.refresh(db_internship)

    return db_internship


@router.put("/{internship_id}", response_model=schemas.Internship)
def update_internship(
    internship_id: int,
    updated: schemas.InternshipCreate,
    db: Session = Depends(database.get_db),
):
    """Update an existing internship listing. Re-runs scam detection on the new content."""
    db_internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if not db_internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    # Re-run scam detection on updated content
    is_scam, scam_score, scam_report = scam_detection.detect_scam(updated)

    db_internship.title = updated.title
    db_internship.company = updated.company
    db_internship.description = updated.description
    db_internship.skills_required = updated.skills_required
    db_internship.location = updated.location
    db_internship.source_url = updated.source_url
    db_internship.is_scam = is_scam
    db_internship.scam_score = scam_score
    db_internship.scam_report = scam_report

    # Update or create credibility score
    if not is_scam:
        cred_score = max(0.0, 10.0 - (scam_score / 10.0))
        import json
        try:
            report_data = json.loads(scam_report)
            reason = report_data.get("risk_label", "Verified by InternSafe AI")
        except:
            reason = "Verified by InternSafe AI"

        if db_internship.credibility_score:
            db_internship.credibility_score.score = round(cred_score, 1)
            db_internship.credibility_score.reason = reason
        else:
            db_cred = models.CredibilityScore(
                internship_id=db_internship.id,
                score=round(cred_score, 1),
                reason=reason
            )
            db_internship.credibility_score = db_cred
            db.add(db_cred)
    else:
        # If it's now a scam, we might want to remove the credibility score 
        # or just leave it (it won't show in the "Verified" badge anyway)
        if db_internship.credibility_score:
            db.delete(db_internship.credibility_score)

    db.commit()
    db.refresh(db_internship)
    return db_internship


@router.delete("/{internship_id}")
def delete_internship(internship_id: int, db: Session = Depends(database.get_db)):
    """Delete an internship listing."""
    db_internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if not db_internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    # Delete credibility score first (foreign key)
    db.query(models.CredibilityScore).filter(
        models.CredibilityScore.internship_id == internship_id
    ).delete()

    db.delete(db_internship)
    db.commit()
    return {"message": "Internship deleted successfully", "id": internship_id}


@router.get("/{internship_id}", response_model=schemas.Internship)
def get_internship(internship_id: int, db: Session = Depends(database.get_db)):
    internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship


@router.post("/{internship_id}/analyze")
def analyze_internship(internship_id: int, db: Session = Depends(database.get_db)):
    """Re-run scam detection on an existing internship and return the detailed report."""
    db_internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if not db_internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    # Build an InternshipCreate from the existing data
    internship_data = schemas.InternshipCreate(
        title=db_internship.title,
        company=db_internship.company,
        description=db_internship.description,
        skills_required=db_internship.skills_required,
        location=db_internship.location,
        source_url=db_internship.source_url or "",
    )

    is_scam, scam_score, scam_report = scam_detection.detect_scam(internship_data)

    # Update the record
    db_internship.is_scam = is_scam
    db_internship.scam_score = scam_score
    db_internship.scam_report = scam_report
    db.commit()
    db.refresh(db_internship)

    import json
    return json.loads(scam_report)


@router.post("/{internship_id}/credibility", response_model=schemas.CredibilityScore)
def add_credibility_score(
    internship_id: int,
    score: schemas.CredibilityScoreBase,
    db: Session = Depends(database.get_db),
):
    db_internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if not db_internship:
        raise HTTPException(status_code=404, detail="Internship not found")

    db_score = models.CredibilityScore(
        **score.dict(),
        internship_id=internship_id,
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score
