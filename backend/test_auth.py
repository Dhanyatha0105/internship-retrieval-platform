import sys
import os

# Add parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from backend import auth

try:
    print("Testing password hashing...")
    pwd = "password123"
    hashed = auth.get_password_hash(pwd)
    print(f"Hashed: {hashed}")
    
    print("Testing verification...")
    verified = auth.verify_password(pwd, hashed)
    print(f"Verified: {verified}")
    
except Exception as e:
    print(f"Error: {e}")
