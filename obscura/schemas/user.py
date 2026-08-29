from pydantic import BaseModel, EmailStr, Field

class UserCreateSchema(BaseModel):
    email: EmailStr
    auth_password: str = Field(..., min_length=12, max_length=128)

class UserResponseSchema(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True