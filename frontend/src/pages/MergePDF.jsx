import React, { useState, useEffect, useRef } from 'react'
import { Upload, X, ChevronUp, ChevronDown, Download, Trash2, FileText } from 'lucide-react'
import axios from 'axios'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url'
import Button from '../components/ButtonDownload'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const MERGE_API = 'http://localhost:8000/api/merge'

function FileThumbnail({ file, size = 56 }) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false
    let renderTask = null

    const render = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer()
        if (cancelled) return
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        if (cancelled) return
        const page = await pdf.getPage(1)
        if (cancelled) return

        const viewport = page.getViewport({ scale: 1 })
        // Renderizamos a una resolución mayor que el contenedor visible
        // para que el recorte (object-fit: cover vía canvas centrado)
        // se vea nítido en pantallas de alta densidad.
        const renderScale = (size * 2) / Math.min(viewport.width, viewport.height)
        const scaledViewport = page.getViewport({ scale: renderScale })

        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
        const ctx = canvas.getContext('2d')

        renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport })
        await renderTask.promise
        if (!cancelled) setStatus('ready')
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException' && !cancelled) {
          console.warn('No se pudo generar miniatura:', err)
          setStatus('error')
        }
      }
    }

    render()
    return () => {
      cancelled = true
      if (renderTask) { try { renderTask.cancel() } catch (_) {} }
    }
  }, [file, size])

  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      overflow: 'hidden', position: 'relative',
      background: status === 'ready' ? '#fff' : 'rgba(110,231,183,.08)',
      border: '1px solid rgba(255,255,255,.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: status === 'ready' ? 'block' : 'none',
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
        }}
      />
      {status !== 'ready' && (
        <FileText size={20} color="rgba(110,231,183,.5)" />
      )}
    </div>
  )
}

export default function MergePDF() {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // fileObj a eliminar o null

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

  const requestRemoveFile = (fileObj) => {
    setConfirmDelete(fileObj)
  }

  const confirmRemoveFile = () => {
    if (!confirmDelete) return
    setFiles(prev => prev.filter(f => f.id !== confirmDelete.id))
    setConfirmDelete(null)
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
      const formData = new FormData()
      files.forEach((fileObj) => {
        formData.append('files', fileObj.file)
      })

      const response = await axios.post(MERGE_API, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'merged.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccessMessage('✓ PDFs unidos exitosamente!')
      setTimeout(() => setSuccessMessage(''), 4000) 
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
                    height: 80,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Drag Handle */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'grab',
                    flexShrink: 0,
                  }}>
                    <div style={{ width: 4, height: 4, background: 'rgba(255,255,255,.4)', borderRadius: '50%' }} />
                    <div style={{ width: 4, height: 4, background: 'rgba(255,255,255,.4)', borderRadius: '50%' }} />
                    <div style={{ width: 4, height: 4, background: 'rgba(255,255,255,.4)', borderRadius: '50%' }} />
                  </div>

                  {/* Thumbnail — primera página del PDF */}
                  <FileThumbnail file={fileObj.file} size={56} />

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
                    flexShrink: 0,
                  }}>
                    #{index + 1}
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
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
                        display: 'flex',
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
                        display: 'flex',
                      }}
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => requestRemoveFile(fileObj)}
                      style={{
                        background: 'rgba(239,68,68,.1)',
                        border: '1px solid rgba(239,68,68,.2)',
                        color: 'rgba(239,68,68,.7)',
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 4,
                        transition: 'all .2s ease',
                        display: 'flex',
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
         <Button 
          onClick={handleMerge} 
          loading={loading}
          icon={Download}
          sticky
          >
           Unir {files.length} PDFs
        </Button>
        )}

        {/* ── Modal confirmación de eliminación ── */}
        {confirmDelete && (
          <div
            onClick={() => setConfirmDelete(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(5,4,15,.7)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
              animation: 'fadeIn .18s ease both',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'rgba(14,11,28,.97)',
                border: '1px solid rgba(239,68,68,.25)',
                borderRadius: 18, padding: '32px 28px',
                width: 380, maxWidth: '100%',
                boxShadow: '0 32px 64px rgba(0,0,0,.8)',
                animation: 'slideUp .22s cubic-bezier(.34,1.4,.64,1) both',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(239,68,68,.1)',
                border: '1px solid rgba(239,68,68,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Trash2 size={20} color="#fca5a5" />
              </div>

              <h3 style={{
                fontFamily: '"Lato", sans-serif', fontWeight: 700,
                fontSize: 18, color: '#fff',
                textAlign: 'center', margin: '0 0 8px',
              }}>
                ¿Quitar este archivo?
              </h3>

              <p style={{
                fontSize: 13, color: 'rgba(255,255,255,.45)',
                textAlign: 'center', margin: '0 0 6px', lineHeight: 1.5,
              }}>
                Se quitará de la lista a unir
              </p>
              <p style={{
                fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)',
                textAlign: 'center', margin: '0 0 24px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,.05)',
                borderRadius: 8,
                wordBreak: 'break-all',
              }}>
                {confirmDelete.name}
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setConfirmDelete(null)}
                  style={{
                    flex: 1, padding: '11px',
                    borderRadius: 10, border: '1px solid rgba(255,255,255,.1)',
                    background: 'rgba(255,255,255,.05)',
                    color: 'rgba(255,255,255,.6)',
                    fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', transition: 'all .18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRemoveFile}
                  style={{
                    flex: 1, padding: '11px',
                    borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', transition: 'all .18s',
                    boxShadow: '0 4px 14px rgba(239,68,68,.35)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,.35)' }}
                >
                  Sí, quitar
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes slideUp { from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        `}</style>
      </div>
    </div>
  )
}