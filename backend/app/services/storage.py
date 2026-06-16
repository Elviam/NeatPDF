"""
Capa de almacenamiento local.

Guarda los archivos generados en:
  backend/storage/<user_id>/<tool>/<filename>
"""

import io
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
from PIL import Image

STORAGE_ROOT = Path("storage")


def save_file(user_id: int, tool: str, filename: str, content: bytes) -> str:
    """Guarda el contenido en disco y devuelve la ruta relativa."""
    folder = STORAGE_ROOT / str(user_id) / tool
    folder.mkdir(parents=True, exist_ok=True)
    file_path = folder / filename
    file_path.write_bytes(content)
    return str(file_path)


def generate_thumbnail(
    user_id: int,
    tool: str,
    base_filename: str,
    pdf_bytes: bytes,
    width: int = 300,
) -> Optional[str]:
    """
    Renderiza la primera página del PDF como JPEG y la guarda en disco.
    Devuelve la ruta del thumbnail, o None si falla.

    Args:
        user_id: ID del usuario.
        tool: herramienta que generó el PDF.
        base_filename: nombre base sin extensión (ej. "Contrato_merged").
        pdf_bytes: bytes del PDF del que extraer la portada.
        width: ancho del thumbnail en px (alto proporcional).
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        if doc.page_count == 0:
            doc.close()
            return None

        page = doc[0]
        zoom = width / page.rect.width
        matrix = fitz.Matrix(zoom, zoom)
        pixmap = page.get_pixmap(matrix=matrix)
        doc.close()

        # Convertir a JPEG via Pillow para mejor compresión
        img = Image.open(io.BytesIO(pixmap.tobytes("png")))
        if img.mode != "RGB":
            img = img.convert("RGB")

        folder = STORAGE_ROOT / str(user_id) / tool / "thumbnails"
        folder.mkdir(parents=True, exist_ok=True)

        thumb_path = folder / f"{base_filename}_thumb.jpg"
        img.save(str(thumb_path), format="JPEG", quality=75, optimize=True)

        return str(thumb_path)

    except Exception:
        return None


def read_file(file_path: str) -> bytes:
    """Lee y devuelve el contenido de un archivo guardado."""
    return Path(file_path).read_bytes()


def delete_file(file_path: str) -> None:
    """Elimina un archivo del disco si existe."""
    path = Path(file_path)
    if path.exists():
        path.unlink()