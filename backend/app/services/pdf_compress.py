"""
Servicio de compresión de PDFs.

Estrategia:
1. Recorre todas las imágenes incrustadas (XObjects de tipo /Image) y las
   recodifica como JPEG, reduciendo su resolución y calidad según el
   nivel solicitado. Esto es lo que más peso reduce en PDFs escaneados
   o con fotografías.
2. Le pide a pikepdf que reescriba el archivo comprimiendo streams y
   generando object streams, lo que también ayuda en PDFs de solo texto.
"""

import io

import pikepdf
from pikepdf import Name, Pdf, PdfImage
from PIL import Image

# Configuración por nivel de calidad: tamaño máximo del lado más largo
# de cada imagen (en px) y calidad JPEG (1-95).
QUALITY_PRESETS = {
    "low":    {"max_dimension": 800,  "jpeg_quality": 35},
    "medium": {"max_dimension": 1200, "jpeg_quality": 60},
    "high":   {"max_dimension": 1600, "jpeg_quality": 80},
}


def compress_pdf(file_bytes: bytes, quality: str = "medium") -> bytes:
    """
    Comprime un PDF y devuelve los bytes del archivo resultante.

    Args:
        file_bytes: contenido del PDF original.
        quality: "low" | "medium" | "high".

    Raises:
        ValueError: si el archivo no puede abrirse como PDF.
    """
    preset = QUALITY_PRESETS.get(quality, QUALITY_PRESETS["medium"])

    try:
        pdf = Pdf.open(io.BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError(f"No se pudo abrir el archivo PDF: {exc}")

    try:
        _compress_images(pdf, preset)

        buffer = io.BytesIO()
        pdf.save(
            buffer,
            compress_streams=True,
            object_stream_mode=pikepdf.ObjectStreamMode.generate,
            recompress_flate=True,
        )
        compressed_bytes = buffer.getvalue()
    finally:
        pdf.close()

    # Si por alguna razón el resultado quedó más pesado que el original
    # (puede pasar con PDFs ya muy optimizados), devolvemos el original.
    if len(compressed_bytes) >= len(file_bytes):
        return file_bytes

    return compressed_bytes


def _compress_images(pdf: Pdf, preset: dict) -> None:
    """Recorre todas las páginas y recomprime las imágenes que encuentre."""
    max_dimension = preset["max_dimension"]
    jpeg_quality = preset["jpeg_quality"]

    for page in pdf.pages:
        if "/Resources" not in page or "/XObject" not in page.Resources:
            continue

        xobjects = page.Resources.XObject

        for name in list(xobjects.keys()):
            xobject = xobjects[name]

            if xobject.get("/Subtype") != Name("/Image"):
                continue

            try:
                _compress_single_image(xobject, max_dimension, jpeg_quality)
            except Exception:
                # Si una imagen específica no se puede procesar (formatos
                # poco comunes, CMYK con perfiles raros, etc.), se deja
                # sin modificar en lugar de fallar todo el PDF.
                continue


def _compress_single_image(xobject, max_dimension: int, jpeg_quality: int) -> None:
    """Recodifica una sola imagen XObject como JPEG redimensionado."""
    pdf_image = PdfImage(xobject)

    # No tocar máscaras de transparencia ni imágenes de muy pocos bits
    # (usualmente texto escaneado en blanco y negro, donde JPEG empeora
    # la legibilidad y puede aumentar el peso).
    if xobject.get("/ImageMask", False):
        return
    if pdf_image.bits_per_component and pdf_image.bits_per_component < 8:
        return
    if str(pdf_image.colorspace) == "/Indexed":
        return

    pil_image = pdf_image.as_pil_image()

    if pil_image.mode not in ("RGB", "L"):
        pil_image = pil_image.convert("RGB")

    width, height = pil_image.size
    largest_side = max(width, height)

    if largest_side > max_dimension:
        scale = max_dimension / largest_side
        new_size = (max(1, int(width * scale)), max(1, int(height * scale)))
        pil_image = pil_image.resize(new_size, Image.LANCZOS)

    buffer = io.BytesIO()
    pil_image.save(buffer, format="JPEG", quality=jpeg_quality, optimize=True)
    new_bytes = buffer.getvalue()

    new_colorspace = Name("/DeviceRGB") if pil_image.mode == "RGB" else Name("/DeviceGray")

    # Si la imagen tenía una máscara de transparencia, la quitamos: tras
    # recodificar a JPEG ya no aplica y dejarla causaría errores de render.
    if "/SMask" in pdf_image.obj:
        del pdf_image.obj.SMask

    pdf_image.obj.write(new_bytes, filter=Name("/DCTDecode"))
    pdf_image.obj.ColorSpace = new_colorspace
    pdf_image.obj.Width = pil_image.width
    pdf_image.obj.Height = pil_image.height
    pdf_image.obj.BitsPerComponent = 8