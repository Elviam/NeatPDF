from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    """Datos de un documento que se devuelven al frontend."""
    id: int
    filename: str
    tool: str
    mime_type: str
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True