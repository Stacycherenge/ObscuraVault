from sqlalchemy import Column, Integer, String, text, DateTime
from datetime import datetime, timezone, timedelta
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

class UserModel(Base):
    __tablename__ = "users"

    user_id = user_id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()"), 
        index=True
    )
    email = Column(String, unique=True, index=True, nullable=False)
    server_password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    items = relationship("VaultItemModel", back_populates="owner", cascade="all, delete-orphan")
