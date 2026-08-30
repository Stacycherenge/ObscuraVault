# app/vault/routers.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import Base
from routers.user import auth_router_instance   
from schemas.vault import VaultItemCreateSchema, VaultItemResponseSchema
from models.vault import VaultItemModel
from database import get_db



class VaultRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_items(self, user_id: int) -> List[VaultItemModel]:
        return self.db.query(VaultItemModel).filter(VaultItemModel.user_id == user_id).all()

    def create_item(self, user_id: int, schema: VaultItemCreateSchema) -> VaultItemModel:
        db_item = VaultItemModel(
            user_id=user_id,
            account_title=schema.account_title,
            encrypted_username=schema.encrypted_username,
            encrypted_password=schema.encrypted_password,
            iv=schema.iv
        )
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

class VaultRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/api/vault", tags=["Password Vault"])
        self._setup_routes()

    def _setup_routes(self):
        
        @self.router.get("/", response_model=List[VaultItemResponseSchema])
        def get_vault_items(
            current_user_id: int = Depends(auth_router_instance.get_dependencies), 
            db: Session = Depends(get_db)
        ):
            repo = VaultRepository(db)
            return repo.get_user_items(current_user_id)

        @self.router.post("/", response_model=VaultItemResponseSchema, status_code=201)
        def add_vault_item(
            item_data: VaultItemCreateSchema,
            current_user_id: int = Depends(auth_router_instance.get_dependencies),
            db: Session = Depends(get_db)
        ):
            repo = VaultRepository(db)
            return repo.create_item(current_user_id, item_data)

vault_router_instance = VaultRouter()
