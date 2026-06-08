import React, { useState } from 'react'
import { Upload, X, Download, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const SPLIT_ALL_API = 'http://localhost:8000/api/split/all'
const SPLIT_RANGE_API = 'http://localhost:8000/api/split/range'

export default function SplitPDF() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [totalPages, setTotalPages] = useState(null)
  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(1)
  const [splitMode, setSplitMode] = useState('all') // 'all' o 'range'

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
    addFile(droppedFiles[0])
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

    // Contar páginas usando pdf.js
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const pdf = await import('pdfjs-dist')
        const pdfData = new Uint8Array(event.target.result)
        
        const pdfdoc = await pdf.getDocument({ data: pdfData }).promise
        setTotalPages(pdfdoc.numPages)
        setEndPage(pdfdoc.numPages)
        setStartPage(1)

        setFile({
          id: Math.random(),
          file: selectedFile,
          name: selectedFile.name,
          size: selectedFile.size,
        })
      } catch (err) {
        console.error('Error al leer PDF:', err)
        setFile({
          id: Math.random(),
          file: selectedFile,
          name: selectedFile.name,
          size: selectedFile.size,
        })
        setTotalPages(null)
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
    setTotalPages(null)
    setError('')
    setSuccessMessage('')
  }

  const handleSplitAll = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file.file)

      const response = await axios.post(SPLIT_ALL_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      })

      // Descargar el archivo ZIP
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'split_pages.zip')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccessMessage('✓ PDF separado exitosamente!')
      removeFile()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al separar el PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleSplitRange = async () => {
    if (!file) return

    if (startPage > endPage) {
      setError('La página inicial no puede ser mayor que la final')
      return
    }

    if (startPage < 1 || endPage > (totalPages || 1)) {
      setError(`Rango inválido. El PDF tiene ${totalPages || '?'} páginas`)
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file.file)

      const response = await axios.post(SPLIT_RANGE_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          start_page: startPage,
          end_page: endPage,
        },
        responseType: 'blob',
      })

      // Descargar el archivo PDF
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `pages_${startPage}_${endPage}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccessMessage(
        `✓ Páginas ${startPage}-${endPage} extraídas exitosamente!`
      )
      removeFile()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al separar el PDF')
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
          Separar PDF
        </h1>

        <p style={{
          fontSize: 15.5,
          color: 'rgba(255,255,255,.7)',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Sube un PDF y separa sus páginas en archivos individuales o extrae un rango específico.
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
              border: `2px dashed ${dragActive ? '#93c5fd' : 'rgba(255,255,255,.2)'}`,
              borderRadius: 12,
              padding: 48,
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(147,197,253,.08)' : 'rgba(255,255,255,.02)',
              transition: 'all .3s ease',
              marginBottom: 32,
            }}
          >
            <div style={{ pointerEvents: 'none' }}>
              <Upload
                size={48}
                style={{
                  color: dragActive ? '#93c5fd' : 'rgba(147,197,253,.6)',
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
                  {totalPages && ` • ${totalPages} página${totalPages !== 1 ? 's' : ''}`}
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

            {/* Split Mode Selector */}
            <div style={{ marginBottom: 32 }}>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                marginBottom: 12,
              }}>
                Elige cómo separar:
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setSplitMode('all')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: splitMode === 'all' ? 'rgba(147,197,253,.2)' : 'rgba(255,255,255,.05)',
                    border: `1px solid ${splitMode === 'all' ? 'rgba(147,197,253,.4)' : 'rgba(255,255,255,.1)'}`,
                    color: splitMode === 'all' ? '#93c5fd' : 'rgba(255,255,255,.7)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all .2s ease',
                  }}
                >
                  Todas las páginas
                </button>
                <button
                  onClick={() => setSplitMode('range')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: splitMode === 'range' ? 'rgba(147,197,253,.2)' : 'rgba(255,255,255,.05)',
                    border: `1px solid ${splitMode === 'range' ? 'rgba(147,197,253,.4)' : 'rgba(255,255,255,.1)'}`,
                    color: splitMode === 'range' ? '#93c5fd' : 'rgba(255,255,255,.7)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all .2s ease',
                  }}
                >
                  Rango específico
                </button>
              </div>
            </div>

            {/* Range Input */}
            {splitMode === 'range' && (
              <div style={{
                background: 'rgba(147,197,253,.08)',
                border: '1px solid rgba(147,197,253,.2)',
                borderRadius: 8,
                padding: 20,
                marginBottom: 32,
              }}>
                <p style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: 16,
                }}>
                  Selecciona el rango de páginas
                  {totalPages && ` (1-${totalPages})`}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 12,
                      color: 'rgba(255,255,255,.7)',
                      marginBottom: 6,
                      fontWeight: 500,
                    }}>
                      Desde página
                    </label>
                    <input
                      type="number"
                      value={startPage}
                      onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={totalPages || 999}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid rgba(255,255,255,.1)',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 12,
                      color: 'rgba(255,255,255,.7)',
                      marginBottom: 6,
                      fontWeight: 500,
                    }}>
                      Hasta página
                    </label>
                    <input
                      type="number"
                      value={endPage}
                      onChange={(e) => setEndPage(Math.max(startPage, parseInt(e.target.value) || startPage))}
                      min={startPage}
                      max={totalPages || 999}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,.05)',
                        border: '1px solid rgba(255,255,255,.1)',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
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

        {/* Action Buttons */}
        {file && (
          <div style={{ display: 'flex', gap: 12 }}>
            {splitMode === 'all' && (
              <button
                onClick={handleSplitAll}
                disabled={loading || !totalPages}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: loading ? 'rgba(147,197,253,.3)' : 'linear-gradient(135deg, #93c5fd, #60a5fa)',
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
                    Separando...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Separar todas las páginas
                  </>
                )}
              </button>
            )}
            {splitMode === 'range' && (
              <button
                onClick={handleSplitRange}
                disabled={loading || !totalPages}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: loading ? 'rgba(147,197,253,.3)' : 'linear-gradient(135deg, #93c5fd, #60a5fa)',
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
                    Extrayendo...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Extraer páginas {startPage}-{endPage}
                  </>
                )}
              </button>
            )}
          </div>
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
