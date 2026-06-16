from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.services.pdf_compress import compress_pdf
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


@router.post("")
async def compress_pdf_endpoint(
    file: UploadFile = File(...),
    quality: str = Query("medium", pattern="^(low|medium|high)$"),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")

    try:
        file_bytes = await file.read()
        compressed_content = compress_pdf(file_bytes, quality)

        if current_user:
            base = (file.filename or "document").replace(".pdf", "")
            output_name = f"{base}_compressed.pdf"
            file_path = save_file(current_user.id, "compress", output_name, compressed_content)
            thumb_path = generate_thumbnail(current_user.id, "compress", output_name.replace(".pdf", ""), compressed_content)

            doc = Document(
                user_id=current_user.id,
                filename=output_name,
                file_path=file_path,
                tool="compress",
                mime_type="application/pdf",
                file_size=len(compressed_content),
                thumbnail_path=thumb_path,
            )
            db.add(doc)
            db.commit()

        return Response(
            content=compressed_content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=NeatPDF_compressed.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))