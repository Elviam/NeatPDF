from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def merge_pdfs():
    return {"message": "split endpoint listo"}