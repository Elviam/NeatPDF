import io
from pypdf import PdfWriter

def merge_pdfs(files_bytes: list[bytes]) -> bytes:
    writer = PdfWriter()

    for file_bytes in files_bytes:
        reader_stream = io.BytesIO(file_bytes)
        writer.append(reader_stream)

    output = io.BytesIO()
    writer.write(output)
    output.seek(0)
    return output.read()