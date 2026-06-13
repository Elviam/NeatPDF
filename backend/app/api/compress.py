from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import Response
from app.services.pdf_compress import compress_pdf

router = APIRouter()


@router.post("")
async def compress_pdf_endpoint(
    file: UploadFile = File(...),
    quality: str = Query("medium", pattern="^(low|medium|high)$")
):
    """Comprime un PDF reduciendo su tamaño."""
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser un PDF"
        )
    
    try:
        file_bytes = await file.read()
        compressed_content = compress_pdf(file_bytes, quality)
        
        return Response(
            content=compressed_content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=NeatPDF_compressed.pdf"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )