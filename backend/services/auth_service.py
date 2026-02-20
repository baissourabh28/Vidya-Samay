from sqlalchemy.orm import Session
from models import User
from auth import hash_password, verify_password, create_access_token
from typing import Optional
from datetime import datetime

class AuthService:
    """Service for handling authentication operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """
        Authenticate a user with username and password.
        
        Args:
            username: User's username
            password: Plain text password
        
        Returns:
            User object if authentication successful, None otherwise
        """
        user = self.db.query(User).filter(User.username == username).first()
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        return user
    
    def create_user(self, username: str, password: str, role: str = "admin") -> User:
        """
        Create a new user.
        
        Args:
            username: User's username
            password: Plain text password
            role: User role (default: admin)
        
        Returns:
            Created User object
        """
        hashed_password = hash_password(password)
        user = User(
            username=username,
            password_hash=hashed_password,
            role=role
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        return self.db.query(User).filter(User.username == username).first()
    
    def generate_token(self, user: User) -> str:
        """
        Generate JWT token for a user.
        
        Args:
            user: User object
        
        Returns:
            JWT token string
        """
        token_data = {
            "sub": user.username,
            "user_id": user.id,
            "role": user.role
        }
        return create_access_token(token_data)
