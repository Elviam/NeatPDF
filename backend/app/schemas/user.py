from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Datos recibidos al registrar un usuario."""
    email: EmailStr
    password: str
    full_name: str | None = None


class UserOut(BaseModel):
    """Datos del usuario que se devuelven al frontend (sin password)."""
    id: int
    email: EmailStr
    full_name: str | None = None

    class Config:
        from_attributes = True