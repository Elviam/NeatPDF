import io
import pikepdf


def compress_pdf(file_bytes: bytes, quality: str = "medium") -> bytes:
    """
    Comprime un PDF reduciendo el tamaño de la imagen.
    quality: "low", "medium", "high"
    """
    pdf = pikepdf.open(io.BytesIO(file_bytes))
    
    # Configurar opciones de compresión según calidad
    options = {
        "low": {
            "compress_streams": True,
            "object_stream_mode": pikepdf.ObjectStreamMode.generate,
            "remove_duplication": True,
        },
        "medium": {
            "compress_streams": True,
            "object_stream_mode": pikepdf.ObjectStreamMode.generate,
            "remove_duplication": True,
        },
        "high": {
            "compress_streams": False,
            "remove_duplication": False,
        }
    }
    
    output = io.BytesIO()
    pdf.save(output, **options.get(quality, options["medium"]))
    output.seek(0)
    return output.read()
