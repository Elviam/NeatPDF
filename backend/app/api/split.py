from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import Response
from app.services.pdf_split import split_pdf, split_pdf_all_pages

router = APIRouter()


@router.post("/all")
async def split_all_pages(file: UploadFile = File(...)):
    """Separa todas las páginas de un PDF en archivos individuales."""
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser un PDF"
        )
    
    try:
        file_bytes = await file.read()
        zip_content = split_pdf_all_pages(file_bytes)
        
        return Response(
            content=zip_content,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=NeatPDF_split.zip"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/range")
async def split_page_range(
    file: UploadFile = File(...),
    start_page: int = Query(..., ge=1),
    end_page: int = Query(..., ge=1)
):
    """Extrae un rango de páginas de un PDF."""
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="El archivo debe ser un PDF"
        )
    
    try:
        file_bytes = await file.read()
        split_content = split_pdf(file_bytes, start_page, end_page)
        
        return Response(
            content=split_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=NeatPDF_pages_{start_page}_{end_page}.pdf"}
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )