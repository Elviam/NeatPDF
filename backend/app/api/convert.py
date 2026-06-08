from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import Response
from app.services.pdf_convert import convert_pdf_to_images

router = APIRouter()


@router.post("/")
async def convert_pdf_endpoint(
    file: UploadFile = File(...),
    format: str = Query("png", regex="^(png|jpg)$"),
    dpi: int = Query(150, ge=72, le=300)
):
    """Convierte un PDF a imágenes PNG o JPG."""
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser un PDF"
        )
    
    try:
        file_bytes = await file.read()
        zip_content = convert_pdf_to_images(file_bytes, format, dpi)
        
        return Response(
            content=zip_content,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=NeatPDF_images_{format}.zip"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )