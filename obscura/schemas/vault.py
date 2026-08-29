from pydantic import BaseModel, Field

class VaultItemCreateSchema(BaseModel):
    account_title: str = Field(..., min_length=1, max_length=100)
    encrypted_username: str = Field(..., description="Hex/Base64 ciphertext")
    encrypted_password: str = Field(..., description="Hex/Base64 ciphertext")
    iv: str = Field(..., description="Initialization Vector from browser")

class VaultItemResponseSchema(BaseModel):
    id: int
    account_title: str
    encrypted_username: str
    encrypted_password: str
    iv: str

    class Config:
        from_attributes = True