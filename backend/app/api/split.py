from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def split_pdfs():
    return {"message": "split endpoint listo"}