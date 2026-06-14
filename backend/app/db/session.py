from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# El engine maneja el pool de conexiones a PostgreSQL
engine = create_engine(settings.database_url)

# Cada request obtiene su propia sesión (transacción)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependencia de FastAPI: provee una sesión de BD y la cierra al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()