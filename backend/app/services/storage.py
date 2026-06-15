"""
Capa de almacenamiento local.

Guarda los archivos generados en:
  backend/storage/<user_id>/<tool>/<filename>

Esta estructura hace que sea fácil migrar a S3/R2 en el futuro:
solo habría que reemplazar este archivo sin tocar los endpoints.
"""

import os
from pathlib import Path

# Carpeta raíz de almacenamiento, relativa a donde corre uvicorn (backend/)
STORAGE_ROOT = Path("storage")


def save_file(user_id: int, tool: str, filename: str, content: bytes) -> str:
    """
    Guarda el contenido en disco y devuelve la ruta relativa del archivo.

    Args:
        user_id: ID del usuario propietario.
        tool: herramienta que generó el archivo ("merge", "split", etc.).
        filename: nombre del archivo con extensión.
        content: bytes del archivo a guardar.

    Returns:
        Ruta relativa del archivo guardado (ej. "storage/1/merge/doc_merged.pdf").
    """
    folder = STORAGE_ROOT / str(user_id) / tool
    folder.mkdir(parents=True, exist_ok=True)

    file_path = folder / filename
    file_path.write_bytes(content)

    return str(file_path)


def read_file(file_path: str) -> bytes:
    """Lee y devuelve el contenido de un archivo guardado."""
    return Path(file_path).read_bytes()


def delete_file(file_path: str) -> None:
    """Elimina un archivo del disco si existe."""
    path = Path(file_path)
    if path.exists():
        path.unlink()