from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.services.pdf_merge import merge_pdfs
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


@router.post("/")
async def merge_pdfs_endpoint(
    files: list[UploadFile] = File(...),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Se necesitan al menos 2 archivos PDF")

    for file in files:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail=f"El archivo '{file.filename}' no es un PDF")

    files_bytes = [await file.read() for file in files]
    merged_pdf = merge_pdfs(files_bytes)

    if current_user:
        base = (files[0].filename or "document").replace(".pdf", "")
        output_name = f"{base}_merged.pdf"
        file_path = save_file(current_user.id, "merge", output_name, merged_pdf)
        thumb_path = generate_thumbnail(current_user.id, "merge", output_name.replace(".pdf", ""), merged_pdf)

        doc = Document(
            user_id=current_user.id,
            filename=output_name,
            file_path=file_path,
            tool="merge",
            mime_type="application/pdf",
            file_size=len(merged_pdf),
            thumbnail_path=thumb_path,
        )
        db.add(doc)
        db.commit()

    return Response(
        content=merged_pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=NeatPDF_merged.pdf"},
    )