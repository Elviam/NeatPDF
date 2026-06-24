import React, { useState } from 'react'
import { Upload, X, AlertCircle, Zap, Gauge, Scale, Sparkles } from 'lucide-react'
import axios from 'axios'
import Button from '../components/ButtonDownload'
const COMPRESS_API = `${import.meta.env.VITE_API_URL}/api/compress`

export default function CompressPDF() {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [quality, setQuality] = useState('medium')
  const [originalSize, setOriginalSize] = useState(null)

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
    setOriginalSize(selectedFile.size)
  }

  const removeFile = () => {
    setFile(null)
    setOriginalSize(null)
    setError('')
  }

  const handleCompress = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file.file)

      const response = await axios.post(COMPRESS_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          quality: quality,
        },
        responseType: 'blob',
      })

      const compressedSize = response.data.size
      const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100)

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'compressed.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccessMessage(
        `✓ PDF comprimido exitosamente! (${reduction}% de reducción)`
      )
      setTimeout(() => setSuccessMessage(''), 4000)
      removeFile()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al comprimir el PDF')
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

  const qualityOptions = [
    {
      value: 'low',
      label: 'Máxima compresión',
      desc: 'Menor tamaño, calidad reducida',
      Icon: Gauge,
    },
    {
      value: 'medium',
      label: 'Balanceado',
      desc: 'Equilibrio entre tamaño y calidad',
      Icon: Scale,
    },
    {
      value: 'high',
      label: 'Alta calidad',
      desc: 'Mínima compresión, mejor calidad',
      Icon: Sparkles,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <h1 style={{
          fontFamily: '"Akt", sans-serif',
          fontWeight: 800,
          fontSize: 42,
          color: '#fff',
          marginBottom: 8,
          letterSpacing: '-1px',
        }}>
          Comprimir PDF
        </h1>

        <p style={{
          fontSize: 15.5,
          color: 'rgba(255,255,255,.7)',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Reduce el tamaño de tu PDF sin sacrificar calidad. Elige el nivel de compresión que prefieras.
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
              border: `2px dashed ${dragActive ? '#d8b4fe' : 'rgba(255,255,255,.2)'}`,
              borderRadius: 12,
              padding: 48,
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(216,180,254,.08)' : 'rgba(255,255,255,.02)',
              transition: 'all .3s ease',
              marginBottom: 32,
            }}
          >
            <div style={{ pointerEvents: 'none' }}>
              <Upload
                size={48}
                style={{
                  color: dragActive ? '#d8b4fe' : 'rgba(216,180,254,.6)',
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

            {/* Quality Options */}
            <div style={{ marginBottom: 32 }}>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                marginBottom: 12,
              }}>
                Nivel de compresión:
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
              }}>
                {qualityOptions.map((option) => {
                  const isActive = quality === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => setQuality(option.value)}
                      style={{
                        padding: '16px 10px',
                        background: isActive ? 'rgba(216,180,254,.15)' : 'rgba(255,255,255,.05)',
                        border: `2px solid ${isActive ? 'rgba(216,180,254,.4)' : 'rgba(255,255,255,.1)'}`,
                        borderRadius: 10,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all .2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        flexShrink: 0,
                        background: isActive ? 'rgba(216,180,254,.18)' : 'rgba(255,255,255,.06)',
                        border: `1px solid ${isActive ? 'rgba(216,180,254,.4)' : 'rgba(255,255,255,.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <option.Icon
                          size={18}
                          color={isActive ? '#d8b4fe' : 'rgba(255,255,255,.55)'}
                          strokeWidth={2}
                        />
                      </div>
                      <p style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isActive ? '#d8b4fe' : '#fff',
                        margin: 0,
                        lineHeight: 1.3,
                      }}>
                        {option.label}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Descripción dinámica de la opción seleccionada */}
              <p style={{
                fontSize: 14.5,
                color: 'rgba(255, 255, 255)',
                margin: '12px 2px 0',
                textAlign: 'center',
                transition: 'opacity .15s ease',
              }}>
                {qualityOptions.find(o => o.value === quality)?.desc}
              </p>
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

        {/* Compress Button */}
        {file && (
       <Button 
        onClick={handleCompress} 
        loading={loading}
        icon={Zap}
        sticky
         >
          Comprimir PDF
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