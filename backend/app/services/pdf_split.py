import io
import zipfile
from pypdf import PdfReader, PdfWriter


def split_pdf(file_bytes: bytes, start_page: int, end_page: int) -> bytes:
    """
    Extrae un rango de páginas de un PDF.
    Las páginas están indexadas desde 1.
    """
    reader = PdfReader(io.BytesIO(file_bytes))
    total_pages = len(reader.pages)
    
    # Validar rango
    if start_page < 1 or end_page > total_pages or start_page > end_page:
        raise ValueError(f"Rango inválido. El PDF tiene {total_pages} páginas.")
    
    writer = PdfWriter()
    
    # Agregar páginas (convertir a índice 0)
    for page_num in range(start_page - 1, end_page):
        writer.add_page(reader.pages[page_num])
    
    output = io.BytesIO()
    writer.write(output)
    output.seek(0)
    return output.read()


def split_pdf_all_pages(file_bytes: bytes) -> bytes:
    """
    Separa todas las páginas de un PDF en archivos individuales y los retorna en un ZIP.
    """
    reader = PdfReader(io.BytesIO(file_bytes))
    total_pages = len(reader.pages)
    
    # Crear archivo ZIP
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for page_num in range(total_pages):
            writer = PdfWriter()
            writer.add_page(reader.pages[page_num])
            
            pdf_buffer = io.BytesIO()
            writer.write(pdf_buffer)
            pdf_buffer.seek(0)
            
            # Guardar en ZIP con nombre descriptivo
            zip_file.writestr(f"page_{page_num + 1:03d}.pdf", pdf_buffer.read())
    
    zip_buffer.seek(0)
    return zip_buffer.read()
