from . import models
from typing import List
from datetime import datetime

def rank_internships(internships: List[models.Internship]) -> List[models.Internship]:
    """
    Ranks internships best-to-worst:
    1. Non-scam before scam (scams always at bottom)
    2. Higher credibility score is better
    3. Lower scam score is better
    4. Newer postings first
    """
    def calculate_rank_score(internship):
        score = 0.0

        # Scams go to the bottom
        if internship.is_scam:
            score -= 10000

        # Credibility score is the primary ranking factor (0-10 scale, weighted heavily)
        if internship.credibility_score:
            score += internship.credibility_score.score * 100
        else:
            # No credibility score = unverified, rank below verified ones
            score -= 50

        # Lower scam score is better
        score -= internship.scam_score * 5

        # Newer posts get a small boost (days since epoch as tiebreaker)
        if internship.posted_date:
            try:
                days = (internship.posted_date - datetime(2026, 1, 1)).days
                score += days * 0.1
            except Exception:
                pass

        return score

    return sorted(internships, key=calculate_rank_score, reverse=True)
