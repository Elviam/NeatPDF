import io
import zipfile

import fitz  # PyMuPDF
from PIL import Image


def convert_pdf_to_images(file_bytes: bytes, format: str = "png", dpi: int = 150) -> bytes:
    """
    Convierte cada página de un PDF a una imagen (PNG o JPG) y las
    retorna empaquetadas en un ZIP.

    Args:
        file_bytes: contenido del PDF en bytes.
        format: "png" o "jpg".
        dpi: resolución de las imágenes (default 150).

    Returns:
        Contenido del ZIP con las imágenes.

    Raises:
        ValueError: si el archivo no puede abrirse como PDF o no tiene páginas.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError(f"No se pudo abrir el archivo PDF: {exc}")

    if doc.page_count == 0:
        doc.close()
        raise ValueError("El PDF no contiene páginas")

    # fitz renderiza a 72 DPI por defecto, así que escalamos según el DPI pedido
    zoom = dpi / 72
    matrix = fitz.Matrix(zoom, zoom)

    extension = "jpg" if format.lower() == "jpg" else "png"

    zip_buffer = io.BytesIO()
    try:
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for page_num, page in enumerate(doc, start=1):
                pixmap = page.get_pixmap(matrix=matrix)
                png_bytes = pixmap.tobytes("png")

                if extension == "jpg":
                    image = Image.open(io.BytesIO(png_bytes))

                    if image.mode in ("RGBA", "LA"):
                        rgb_image = Image.new("RGB", image.size, (255, 255, 255))
                        rgb_image.paste(image, mask=image.split()[-1])
                        image = rgb_image
                    elif image.mode != "RGB":
                        image = image.convert("RGB")

                    out_buffer = io.BytesIO()
                    image.save(out_buffer, format="JPEG", quality=95)
                    page_bytes = out_buffer.getvalue()
                else:
                    page_bytes = png_bytes

                zip_file.writestr(f"page_{page_num:03d}.{extension}", page_bytes)
    finally:
        doc.close()

    zip_buffer.seek(0)
    return zip_buffer.read()