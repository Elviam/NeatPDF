import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download, Trash2, FileText, Archive,
  AlertCircle, LayoutGrid, LayoutList, Star,
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const DOCS_API = 'http://localhost:8000/api/documents'

const TOOL_LABELS = {
  merge:    'Unir PDF',
  split:    'Separar PDF',
  compress: 'Comprimir PDF',
  convert:  'PDF a Imagen',
}

const TOOL_COLORS = {
  merge:    '#6ee7b7',
  split:    '#93c5fd',
  compress: '#d8b4fe',
  convert:  '#a5f3fc',
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const s = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + s[i]
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ── Thumbnail con lazy load ── */
function Thumbnail({ doc, size = 'list' }) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)
  const isZip = doc.mime_type === 'application/zip'
  const color = TOOL_COLORS[doc.tool] || '#fff'

  useEffect(() => {
    if (!doc.has_thumbnail || isZip) return
    const token = localStorage.getItem('neatpdf_token')
    fetch(`${DOCS_API}/${doc.id}/thumbnail`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.blob() })
      .then(blob => setSrc(URL.createObjectURL(blob)))
      .catch(() => setFailed(true))
    return () => { if (src) URL.revokeObjectURL(src) }
  }, [doc.id, doc.has_thumbnail])

  const isGrid = size === 'grid'
  const w = isGrid ? '100%' : 48
  const h = isGrid ? 160 : 48
  const radius = isGrid ? '8px 8px 0 0' : 8
  const iconSize = isGrid ? 32 : 20

  if (src && !failed) {
    return (
      <div style={{
        width: w, height: h, borderRadius: radius,
        overflow: 'hidden', flexShrink: 0, background: '#fff',
      }}>
        <img
          src={src} alt="portada"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: w, height: h, borderRadius: radius, flexShrink: 0,
      background: `${color}10`,
      border: `1px solid ${color}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {isZip
        ? <Archive size={iconSize} color={color} />
        : <FileText size={iconSize} color={color} />
      }
    </div>
  )
}

/* ── Tarjeta en vista grid ── */
function GridCard({ doc, onDownload, onDelete, onToggleFavorite, deleting }) {
  const color = TOOL_COLORS[doc.tool] || '#fff'

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)',
      border: `1px solid ${doc.is_favorite ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.08)'}`,
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'border-color .2s, transform .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.45)' : 'rgba(255,255,255,.16)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.08)' }}
    >
      {/* thumbnail */}
      <div style={{ position: 'relative' }}>
        <Thumbnail doc={doc} size="grid" />

        {/* badge herramienta */}
        <span style={{
          position: 'absolute', top: 8, left: 8,
          fontSize: 10, fontWeight: 700, color,
          background: `rgba(0,0,0,.65)`,
          border: `1px solid ${color}40`,
          borderRadius: 100, padding: '2px 8px',
          backdropFilter: 'blur(4px)',
        }}>
          {TOOL_LABELS[doc.tool] || doc.tool}
        </span>

        {/* estrella favorito */}
        <button
          onClick={() => onToggleFavorite(doc)}
          title={doc.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(0,0,0,.55)',
            border: `1px solid ${doc.is_favorite ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,.2)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,.6)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,.55)'; e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.15)' }}
        >
          <Star
            size={13}
            color={doc.is_favorite ? '#fbbf24' : 'rgba(255,255,255,.5)'}
            fill={doc.is_favorite ? '#fbbf24' : 'none'}
          />
        </button>
      </div>

      {/* info */}
      <div style={{ padding: '12px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{
          fontSize: 13, fontWeight: 500, color: '#fff',
          margin: 0, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {doc.filename}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', margin: 0 }}>
          {formatSize(doc.file_size)} · {formatDate(doc.created_at)}
        </p>

        {/* acciones */}
        <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 4 }}>
          <button
            onClick={() => onDownload(doc)}
            style={{
              flex: 1, padding: '7px', borderRadius: 8,
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)',
              color: 'rgba(255,255,255,.55)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 5,
              fontSize: 12, transition: 'all .18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.color = color }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}
          >
            <Download size={13} /> Descargar
          </button>

          <button
            onClick={() => onDelete(doc.id)}
            disabled={deleting === doc.id}
            style={{
              width: 34, padding: '7px', borderRadius: 8,
              background: 'rgba(239,68,68,.07)',
              border: '1px solid rgba(239,68,68,.15)',
              color: 'rgba(239,68,68,.55)',
              cursor: deleting === doc.id ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .18s', opacity: deleting === doc.id ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (deleting !== doc.id) { e.currentTarget.style.background = 'rgba(239,68,68,.15)'; e.currentTarget.style.color = '#fca5a5' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.07)'; e.currentTarget.style.color = 'rgba(239,68,68,.55)' }}
          >
            {deleting === doc.id
              ? <div style={{ width: 12, height: 12, border: '2px solid rgba(239,68,68,.3)', borderTop: '2px solid #fca5a5', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              : <Trash2 size={13} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Fila en vista lista ── */
function ListRow({ doc, onDownload, onDelete, onToggleFavorite, deleting }) {
  const color = TOOL_COLORS[doc.tool] || '#fff'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'rgba(255,255,255,.04)',
      border: `1px solid ${doc.is_favorite ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.08)'}`,
      borderRadius: 12, padding: '12px 14px',
      transition: 'border-color .2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.45)' : 'rgba(255,255,255,.14)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.08)'}
    >
      <Thumbnail doc={doc} size="list" />

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 500, color: '#fff',
          margin: '0 0 4px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {doc.filename}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color,
            background: `${color}14`, border: `1px solid ${color}30`,
            borderRadius: 100, padding: '2px 8px',
          }}>
            {TOOL_LABELS[doc.tool] || doc.tool}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{formatSize(doc.file_size)}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>{formatDate(doc.created_at)}</span>
        </div>
      </div>

      {/* acciones */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        {/* favorito */}
        <button
          onClick={() => onToggleFavorite(doc)}
          title={doc.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: doc.is_favorite ? 'rgba(251,191,36,.1)' : 'rgba(255,255,255,.05)',
            border: `1px solid ${doc.is_favorite ? 'rgba(251,191,36,.35)' : 'rgba(255,255,255,.1)'}`,
            color: doc.is_favorite ? '#fbbf24' : 'rgba(255,255,255,.35)',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,.18)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,.5)'; e.currentTarget.style.color = '#fbbf24' }}
          onMouseLeave={e => { e.currentTarget.style.background = doc.is_favorite ? 'rgba(251,191,36,.1)' : 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.35)' : 'rgba(255,255,255,.1)'; e.currentTarget.style.color = doc.is_favorite ? '#fbbf24' : 'rgba(255,255,255,.35)' }}
        >
          <Star size={15} fill={doc.is_favorite ? '#fbbf24' : 'none'} />
        </button>

        {/* descargar */}
        <button
          onClick={() => onDownload(doc)}
          title="Descargar"
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.1)',
            color: 'rgba(255,255,255,.55)',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.color = color }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}
        >
          <Download size={15} />
        </button>

        {/* eliminar */}
        <button
          onClick={() => onDelete(doc.id)}
          disabled={deleting === doc.id}
          title="Eliminar"
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'rgba(239,68,68,.07)',
            border: '1px solid rgba(239,68,68,.15)',
            color: 'rgba(239,68,68,.55)',
            cursor: deleting === doc.id ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .18s', opacity: deleting === doc.id ? 0.5 : 1,
          }}
          onMouseEnter={e => { if (deleting !== doc.id) { e.currentTarget.style.background = 'rgba(239,68,68,.15)'; e.currentTarget.style.color = '#fca5a5' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.07)'; e.currentTarget.style.color = 'rgba(239,68,68,.55)' }}
        >
          {deleting === doc.id
            ? <div style={{ width: 13, height: 13, border: '2px solid rgba(239,68,68,.3)', borderTop: '2px solid #fca5a5', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            : <Trash2 size={15} />
          }
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════ */
export default function MyDocuments() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [documents, setDocuments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [deleting, setDeleting]   = useState(null)
  const [view, setView]           = useState('list') // 'list' | 'grid'

  useEffect(() => {
    if (!user) { navigate('/'); return }
    fetchDocuments()
  }, [user])

  const fetchDocuments = async () => {
    setLoading(true); setError('')
    try {
      const res = await axios.get(DOCS_API)
      setDocuments(res.data)
    } catch {
      setError('No se pudieron cargar los documentos')
    } finally {
      setLoading(false) }
  }

  const handleDownload = useCallback((doc) => {
    const token = localStorage.getItem('neatpdf_token')
    fetch(`${DOCS_API}/${doc.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.setAttribute('download', doc.filename)
        document.body.appendChild(a); a.click(); a.remove()
        window.URL.revokeObjectURL(url)
      })
  }, [])

  const handleDelete = useCallback(async (id) => {
    setDeleting(id)
    try {
      await axios.delete(`${DOCS_API}/${id}`)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch {
      setError('No se pudo eliminar el documento')
    } finally {
      setDeleting(null)
    }
  }, [])

  const handleToggleFavorite = useCallback(async (doc) => {
    try {
      const res = await axios.patch(`${DOCS_API}/${doc.id}/favorite`)
      setDocuments(prev =>
        prev
          .map(d => d.id === doc.id ? { ...d, is_favorite: res.data.is_favorite } : d)
          .sort((a, b) => b.is_favorite - a.is_favorite || new Date(b.created_at) - new Date(a.created_at))
      )
    } catch {
      setError('No se pudo actualizar favorito')
    }
  }, [])

  const favorites = documents.filter(d => d.is_favorite)
  const rest      = documents.filter(d => !d.is_favorite)

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 14,
  }
  const listStyle = { display: 'flex', flexDirection: 'column', gap: 10 }

  const renderDoc = (doc) => view === 'grid'
    ? <GridCard key={doc.id} doc={doc} onDownload={handleDownload} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} deleting={deleting} />
    : <ListRow  key={doc.id} doc={doc} onDownload={handleDownload} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} deleting={deleting} />

  return (
    <div style={{ minHeight: '100vh', padding: 'clamp(1.5rem,4vw,2.5rem)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 14, marginBottom: 28, padding: 0, display: 'flex', alignItems: 'center', gap: 4, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}
        >← Volver</button>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: '"Akt", sans-serif', fontWeight: 800, fontSize: 'clamp(28px,8vw,42px)', color: '#fff', marginBottom: 6, letterSpacing: '-1px' }}>
              Mis documentos
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', margin: 0 }}>
              {documents.length} archivo{documents.length !== 1 ? 's' : ''} guardado{documents.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Toggle vista */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: 4, gap: 4 }}>
            {[
              { id: 'list', Icon: LayoutList,  label: 'Lista' },
              { id: 'grid', Icon: LayoutGrid,  label: 'Grid'  },
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                title={label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 7, border: 'none',
                  background: view === id ? 'rgba(167,139,250,.2)' : 'transparent',
                  color: view === id ? '#c4b5fd' : 'rgba(255,255,255,.35)',
                  cursor: 'pointer', fontSize: 13, fontWeight: view === id ? 600 : 400,
                  transition: 'all .18s',
                }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', borderRadius: 9, padding: '11px 14px', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, margin: '0 auto 16px', border: '3px solid rgba(255,255,255,.1)', borderTop: '3px solid #c4b5fd', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 14 }}>Cargando documentos...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && documents.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,.02)', border: '1px dashed rgba(255,255,255,.08)', borderRadius: 16 }}>
            <FileText size={48} style={{ color: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Aún no tienes documentos guardados</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.25)' }}>Usa cualquier herramienta con sesión iniciada y tus archivos aparecerán aquí.</p>
          </div>
        )}

        {/* Favoritos */}
        {!loading && favorites.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                Favoritos · {favorites.length}
              </span>
            </div>
            <div style={view === 'grid' ? gridStyle : listStyle}>
              {favorites.map(renderDoc)}
            </div>
          </div>
        )}

        {/* Resto */}
        {!loading && rest.length > 0 && (
          <div>
            {favorites.length > 0 && (
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
                Recientes · {rest.length}
              </span>
            )}
            <div style={view === 'grid' ? gridStyle : listStyle}>
              {rest.map(renderDoc)}
            </div>
          </div>
        )}

        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </div>
  )
}