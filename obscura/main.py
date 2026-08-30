from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from models.user import UserModel
from models.vault import VaultItemModel
from routers.user import auth_router_instance
from routers.vault import vault_router_instance

class AppOrchestrator:
    def __init__(self):
        self.app = FastAPI(
            title="Obscura Vault API",
            description="Secure-by-Design Zero-Knowledge Password Manager Backend",
            version="1.0.0"
        )
        
    def configure_cors(self):
        origins = [
            "http://localhost:3000",  
        ]
        
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,       
            allow_credentials=True,     
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
            allow_headers=["Content-Type", "Set-Cookie"],
        )

    def initialize_database(self):
        print("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        print("Database tables synchronized successfully!")

    def register_routers(self):
        self.app.include_router(auth_router_instance.router)
        self.app.include_router(vault_router_instance.router)

    def get_app(self) -> FastAPI:
        self.configure_cors()       
        self.initialize_database()  
        self.register_routers()     
        return self.app

orchestrator = AppOrchestrator()
app = orchestrator.get_app()
