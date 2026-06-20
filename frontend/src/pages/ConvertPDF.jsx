import React, { useState } from 'react'
import { Upload, X, Download, AlertCircle, Image as ImageIcon } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ButtonDownload'

const CONVERT_API = 'http://localhost:8000/api/convert'

export default function ConvertPDF() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [format, setFormat] = useState('png')
  const [dpi, setDpi] = useState(150)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    addFile(e.dataTransfer.files[0])
  }

  const handleFileInput = (e) => {
    addFile(e.target.files[0])
  }

  const addFile = (selectedFile) => {
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF')
      setTimeout(() => setError(''), 3000)
      return
    }

    setFile({
      id: Math.random(),
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
    })
  }

  const removeFile = () => {
    setFile(null)
    setError('')
  }

  const handleConvert = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file.file)

      const response = await axios.post(CONVERT_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          format: format,
          dpi: dpi,
        },
        responseType: 'blob',
      })

      // Descargar el archivo ZIP
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `converted_${format}.zip`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccessMessage(`✓ PDF convertido a ${format.toUpperCase()} exitosamente!`)
      setTimeout(() => setSuccessMessage(''), 4000) 
      removeFile()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al convertir el PDF')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatOptions = [
    { value: 'png', label: 'PNG', desc: 'Mayor calidad, archivo más grande' },
    { value: 'jpg', label: 'JPG', desc: 'Comprimido, archivo más pequeño' },
  ]

  const dpiOptions = [
    { value: 72, label: 'Baja (72 DPI)' },
    { value: 150, label: 'Media (150 DPI)' },
    { value: 200, label: 'Alta (200 DPI)' },
    { value: 300, label: 'Muy Alta (300 DPI)' },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}

        <h1 style={{
          fontFamily: '"Akt", sans-serif',
          fontWeight: 800,
          fontSize: 42,
          color: '#fff',
          marginBottom: 8,
          letterSpacing: '-1px',
        }}>
          PDF a Imagen
        </h1>

        <p style={{
          fontSize: 15.5,
          color: 'rgba(255,255,255,.7)',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Convierte cada página de tu PDF en imágenes PNG o JPG. Las imágenes se descargarán en un archivo ZIP.
        </p>

        {/* Drag & Drop Area */}
        {!file ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{
              border: `2px dashed ${dragActive ? '#a5f3fc' : 'rgba(255,255,255,.2)'}`,
              borderRadius: 12,
              padding: 48,
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(165,243,252,.08)' : 'rgba(255,255,255,.02)',
              transition: 'all .3s ease',
              marginBottom: 32,
            }}
          >
            <div style={{ pointerEvents: 'none' }}>
              <Upload
                size={48}
                style={{
                  color: dragActive ? '#a5f3fc' : 'rgba(165,243,252,.6)',
                  marginBottom: 16,
                  margin: '0 auto 16px',
                }}
              />
              <p style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
                margin: '0 0 8px',
              }}>
                Arrastra tu PDF aquí
              </p>
              <p style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.6)',
                margin: 0,
              }}>
                o haz clic para seleccionar archivo
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* File Card */}
            <div style={{
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 8,
              padding: 16,
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#fff',
                  margin: '0 0 4px',
                }}>
                  {file.name}
                </p>
                <p style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,.5)',
                  margin: 0,
                }}>
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={removeFile}
                style={{
                  background: 'rgba(239,68,68,.1)',
                  border: '1px solid rgba(239,68,68,.2)',
                  color: 'rgba(239,68,68,.7)',
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Format Selection */}
            <div style={{ marginBottom: 24 }}>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                marginBottom: 12,
              }}>
                Formato de imagen:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormat(option.value)}
                    style={{
                      padding: 16,
                      background: format === option.value ? 'rgba(165,243,252,.15)' : 'rgba(255,255,255,.05)',
                      border: `2px solid ${format === option.value ? 'rgba(165,243,252,.4)' : 'rgba(255,255,255,.1)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all .2s ease',
                    }}
                  >
                    <p style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: format === option.value ? '#a5f3fc' : '#fff',
                      margin: '0 0 4px',
                    }}>
                      {option.label}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,.6)',
                      margin: 0,
                    }}>
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* DPI Selection */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <p style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  margin: 0,
                }}>
                  Resolución:
                </p>
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#a5f3fc',
                }}>
                  {dpi} DPI
                </span>
              </div>
              <input
                type="range"
                min="72"
                max="300"
                step="1"
                value={dpi}
                onChange={(e) => setDpi(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,.1)',
                  outline: 'none',
                  WebkitAppearance: 'none',
                }}
              />
              <style>{`
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #a5f3fc, #67e8f9);
                  cursor: pointer;
                  box-shadow: 0 0 8px rgba(165, 243, 252, 0.5);
                }
                
                input[type="range"]::-moz-range-thumb {
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #a5f3fc, #67e8f9);
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 0 8px rgba(165, 243, 252, 0.5);
                }
              `}</style>
              <div style={{
                display: 'flex',
                gap: 8,
                marginTop: 12,
                justifyContent: 'space-around',
              }}>
                {dpiOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDpi(option.value)}
                    style={{
                      fontSize: 11,
                      padding: '6px 10px',
                      background: dpi === option.value ? 'rgba(165,243,252,.2)' : 'rgba(255,255,255,.05)',
                      border: `1px solid ${dpi === option.value ? 'rgba(165,243,252,.4)' : 'rgba(255,255,255,.1)'}`,
                      color: dpi === option.value ? '#a5f3fc' : 'rgba(255,255,255,.7)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all .2s ease',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Messages */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,.1)',
            border: '1px solid rgba(239,68,68,.3)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: 'rgba(34,197,94,.1)',
            border: '1px solid rgba(34,197,94,.3)',
            color: '#86efac',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
          }}>
            {successMessage}
          </div>
        )}

        {/* Convert Button */}
        {file && (
         <Button 
         onClick={handleConvert} 
         loading={loading}
         icon={ImageIcon}
         sticky
          >
          Convertir a {format.toUpperCase()}
         </Button> 
        )}

        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}