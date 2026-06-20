from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate, UserOut
from pydantic import BaseModel

router = APIRouter()


class GoogleTokenRequest(BaseModel):
    credential: str  # el JWT que devuelve Google


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ese correo ya está registrado")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=token)


@router.post("/google", response_model=Token)
def google_login(payload: GoogleTokenRequest, db: Session = Depends(get_db)):
    """
    Recibe el credential JWT que Google devuelve al usuario tras
    autenticarse, lo verifica con la clave pública de Google y
    crea o loguea al usuario en la base de datos.
    """
    try:
        id_info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Token de Google inválido: {e}")

    google_id  = id_info["sub"]
    email      = id_info.get("email")
    full_name  = id_info.get("name")
    avatar_url = id_info.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="No se pudo obtener el correo de Google")

    # Buscar usuario existente por google_id o email
    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        user = db.query(User).filter(User.email == email).first()

    if user:
        # Actualizar datos de Google si cambiaron
        user.google_id  = google_id
        user.avatar_url = avatar_url
        if not user.full_name:
            user.full_name = full_name
    else:
        # Crear usuario nuevo (sin contraseña)
        user = User(
            email=email,
            full_name=full_name,
            google_id=google_id,
            avatar_url=avatar_url,
            hashed_password=None,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user