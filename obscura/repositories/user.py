from sqlalchemy.orm import Session
from models.user import UserModel
from schemas.user import UserCreateSchema

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> UserModel | None:
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def create(self, user_schema: UserCreateSchema,hashed_password: str) -> UserModel:
        db_user = UserModel(
            email=user_schema.email,
            server_password_hash=hashed_password
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
