from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentOut
from app.services.storage import delete_file, read_file

router = APIRouter()


def _to_out(doc: Document) -> dict:
    return {
        "id": doc.id,
        "filename": doc.filename,
        "tool": doc.tool,
        "mime_type": doc.mime_type,
        "file_size": doc.file_size,
        "is_favorite": doc.is_favorite,
        "has_thumbnail": doc.thumbnail_path is not None,
        "created_at": doc.created_at,
    }


@router.get("", response_model=list[DocumentOut])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista todos los documentos del usuario, favoritos primero."""
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.is_favorite.desc(), Document.created_at.desc())
        .all()
    )
    return [_to_out(d) for d in docs]


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Descarga un documento guardado."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type,
        filename=doc.filename,
    )


@router.get("/{document_id}/thumbnail")
def get_thumbnail(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el thumbnail JPEG de la primera página del PDF."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc or not doc.thumbnail_path:
        raise HTTPException(status_code=404, detail="Thumbnail no disponible")

    return Response(
        content=read_file(doc.thumbnail_path),
        media_type="image/jpeg",
        headers={"Cache-Control": "max-age=86400"},
    )


@router.patch("/{document_id}/favorite", response_model=DocumentOut)
def toggle_favorite(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Alterna el estado de favorito de un documento."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    doc.is_favorite = not doc.is_favorite
    db.commit()
    db.refresh(doc)
    return _to_out(doc)


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Elimina un documento del historial y del disco."""
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    delete_file(doc.file_path)
    if doc.thumbnail_path:
        delete_file(doc.thumbnail_path)

    db.delete(doc)
    db.commit()