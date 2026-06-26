import React, { useState, useEffect, useRef } from 'react'
import { Upload, X, ChevronUp, ChevronDown, Download, Trash2, FileText } from 'lucide-react'
import axios from 'axios'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url'
import Button from '../components/ButtonDownload'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const MERGE_API = `${import.meta.env.VITE_API_URL}/api/merge`

function FileThumbnail({ file, size = 56 }) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('loading')

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
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Touch drag state
  const touchDragIndex = useRef(null)
  const touchCloneRef = useRef(null)
  const touchStartY = useRef(0)
  const touchLastY = useRef(0)
  const itemRectsRef = useRef([])
  const listRef = useRef(null)

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
    addFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e) => {
    addFiles(e.target.files)
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

  const requestRemoveFile = (fileObj) => setConfirmDelete(fileObj)

  const confirmRemoveFile = () => {
    if (!confirmDelete) return
    setFiles(prev => prev.filter(f => f.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const moveFile = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === files.length - 1)
    ) return

    const newFiles = [...files]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]]
    setFiles(newFiles)
  }

  // Mouse drag handlers
  const handleMouseDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleMouseDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleMouseDropOnItem = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)
    setFiles(newFiles)
    setDraggedIndex(null)
  }

  // Touch drag handlers
  const handleTouchStart = (e, index) => {
    const touch = e.touches[0]
    touchDragIndex.current = index
    touchStartY.current = touch.clientY
    touchLastY.current = touch.clientY

    // Snapshot rects of all list items
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('[data-file-item]')
      itemRectsRef.current = Array.from(items).map(el => el.getBoundingClientRect())
    }

    // Create floating clone
    const sourceEl = e.currentTarget
    const rect = sourceEl.getBoundingClientRect()
    const clone = sourceEl.cloneNode(true)
    clone.style.position = 'fixed'
    clone.style.left = rect.left + 'px'
    clone.style.top = rect.top + 'px'
    clone.style.width = rect.width + 'px'
    clone.style.height = rect.height + 'px'
    clone.style.zIndex = '9999'
    clone.style.opacity = '0.9'
    clone.style.pointerEvents = 'none'
    clone.style.borderRadius = '8px'
    clone.style.boxShadow = '0 8px 32px rgba(0,0,0,.5)'
    clone.style.border = '1px solid rgba(110,231,183,.6)'
    clone.style.transform = 'scale(1.02)'
    clone.style.transition = 'none'
    document.body.appendChild(clone)
    touchCloneRef.current = clone

    // Visual feedback on source
    sourceEl.style.opacity = '0.3'
  }

  const handleTouchMove = (e) => {
    if (touchDragIndex.current === null) return
    e.preventDefault()

    const touch = e.touches[0]
    const deltaY = touch.clientY - touchLastY.current
    touchLastY.current = touch.clientY

    // Move clone
    if (touchCloneRef.current) {
      const currentTop = parseFloat(touchCloneRef.current.style.top) || 0
      touchCloneRef.current.style.top = (currentTop + deltaY) + 'px'
    }

    // Determine target index based on finger position
    const rects = itemRectsRef.current
    let targetIndex = touchDragIndex.current
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i]
      const midY = rect.top + rect.height / 2
      if (touch.clientY < midY) {
        targetIndex = i
        break
      }
      targetIndex = i
    }

    // Live reorder preview
    if (targetIndex !== touchDragIndex.current) {
      setFiles(prev => {
        const newFiles = [...prev]
        const draggedFile = newFiles[touchDragIndex.current]
        newFiles.splice(touchDragIndex.current, 1)
        newFiles.splice(targetIndex, 0, draggedFile)
        touchDragIndex.current = targetIndex

        // Re-snapshot rects after reorder
        requestAnimationFrame(() => {
          if (listRef.current) {
            const items = listRef.current.querySelectorAll('[data-file-item]')
            itemRectsRef.current = Array.from(items).map(el => el.getBoundingClientRect())
          }
        })

        return newFiles
      })
    }
  }

  const handleTouchEnd = (e) => {
    // Remove clone
    if (touchCloneRef.current) {
      document.body.removeChild(touchCloneRef.current)
      touchCloneRef.current = null
    }

    // Restore opacity on all items
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('[data-file-item]')
      items.forEach(el => { el.style.opacity = '' })
    }

    touchDragIndex.current = null
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
        headers: { 'Content-Type': 'multipart/form-data' },
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
            <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>
              Arrastra tus PDFs aquí
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', margin: 0 }}>
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
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>
                {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={() => setFiles([])}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,100,100,.7)', cursor: 'pointer',
                  fontSize: 13, padding: 0,
                }}
              >
                Limpiar todo
              </button>
            </div>

            <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {files.map((fileObj, index) => (
                <div
                  key={fileObj.id}
                  data-file-item
                  draggable
                  onDragStart={(e) => handleMouseDragStart(e, index)}
                  onDragOver={handleMouseDragOver}
                  onDrop={(e) => handleMouseDropOnItem(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="file-card"
                  style={{
                    background: 'rgba(255,255,255,.08)',
                    border: `1px solid ${draggedIndex === index ? 'rgba(110,231,183,.5)' : 'rgba(255,255,255,.1)'}`,
                    borderRadius: 8,
                    padding: 12,
                    transition: 'all .2s ease',
                    opacity: draggedIndex === index ? 0.5 : 1,
                    boxSizing: 'border-box',
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    cursor: 'grab',
                  }}
                >
                  {/* Desktop layout */}
                  <div className="file-card-desktop" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    height: 56,
                  }}>

                    <FileThumbnail file={fileObj.file} size={56} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 500, color: '#fff',
                        margin: '0 0 4px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {fileObj.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', margin: 0 }}>
                        {formatFileSize(fileObj.size)}
                      </p>
                    </div>

                    <div style={{
                      background: 'rgba(110,231,183,.2)', color: '#6ee7b7',
                      padding: '4px 10px', borderRadius: 4,
                      fontSize: 12, fontWeight: 600,
                      minWidth: 28, textAlign: 'center', flexShrink: 0,
                    }}>
                      #{index + 1}
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => moveFile(index, 'up')} disabled={index === 0} style={chevronBtnStyle(index === 0)}>
                        <ChevronUp size={16} />
                      </button>
                      <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} style={chevronBtnStyle(index === files.length - 1)}>
                        <ChevronDown size={16} />
                      </button>
                      <button onClick={() => requestRemoveFile(fileObj)} style={deleteBtnStyle}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile layout */}
                  <div className="file-card-mobile" style={{ display: 'none' }}>
                    {/* Top row: handle + thumbnail + name */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>

                      <FileThumbnail file={fileObj.file} size={48} />

                      {/* Name + size, full width */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 13, fontWeight: 500, color: '#fff',
                          margin: '0 0 3px',
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {fileObj.name}
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', margin: 0 }}>
                          {formatFileSize(fileObj.size)}
                        </p>
                      </div>
                    </div>

                    {/* Bottom row: order badge + arrow controls + delete */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid rgba(255,255,255,.07)',
                    }}>
                      <div style={{
                        background: 'rgba(110,231,183,.2)', color: '#6ee7b7',
                        padding: '3px 10px', borderRadius: 4,
                        fontSize: 12, fontWeight: 600,
                      }}>
                        #{index + 1}
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => moveFile(index, 'up')} disabled={index === 0} style={chevronBtnStyle(index === 0)}>
                          <ChevronUp size={16} />
                        </button>
                        <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} style={chevronBtnStyle(index === files.length - 1)}>
                          <ChevronDown size={16} />
                        </button>
                        <button onClick={() => requestRemoveFile(fileObj)} style={deleteBtnStyle}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length >= 2 && (
          <Button onClick={handleMerge} loading={loading} icon={Download} sticky>
            Unir {files.length} PDFs
          </Button>
        )}

        {/* Modal confirmación de eliminación */}
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
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          @keyframes slideUp { from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

          @media (max-width: 600px) {
            .file-card-desktop { display: none !important; }
            .file-card-mobile { display: block !important; }
          }
        `}</style>
      </div>
    </div>
  )
}

// Shared button styles extracted for brevity
const chevronBtnStyle = (disabled) => ({
  background: 'rgba(255,255,255,.1)',
  border: '1px solid rgba(255,255,255,.2)',
  color: disabled ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.7)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  padding: 6,
  borderRadius: 4,
  transition: 'all .2s ease',
  display: 'flex',
})

const deleteBtnStyle = {
  background: 'rgba(239,68,68,.1)',
  border: '1px solid rgba(239,68,68,.2)',
  color: 'rgba(239,68,68,.7)',
  cursor: 'pointer',
  padding: 6,
  borderRadius: 4,
  transition: 'all .2s ease',
  display: 'flex',
}