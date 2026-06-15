from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String, nullable=False)       # nombre que ve el usuario
    file_path = Column(String, nullable=False)      # ruta en disco
    tool = Column(String, nullable=False)           # "merge" | "split" | "compress" | "convert"
    mime_type = Column(String, nullable=False)      # "application/pdf" | "application/zip"
    file_size = Column(Integer, nullable=False)     # bytes
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    owner = relationship("User", back_populates="documents")