# Backend - NeatPDF API

## Guía de inicio rápido

### 1. Navegar al directorio backend
```bash
cd backend
```

### 2. Crear entorno virtual
```bash
python -m venv venv
```

### 3. Activar entorno virtual
```bash
venv\Scripts\activate
```

### 4. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 5. Ejecutar servidor
```bash
uvicorn app.main:app --reload
```

El servidor estará disponible en `http://127.0.0.1:8000`

Para ver la documentación interactiva: `http://127.0.0.1:8000/docs`