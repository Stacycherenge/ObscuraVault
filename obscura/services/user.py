
from obscura.user.repositories import UserRepository
from obscura.user.schemas import UserCreateSchema
from obscura.user.models import UserModel
from obscura.user.routers import get_password_hash, verify_password  # Importing your hashing engines

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def register_new_identity(self, user_data: UserCreateSchema) -> UserModel:
        existing_user = self.repository.get_by_email(user_data.email)
        if existing_user:
            raise ValueError("Email already registered")
        
        hashed_password = get_password_hash(user_data.auth_password)
        return self.repository.create_user(user_data, hashed_password)

    def authenticate_identity(self, user_data: UserCreateSchema) -> UserModel:
        user = self.repository.get_by_email(user_data.email)
        if not user:
            raise ValueError("Invalid email or password")
            
        if not verify_password(user_data.auth_password, user.server_password_hash):
            raise ValueError("Invalid email or password")
            
        return user
