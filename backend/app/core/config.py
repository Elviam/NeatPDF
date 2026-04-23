from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "NeatPDF"
    max_file_size_mb: int = 50
    allowed_origins: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()