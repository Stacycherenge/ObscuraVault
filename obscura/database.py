import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError


logger = logging.getLogger("database")

class AppSettings(BaseSettings):
    database_url: str = ""
    db_pool_size: int = 10
    db_max_overflow: int = 5
    db_pool_timeout: int = 15

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = AppSettings()

engine = create_engine(
    settings.database_url, 
    pool_size=settings.db_pool_size, 
    max_overflow=settings.db_max_overflow, 
    pool_timeout=settings.db_pool_timeout, 
    echo=False, 
    future=True
)
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = Session()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database transaction error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()
