import React, { useState } from 'react'
import { Upload, X, ChevronUp, ChevronDown, Download } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const UPLOAD_API = 'http://localhost:8000/api/merge/upload'
const MERGE_API = 'http://localhost:8000/api/merge'

export default function MergePDF() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)

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

    const droppedFiles = e.dataTransfer.files
    addFiles(droppedFiles)
  }

  const handleFileInput = (e) => {
    const selectedFiles = e.target.files
    addFiles(selectedFiles)
  }

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList)
      .filter(file => file.type === 'application/pdf')
      .map(file => ({
        id: Math.random(),
        file: file,
        name: file.name,
        size: file.size,
      }))

    if (Array.from(fileList).some(f => f.type !== 'application/pdf')) {
      setError('Solo se permiten archivos PDF')
      setTimeout(() => setError(''), 3000)
    }

    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const moveFile = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === files.length - 1)
    ) {
      return
    }

    const newFiles = [...files]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]]
    setFiles(newFiles)
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnItem = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)
    setFiles(newFiles)
    setDraggedIndex(null)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Debes seleccionar al menos 2 archivos PDF')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      // Crear FormData con los archivos en orden
      const formData = new FormData()
      files.forEach((fileObj, index) => {
        formData.append('files', fileObj.file)
      })

      // Enviar al backend
      const response = await axios.post(MERGE_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      })

      // Descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'merged.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccessMessage('✓ PDFs unidos exitosamente!')
      setFiles([])
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al unir los PDFs')
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

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,.7)',
            cursor: 'pointer',
            fontSize: 14,
            marginBottom: 32,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← Volver
        </button>

        <h1 style={{
          fontFamily: '"Akt", sans-serif',
          fontWeight: 800,
          fontSize: 42,
          color: '#fff',
          marginBottom: 8,
          letterSpacing: '-1px',
        }}>
          Unir PDFs
        </h1>

        <p style={{
          fontSize: 15.5,
          color: 'rgba(255,255,255,.7)',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Sube o arrastra tus archivos PDF, ordénalos como quieras y únelos en un solo documento.
        </p>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            border: `2px dashed ${dragActive ? '#6ee7b7' : 'rgba(255,255,255,.2)'}`,
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
            cursor: 'pointer',
            background: dragActive ? 'rgba(110,231,183,.08)' : 'rgba(255,255,255,.02)',
            transition: 'all .3s ease',
            marginBottom: 32,
          }}
        >
          <div style={{ pointerEvents: 'none' }}>
            <Upload
              size={48}
              style={{
                color: dragActive ? '#6ee7b7' : 'rgba(110,231,183,.6)',
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
              Arrastra tus PDFs aquí
            </p>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,.6)',
              margin: 0,
            }}>
              o haz clic para seleccionar archivos
            </p>
          </div>
        </div>

        <input
          id="fileInput"
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

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
          }}>
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

        {/* Files List */}
        {files.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
                margin: 0,
              }}>
                {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={() => setFiles([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,100,100,.7)',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 0,
                }}
              >
                Limpiar todo
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {files.map((fileObj, index) => (
                <div
                  key={fileObj.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnItem(e, index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(255,255,255,.08)',
                    border: `1px solid ${draggedIndex === index ? 'rgba(110,231,183,.5)' : 'rgba(255,255,255,.1)'}`,
                    borderRadius: 8,
                    padding: 12,
                    transition: 'all .2s ease',
                    opacity: draggedIndex === index ? 0.5 : 1,
                  }}
                >
                  {/* Drag Handle */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'grab',
                  }}>
                    <div style={{ width: 4, height: 4, background: 'rgba(255,255,255,.4)', borderRadius: '50%' }} />
                    <div style={{ width: 4, height: 4, background: 'rgba(255,255,255,.4)', borderRadius: '50%' }} />
                    <div style={{ width: 4, height: 4, background: 'rgba(255,255,255,.4)', borderRadius: '50%' }} />
                  </div>

                  {/* File Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#fff',
                      margin: '0 0 4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {fileObj.name}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,.5)',
                      margin: 0,
                    }}>
                      {formatFileSize(fileObj.size)}
                    </p>
                  </div>

                  {/* Order Badge */}
                  <div style={{
                    background: 'rgba(110,231,183,.2)',
                    color: '#6ee7b7',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    minWidth: 28,
                    textAlign: 'center',
                  }}>
                    #{index + 1}
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      style={{
                        background: 'rgba(255,255,255,.1)',
                        border: '1px solid rgba(255,255,255,.2)',
                        color: index === 0 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.7)',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        padding: 6,
                        borderRadius: 4,
                        transition: 'all .2s ease',
                      }}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === files.length - 1}
                      style={{
                        background: 'rgba(255,255,255,.1)',
                        border: '1px solid rgba(255,255,255,.2)',
                        color: index === files.length - 1 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.7)',
                        cursor: index === files.length - 1 ? 'not-allowed' : 'pointer',
                        padding: 6,
                        borderRadius: 4,
                        transition: 'all .2s ease',
                      }}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      style={{
                        background: 'rgba(239,68,68,.1)',
                        border: '1px solid rgba(239,68,68,.2)',
                        color: 'rgba(239,68,68,.7)',
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 4,
                        transition: 'all .2s ease',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merge Button */}
        {files.length >= 2 && (
          <button
            onClick={handleMerge}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: loading ? 'rgba(110,231,183,.3)' : 'linear-gradient(135deg, #6ee7b7, #34d399)',
              border: 'none',
              color: '#000',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all .3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(0,0,0,.3)',
                  borderTop: '2px solid #000',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Uniendo PDFs...
              </>
            ) : (
              <>
                <Download size={18} />
                Unir {files.length} PDFs
              </>
            )}
          </button>
        )}

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
