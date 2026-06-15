from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.services.pdf_convert import convert_pdf_to_images
from app.services.storage import save_file

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
async def convert_pdf_endpoint(
    file: UploadFile = File(...),
    format: str = Query("png", pattern="^(png|jpg)$"),
    dpi: int = Query(150, ge=72, le=300),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")

    try:
        file_bytes = await file.read()
        zip_content = convert_pdf_to_images(file_bytes, format, dpi)

        if current_user:
            output_name = (file.filename or "document").replace(".pdf", "") + "_images.zip"
            file_path = save_file(current_user.id, "convert", output_name, zip_content)

            doc = Document(
                user_id=current_user.id,
                filename=output_name,
                file_path=file_path,
                tool="convert",
                mime_type="application/zip",
                file_size=len(zip_content),
            )
            db.add(doc)
            db.commit()

        return Response(
            content=zip_content,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=NeatPDF_images_{format}.zip"},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))