from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from typing import List

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.services.pdf_split import split_pdf, split_pdf_all_pages
from app.services.storage import save_file, generate_thumbnail
from app.services.pdf_split import split_pdf, split_pdf_all_pages, split_pdf_selected_pages
router = APIRouter()

oauth2_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_optional_user(
    token: str = Depends(oauth2_optional),
    db: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == int(user_id)).first()
    except JWTError:
        return None


@router.post("/all")
async def split_all_pages(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")

    try:
        file_bytes = await file.read()
        zip_content = split_pdf_all_pages(file_bytes)

        if current_user:
            base = (file.filename or "document").replace(".pdf", "")
            output_name = f"{base}_split.zip"
            file_path = save_file(current_user.id, "split", output_name, zip_content)

            # ZIP no tiene thumbnail
            doc = Document(
                user_id=current_user.id,
                filename=output_name,
                file_path=file_path,
                tool="split",
                mime_type="application/zip",
                file_size=len(zip_content),
                thumbnail_path=None,
            )
            db.add(doc)
            db.commit()

        return Response(
            content=zip_content,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=NeatPDF_split.zip"},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/range")
async def split_page_range(
    file: UploadFile = File(...),
    start_page: int = Query(..., ge=1),
    end_page: int = Query(..., ge=1),
    output_name: str = Query(default=None), 
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")

    try:
        file_bytes = await file.read()
        split_content = split_pdf(file_bytes, start_page, end_page)

        if current_user:
            base = (file.filename or "document").replace(".pdf", "")
            final_name = output_name if output_name else f"{base}_split_p{start_page}-{end_page}.pdf"
            file_path = save_file(current_user.id, "split", final_name, split_content)
            thumb_path = generate_thumbnail(current_user.id, "split", final_name.replace(".pdf", ""), split_content)
            doc = Document(
                user_id=current_user.id,
                filename=final_name,
                file_path=file_path,
                tool="split",
                mime_type="application/pdf",
                file_size=len(split_content),
                thumbnail_path=thumb_path,
            )
            db.add(doc)
            db.commit()

        return Response(
            content=split_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={final_name}"},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/pages")
async def split_selected_pages(
    file: UploadFile = File(...),
    pages: str = Query(..., description="Páginas separadas por coma, ej: 1,3,5"),
    output_name: str = Query(default=None),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")

    try:
        page_list = sorted(set(int(p.strip()) for p in pages.split(",")))
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de páginas inválido")

    try:
        file_bytes = await file.read()
        result_bytes = split_pdf_selected_pages(file_bytes, page_list)

        if current_user:
            base = (file.filename or "document").replace(".pdf", "")
            final_name = output_name if output_name else f"{base}_split_combined.pdf"
            file_path = save_file(current_user.id, "split", final_name, result_bytes)
            thumb_path = generate_thumbnail(
                current_user.id, "split",
                final_name.replace(".pdf", ""),
                result_bytes,
            )
            doc = Document(
                user_id=current_user.id,
                filename=final_name,
                file_path=file_path,
                tool="split",
                mime_type="application/pdf",
                file_size=len(result_bytes),
                thumbnail_path=thumb_path,
            )
            db.add(doc)
            db.commit()

        page_str = "-".join(str(p) for p in page_list)
        return Response(
            content=result_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={final_name if current_user else f'NeatPDF_pages_{page_str}.pdf'}"},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))