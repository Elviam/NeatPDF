<div align="center">

<img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" />

# NeatPDF — Backend API

**API REST para procesamiento de PDFs con autenticación JWT y Google OAuth.**

[Ver documentación interactiva](http://localhost:8000/docs) · [Repositorio frontend](../frontend/README.md) · [Reportar un bug](https://github.com/Elviam/NeatPDF/issues)

</div>

---

## ¿Qué hace esta API?

El backend de NeatPDF expone los endpoints que el frontend consume para procesar archivos PDF y gestionar usuarios. Toda la manipulación de archivos (compresión, conversión, thumbnails) ocurre en el servidor usando librerías Python especializadas.

---

## Endpoints principales

### Autenticación — `/api/auth`

| Método | Ruta | Descripción | Auth requerida |
|---|---|---|---|
| `POST` | `/register` | Crea una cuenta nueva con email y contraseña | No |
| `POST` | `/login` | Devuelve un token JWT de acceso | No |
| `POST` | `/google` | Autenticación con Google OAuth 2.0 | No |
| `GET` | `/me` | Devuelve los datos del usuario autenticado | Sí |

### Herramientas PDF — `/api`

| Método | Ruta | Descripción | Auth requerida |
|---|---|---|---|
| `POST` | `/merge` | Une múltiples PDFs en uno solo | Opcional |
| `POST` | `/split` | Extrae un rango de páginas de un PDF | Opcional |
| `POST` | `/compress` | Reduce el tamaño del archivo PDF | Opcional |
| `POST` | `/convert-to-image` | Convierte páginas de PDF a PNG/JPG | Opcional |

### Documentos — `/api/documents`

| Método | Ruta | Descripción | Auth requerida |
|---|---|---|---|
| `GET` | `/` | Lista los documentos del usuario con filtros y búsqueda | Sí |
| `GET` | `/{id}` | Descarga un documento guardado | Sí |
| `GET` | `/{id}/thumbnail` | Devuelve la miniatura de la primera página | Sí |
| `DELETE` | `/{id}` | Elimina un documento del historial | Sí |
| `PATCH` | `/{id}/favorite` | Alterna el estado de favorito | Sí |

---

## Stack tecnológico

### Framework y servidor
- **FastAPI** — Framework async con validación automática via Pydantic y documentación OpenAPI integrada
- **Uvicorn** — Servidor ASGI de alto rendimiento

### Base de datos
- **PostgreSQL** — Base de datos relacional principal
- **SQLAlchemy 2.0** — ORM con soporte async y type hints modernos
- **Alembic** — Migraciones de esquema con historial versionado

### Procesamiento de archivos
- **PyMuPDF (fitz)** — Generación de thumbnails y manipulación avanzada de PDFs
- **pikepdf** — Compresión y operaciones de bajo nivel sobre PDFs
- **PyPDF** — Operaciones de merge y split de páginas

### Autenticación y seguridad
- **python-jose** — Generación y validación de tokens JWT
- **bcrypt** — Hash seguro de contraseñas (reemplaza passlib por incompatibilidades)
- **google-auth** — Verificación de tokens de Google OAuth 2.0

### Configuración
- **pydantic-settings** — Variables de entorno tipadas con validación automática

---

## Arquitectura del proyecto

```
backend/
├── app/
│   ├── main.py                   # Punto de entrada: FastAPI app, CORS, routers
│   ├── database.py               # Conexión SQLAlchemy, SessionLocal, Base
│   ├── models.py                 # Modelos ORM: User, Document
│   ├── schemas.py                # Schemas Pydantic para request/response
│   ├── config.py                 # Settings desde variables de entorno
│   ├── dependencies.py           # get_db(), get_current_user()
│   └── routers/
│       ├── auth.py               # Registro, login, Google OAuth, /me
│       ├── documents.py          # CRUD de documentos del usuario
│       ├── merge.py              # Endpoint de merge PDF
│       ├── split.py              # Endpoint de split PDF
│       ├── compress.py           # Endpoint de compresión
│       └── convert_to_image.py   # Endpoint de conversión a imagen
├── storage/                      # Archivos subidos y procesados (no versionado)
├── alembic/                      # Migraciones de base de datos
│   ├── versions/
│   └── env.py
├── requirements.txt
├── alembic.ini
└── .env                          # Variables de entorno locales (no versionado)
```

---

## Instalación y uso local

### Requisitos previos

- Python 3.11 o superior
- PostgreSQL 14 o superior corriendo localmente (o acceso a Neon/Supabase)
- [pgAdmin](https://www.pgadmin.org/) recomendado para gestionar la base de datos

### 1. Crear entorno virtual

```bash
cd backend
python -m venv venv
```

### 2. Activar entorno virtual

```bash
# Windows (PowerShell)
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/neatpdf

# JWT
SECRET_KEY=genera_una_clave_secreta_larga_y_aleatoria
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth (opcional para desarrollo)
GOOGLE_CLIENT_ID=tu_google_client_id

# Almacenamiento
STORAGE_PATH=./storage
```

Para generar una `SECRET_KEY` segura:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Crear la base de datos

En pgAdmin (o psql), crea una base de datos llamada `neatpdf`. Luego ejecuta las migraciones:

```bash
alembic upgrade head
```

### 6. Iniciar el servidor

```bash
uvicorn app.main:app --reload
```

La API estará disponible en `http://127.0.0.1:8000`.
Documentación interactiva (Swagger UI): `http://127.0.0.1:8000/docs`

---

## Decisiones técnicas destacadas

**Prefijo doble en routers**
Los routers de FastAPI se montan con `prefix="/api/compress"` en `main.py`. Los decoradores dentro del router usan `@router.post("")` (sin path adicional) para evitar duplicación que genera redirects 307.

**bcrypt directo sin passlib**
Se usa `bcrypt` directamente en lugar de `passlib` para evitar errores de incompatibilidad con versiones modernas de Python que causaban 500 en el registro de usuarios.

**Almacenamiento local en desarrollo**
Los archivos procesados se guardan en `./storage/` con UUIDs como nombres para evitar colisiones. En producción (Render), el disco es efímero — se recomienda migrar a Cloudflare R2 o Backblaze B2 para persistencia real.

**Thumbnails con PyMuPDF**
Al guardar un documento, se renderiza la primera página como imagen PNG usando `fitz` y se almacena junto al archivo. Esto evita regenerarlos en cada petición del cliente.

---

## Migraciones con Alembic

```bash
# Crear una nueva migración automáticamente
alembic revision --autogenerate -m "descripcion del cambio"

# Aplicar todas las migraciones pendientes
alembic upgrade head

# Ver el estado actual
alembic current

# Revertir la última migración
alembic downgrade -1
```

---

## Despliegue (Render + Neon)

### Base de datos — Neon

1. Crea una cuenta en [neon.tech](https://neon.tech)
2. Crea un proyecto nuevo y copia la connection string
3. Úsala como `DATABASE_URL` en Render

### Servidor — Render

1. Crea un **Web Service** conectado a tu repo de GitHub
2. Configura:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Agrega las variables de entorno en el dashboard de Render

> ⚠️ El plan gratuito de Render tiene un **cold start de ~30 segundos** tras 15 minutos de inactividad. Es aceptable para demos de portafolio.

---

## Licencia

MIT © 2026 Elvia — Proyecto de portafolio académico y profesional.