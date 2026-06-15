from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
import app.models  # registra todos los modelos en Base.metadata
from app.api import merge, split, compress, convert, auth
from app.api import auth, documents

# Crea las tablas en PostgreSQL al arrancar (si no existen)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="API para procesamiento de archivos PDF",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(merge.router,    prefix="/api/merge",    tags=["Merge"])
app.include_router(split.router,    prefix="/api/split",    tags=["Split"])
app.include_router(compress.router, prefix="/api/compress", tags=["Compress"])
app.include_router(convert.router,  prefix="/api/convert",  tags=["Convert"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])

@app.get("/")
def root():
    return {"message": f"{settings.app_name} API corriendo"}

@app.get("/health")
def health():
    return {"status": "ok"}