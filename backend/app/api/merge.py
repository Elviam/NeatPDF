from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from app.services.pdf_merge import merge_pdfs

router = APIRouter()

@router.post("/")
async def merge_pdfs_endpoint(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="Se necesitan al menos 2 archivos PDF"
        )

    for file in files:
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail=f"El archivo '{file.filename}' no es un PDF"
            )

    files_bytes = [await file.read() for file in files]
    merged_pdf = merge_pdfs(files_bytes)

    return Response(
        content=merged_pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=NeatPDF_merged.pdf"}
    )