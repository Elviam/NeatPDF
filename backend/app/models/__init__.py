"""
Importar aquí todos los modelos para que SQLAlchemy los registre
en Base.metadata y create_all() pueda crear sus tablas.
"""

from app.models.user import User  # noqa: F401
from app.models.document import Document  # noqa: F401