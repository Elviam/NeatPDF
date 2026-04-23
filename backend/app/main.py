from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import merge, split, compress, convert

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

app.include_router(merge.router,    prefix="/api/merge",    tags=["Merge"])
app.include_router(split.router,    prefix="/api/split",    tags=["Split"])
app.include_router(compress.router, prefix="/api/compress", tags=["Compress"])
app.include_router(convert.router,  prefix="/api/convert",  tags=["Convert"])

@app.get("/")
def root():
    return {"message": f"{settings.app_name} API corriendo"}

@app.get("/health")
def health():
    return {"status": "ok"}