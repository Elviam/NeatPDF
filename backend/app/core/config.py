from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "NeatPDF"
    max_file_size_mb: int = 50
    google_client_id: str
    google_client_secret: str
    
    allowed_origins: list[str] = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://neat-pdf-eta.vercel.app",
]

    # Base de datos
    database_url: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"

settings = Settings()