from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.services.pdf_split import split_pdf, split_pdf_all_pages
from app.services.storage import save_file, generate_thumbnail

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
            output_name = f"{base}_split_p{start_page}-{end_page}.pdf"
            file_path = save_file(current_user.id, "split", output_name, split_content)
            thumb_path = generate_thumbnail(current_user.id, "split", output_name.replace(".pdf", ""), split_content)

            doc = Document(
                user_id=current_user.id,
                filename=output_name,
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
            headers={"Content-Disposition": f"attachment; filename=NeatPDF_pages_{start_page}_{end_page}.pdf"},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))