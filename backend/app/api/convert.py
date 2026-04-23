from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def convert_pdfs():
    return {"message": "convert endpoint listo"}