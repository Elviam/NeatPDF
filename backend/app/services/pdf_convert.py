import io
import zipfile
from pdf2image import convert_from_bytes
from PIL import Image


def convert_pdf_to_images(file_bytes: bytes, format: str = "png", dpi: int = 150) -> bytes:
    """
    Convierte un PDF a imágenes (PNG o JPG) y las retorna en un ZIP.
    
    Args:
        file_bytes: Contenido del PDF en bytes
        format: "png" o "jpg"
        dpi: Resolución de las imágenes (default 150)
    
    Returns:
        Contenido del ZIP con las imágenes
    """
    # Convertir PDF a imágenes
    images = convert_from_bytes(file_bytes, dpi=dpi)
    
    # Crear archivo ZIP
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for page_num, image in enumerate(images, 1):
            # Convertir a formato solicitado
            img_buffer = io.BytesIO()
            
            if format.lower() == "jpg":
                # Convertir RGBA a RGB para JPG
                if image.mode == "RGBA":
                    rgb_image = Image.new("RGB", image.size, (255, 255, 255))
                    rgb_image.paste(image, mask=image.split()[3])
                    image = rgb_image
                image.save(img_buffer, format="JPEG", quality=95)
            else:  # png
                image.save(img_buffer, format="PNG", optimize=True)
            
            img_buffer.seek(0)
            
            # Guardar en ZIP con nombre descriptivo
            extension = "jpg" if format.lower() == "jpg" else "png"
            zip_file.writestr(f"page_{page_num:03d}.{extension}", img_buffer.read())
    
    zip_buffer.seek(0)
    return zip_buffer.read()
