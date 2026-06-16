from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: int
    filename: str
    tool: str
    mime_type: str
    file_size: int
    is_favorite: bool
    has_thumbnail: bool = False   # el frontend usa esto para saber si pedir el thumbnail
    created_at: datetime

    class Config:
        from_attributes = True