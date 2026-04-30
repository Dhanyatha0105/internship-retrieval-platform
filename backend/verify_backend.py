import sys
import os

# Add the parent directory to sys.path to resolve imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from backend.database import engine, Base
from sqlalchemy import text

def verify_db():
    try:
        # Try to connect
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful!")
            
        # Try to create tables
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
        
    except Exception as e:
        print(f"Error connecting to database: {e}")
        print("If you don't have PostgreSQL running, please update the DATABASE_URL in backend/.env")
        print("For development, you can use SQLite by changing DATABASE_URL to: sqlite:///./internship_db.sqlite")

if __name__ == "__main__":
    verify_db()
