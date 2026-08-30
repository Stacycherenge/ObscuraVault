# obscura/user/routers.py
from datetime import datetime, timedelta, timezone
from typing import Any, Union
import logging
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic_settings import BaseSettings, SettingsConfigDict
from database import get_db, Base, engine
from schemas.user import UserCreateSchema, UserResponseSchema
from repositories.user import UserRepository

logger = logging.getLogger("security")


class SecuritySettings(BaseSettings):
    private_key: str
    public_key: str
    algorithm: str = "RS256"
    access_token_expire_minutes: int = 60 * 2

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

security_settings = SecuritySettings()
ALGORITHM = security_settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = security_settings.access_token_expire_minutes

RSA_PRIVATE_KEY = security_settings.private_key.replace("\\n", "\n")
RSA_PUBLIC_KEY = security_settings.public_key.replace("\\n", "\n")



pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class UserRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/api/auth", tags=["Authentication"])
        self._setup_routes()

    def _setup_routes(self):
        
        @self.router.post("/signup", response_model=UserResponseSchema, status_code=201)
        def signup(user_data: UserCreateSchema, db: Session = Depends(get_db)):
            repo = UserRepository(db)
            
            if repo.get_by_email(user_data.email):
                logger.warning(f"Registration rejected: Identity for {user_data.email} already exists.")
                raise HTTPException(status_code=400, detail="Email already registered")
            
            hashed_pw = get_password_hash(user_data.auth_password)
            return repo.create(user_data, hashed_pw)

        @self.router.post("/login")
        def login(user_data: UserCreateSchema, response: Response, db: Session = Depends(get_db)):
            repo = UserRepository(db)
            user = repo.get_by_email(user_data.email)
            
            if not user or not verify_password(user_data.auth_password, user.server_password_hash):
                logger.warning(f"Unauthorized access warning: Failed login attempt for address profile: {user_data.email}")
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            token = create_access_token(subject=user.id)
            
            response.set_cookie(
                key="access_token",
                value=token,
                httponly=True,
                samesite="strict",
                secure=True,  
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
            
            logger.info(f"Identity account {user.email} logged in successfully.")
            return {"message": "Login successful", "email": user.email}

        @self.router.post("/logout")
        def logout(response: Response):
            response.delete_cookie(key="access_token", httponly=True, samesite="strict", secure=True)
            logger.info("Session closed and cookie deleted successfully.")
            return {"message": "Logged out safely"}

    def get_dependencies(self, request: Request):
        token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated. Access Denied.")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid session payload structure.")
            return int(user_id)
        except JWTError:
            logger.error("Session integrity check failed: Modifying attempts or expired JWT token.")
            raise HTTPException(status_code=401, detail="Session expired or token modified.")

auth_router_instance = UserRouter()

