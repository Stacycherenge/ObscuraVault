# app/vault/services.py
from typing import List
from obscura.vault.repositories import VaultRepository
from obscura.vault.schemas import VaultItemCreateSchema
from obscura.vault.models import VaultItemModel

class VaultService:
    def __init__(self, repository: VaultRepository):
        self.repository = repository

    def retrieve_user_vault(self, user_id: int) -> List[VaultItemModel]:
        return self.repository.get_all_by_user_id(user_id)

    def save_encrypted_secret(self, user_id: int, item_data: VaultItemCreateSchema) -> VaultItemModel:
        if not item_data.account_title.strip():
            raise ValueError("Account title cannot be empty strings.")
            
        return self.repository.create_vault_entry(user_id, item_data)
