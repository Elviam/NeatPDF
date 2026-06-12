# 📂 NeatPDF - Frontend

Una aplicación web moderna, rápida y segura diseñada para manipular archivos PDF directamente desde el navegador. **NeatPDF** prioriza la experiencia de usuario con una interfaz limpia, animaciones fluidas y procesamiento eficiente para garantizar la privacidad y comodidad del usuario.

---

## 🚀 Características Principales

* **Unir PDF:** Combina múltiples archivos PDF en un solo documento en el orden exacto que decida el usuario.
* **Separar PDF:** Divide las páginas de un archivo PDF y las descarga agrupadas de forma inteligente, con previsualización en tiempo real de cada rango seleccionado.
* **Arrastrar y Soltar:** Zona de carga intuitiva para interactuar con los archivos de manera natural.
* **Comprimir PDF** *(próximamente):* Optimiza y reduce el peso de los archivos para compartirlos más fácilmente.
* **PDF a Imagen** *(próximamente):* Transforma páginas de documentos PDF a formatos de imagen independientes (PNG/JPG).

---

## 🛠️ Stack Tecnológico y Dependencias

El núcleo del frontend está construido sobre el ecosistema de **React 19** y **Vite 8**, utilizando las siguientes librerías clave para su funcionamiento:

### Procesamiento y Manipulación de Archivos
* **`pdfjs-dist` (PDF.js):** Motor de Mozilla utilizado para renderizar, leer y generar previsualizaciones de las páginas de los archivos PDF en el cliente.
* **`jszip`:** Encargada de empaquetar y comprimir múltiples archivos resultantes en un único `.zip` descargable, evitando saturar las descargas del usuario.
* **`react-dropzone`:** Gestión y validación de la zona interactiva de arrastre (*drag and drop*) para la carga de archivos.

### Interfaz de Usuario y Estilos
* **`tailwindcss` v4.0:** Framework de CSS utilizado junto con su plugin oficial para Vite, permitiendo un diseño responsivo, moderno y de alto rendimiento.
* **`lucide-react`:** Set de iconos vectoriales limpios y consistentes utilizados en toda la interfaz de la aplicación.
* **`react-router-dom` v7:** Sistema de enrutamiento dinámico para navegar entre la página de inicio y las diferentes herramientas PDF sin recargar el navegador.

### Comunicación y Core
* **`axios`:** Cliente HTTP utilizado para gestionar las peticiones y la comunicación asíncrona con la API del backend.

---

## 💻 Instalación y Uso Local

Sigue estos pasos para clonar el repositorio y ejecutar el entorno de desarrollo en tu máquina local.

### Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión LTS recomendada) y npm.

> ⚠️ **Nota:** Algunas herramientas de NeatPDF requieren que el backend (FastAPI) esté corriendo para procesar los archivos. Consulta el README del backend para las instrucciones de instalación y ejecución con `uvicorn`.

### Pasos de Configuración

1. **Clonar el repositorio e ingresar a la carpeta del proyecto:**
```bash
git clone https://github.com/Elviam/NeatPDF.git
cd NeatPDF/frontend
```

2. **Instalar todas las dependencias del proyecto:**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo local:**
```bash
npm run dev
```

4. **Abrir la aplicación:**

Una vez iniciado el servidor, abre tu navegador y visita la URL indicada en la terminal (por defecto `http://localhost:5173`).

---

## 📦 Build de Producción

Para generar una versión optimizada y lista para despliegue:

```bash
npm run build
```

Los archivos resultantes se generarán en la carpeta `dist/`, listos para ser servidos por cualquier hosting de archivos estáticos.

Para previsualizar la build de producción localmente:

```bash
npm run preview
```

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/    # Componentes reutilizables de la interfaz
│   ├── pages/          # Páginas principales (Home, MergePDF, SplitPDF, etc.)
│   ├── App.jsx         # Configuración de rutas
│   └── main.jsx        # Punto de entrada de la aplicación
├── public/             # Recursos estáticos
├── package.json
└── vite.config.js
```