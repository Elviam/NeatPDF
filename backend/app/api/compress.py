from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def compress_pdfs():
    return {"message": "compress endpoint listo"}