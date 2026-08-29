from sqlalchemy import Column, Integer, String, ForeignKey
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from obscura.database import Base

class VaultItemModel(Base):
    __tablename__ = "vault_items"

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("gen_random_uuid()"), 
        index=True
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_title = Column(String, nullable=False)
    encrypted_username = Column(String, nullable=False)
    encrypted_password = Column(String, nullable=False)
    iv = Column(String, nullable=False)

    owner = relationship("UserModel", back_populates="items")