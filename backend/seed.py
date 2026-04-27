import sys
import os

# Add parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from backend.database import SessionLocal, engine, Base
from backend import models, auth, scam_detection, schemas
from datetime import datetime

def seed_data():
    # Ensure tables exist
    print("Creating tables if not exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Clear existing data for a fresh start
        print("Clearing existing data...")
        db.query(models.CredibilityScore).delete()
        db.query(models.Internship).delete()
        db.query(models.User).delete()
        db.commit()

        print("Seeding data...")

        # Create Users
        hashed_password = auth.get_password_hash("password123")
        user = models.User(
            username="testuser",
            email="test@example.com",
            hashed_password=hashed_password,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created user: {user.email} (password: password123)")

        admin = models.User(
            username="admin",
            email="admin@internsafe.com",
            hashed_password=auth.get_password_hash("admin123"),
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Created admin: {admin.email} (password: admin123)")

        # Raw Internship Data
        internships_data = [
            {
                "title": "Software Engineering Intern",
                "company": "Google",
                "description": "Join Google's engineering team to build next-generation web applications. You'll work on large-scale distributed systems using React, Python, and cloud technologies. Mentorship from senior engineers included.",
                "skills_required": "React, Python, Cloud Computing, Data Structures",
                "location": "Mountain View, CA",
                "source_url": "https://careers.google.com/intern",
            },
            {
                "title": "Data Science Intern",
                "company": "Microsoft",
                "description": "Analyze large datasets to drive business decisions. Work with Python, Pandas, and Azure ML. Collaborate with product teams to build predictive models.",
                "skills_required": "Python, Pandas, SQL, Machine Learning, Azure",
                "location": "Redmond, WA",
                "source_url": "https://careers.microsoft.com/intern",
            },
            {
                "title": "Frontend Developer Intern",
                "company": "Spotify",
                "description": "Help build the future of music streaming UI. Work with React, TypeScript, and design systems. Participate in hackathons and innovation sprints.",
                "skills_required": "React, TypeScript, CSS, UI/UX Design",
                "location": "Stockholm, Sweden",
                "source_url": "https://www.lifeatspotify.com/jobs",
            },
            {
                "title": "Machine Learning Intern",
                "company": "OpenAI",
                "description": "Research and implement state-of-the-art ML models. Work on GPT model fine-tuning and deployment pipelines. Requires strong foundations in deep learning.",
                "skills_required": "Python, PyTorch, Deep Learning, NLP, Mathematics",
                "location": "San Francisco, CA",
                "source_url": "https://openai.com/careers",
            },
            {
                "title": "Backend Engineer Intern",
                "company": "Amazon",
                "description": "Build scalable microservices for AWS infrastructure. Work with Java, Python, and AWS services. Opportunity to own and deploy production code.",
                "skills_required": "Java, Python, AWS, Microservices, Docker",
                "location": "Seattle, WA",
                "source_url": "https://amazon.jobs/intern",
            },
            {
                "title": "Cybersecurity Intern",
                "company": "CrowdStrike",
                "description": "Join our threat intelligence team to analyze security vulnerabilities. Work on endpoint protection and incident response. Knowledge of networking protocols required.",
                "skills_required": "Networking, Linux, Security Analysis, Python",
                "location": "Remote",
                "source_url": "https://crowdstrike.com/careers",
            },
            {
                "title": "Mobile Developer Intern",
                "company": "Meta",
                "description": "Build features for Instagram and Facebook mobile apps. Work with React Native and native iOS/Android development. Ship code used by billions of users.",
                "skills_required": "React Native, iOS, Android, JavaScript, Swift",
                "location": "Menlo Park, CA",
                "source_url": "https://metacareers.com",
            },
            {
                "title": "DevOps Intern",
                "company": "Netflix",
                "description": "Work on CI/CD pipelines, infrastructure automation, and chaos engineering for the world's leading streaming platform. Familiarity with Kubernetes is a plus.",
                "skills_required": "Docker, Kubernetes, CI/CD, Linux, Terraform",
                "location": "Los Gatos, CA",
                "source_url": "https://jobs.netflix.com",
            },
            # --- SCAM LISTINGS ---
            {
                "title": "Easy Money Work From Home - No Experience!",
                "company": "Unknown LLC",
                "description": "Make $5000 a week with no experience! Just need your bank account details for money transfer. Cash payment guaranteed. Send money deposit to start.",
                "skills_required": "None",
                "location": "Remote",
                "source_url": "https://bit.ly/scamjob123",
            },
            {
                "title": "Get Rich Quick - Guaranteed Income Internship",
                "company": "N/A",
                "description": "Investment opportunity disguised as internship. Wire money now to guarantee your position. Urgent - limited time offer! Act now for guaranteed payment.",
                "skills_required": "None",
                "location": "Remote",
                "source_url": "https://tinyurl.com/fake",
            },
        ]

        # Use new detect_scam engine to generate structured reports
        internships = []
        for i, data in enumerate(internships_data):
            schema = schemas.InternshipCreate(**data)
            is_scam, scam_score, scam_report = scam_detection.detect_scam(schema)
            
            # spread days out
            posted_date = datetime(2026, 3, 22 - (i % 15))
            
            internship = models.Internship(
                **data,
                user_id=user.id,
                is_scam=is_scam,
                scam_score=scam_score,
                scam_report=scam_report,
                posted_date=posted_date,
            )
            internships.append(internship)

        db.add_all(internships)
        db.commit()
        
        # Verify ids are populated
        for i in internships:
            db.refresh(i)
            
        print(f"Created {len(internships)} internships (with full scam analysis reports)")

        # Add Credibility Scores for legitimate ones
        legit_internships = [i for i in internships if not i.is_scam]
        cred_data = [
            (legit_internships[0], 9.8, "Verified Fortune 500 company with active careers page."),
            (legit_internships[1], 9.7, "Verified Fortune 500 company with official careers portal."),
            (legit_internships[2], 9.2, "Well-known company with verified Glassdoor presence."),
            (legit_internships[3], 9.9, "Top AI research lab with verified careers page."),
            (legit_internships[4], 9.6, "FAANG company with verified job listings."),
            (legit_internships[5], 8.5, "Established cybersecurity firm with active LinkedIn."),
            (legit_internships[6], 9.5, "FAANG company with verified careers portal."),
            (legit_internships[7], 9.4, "Major streaming company with verified job postings."),
        ]

        for internship, score, reason in cred_data:
            cred = models.CredibilityScore(
                internship_id=internship.id,
                score=score,
                reason=reason,
            )
            db.add(cred)

        db.commit()
        print(f"Added credibility scores for {len(cred_data)} internships")

        print("\n✓ Data seeded successfully!")
        print(f"  - Users: 2 (testuser / password123, admin / admin123)")
        print(f"  - Internships: {len(internships)}")
        print(f"  - Credibility Scores: {len(cred_data)}")

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
