from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "NeatPDF"
    max_file_size_mb: int = 50
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    class Config:
        env_file = ".env"

settings = Settings()