import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download, Trash2, FileText, Archive,
  AlertCircle, LayoutGrid, LayoutList, Star, Search, X,
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const DOCS_API = `${import.meta.env.VITE_API_URL}/api/documents`

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

const TOOL_FILTERS = [
  { value: 'all',      label: 'Todos' },
  { value: 'merge',    label: 'Unir' },
  { value: 'split',    label: 'Separar' },
  { value: 'compress', label: 'Comprimir' },
  { value: 'convert',  label: 'Convertir' },
]

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

/* ── Thumbnail ── */
function Thumbnail({ doc, size = 'list' }) {
  const [src, setSrc]       = useState(null)
  const [failed, setFailed] = useState(false)
  const isZip  = doc.mime_type === 'application/zip'
  const color  = TOOL_COLORS[doc.tool] || '#fff'
  const isGrid = size === 'grid'
  const w = isGrid ? '100%' : 48
  const h = isGrid ? 160 : 48
  const radius   = isGrid ? '8px 8px 0 0' : 8
  const iconSize = isGrid ? 32 : 20

  useEffect(() => {
    if (!doc.has_thumbnail || isZip) return
    const token = localStorage.getItem('neatpdf_token')
    let objectUrl = null
    fetch(`${DOCS_API}/${doc.id}/thumbnail`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.blob() })
      .then(blob => { objectUrl = URL.createObjectURL(blob); setSrc(objectUrl) })
      .catch(() => setFailed(true))
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [doc.id, doc.has_thumbnail])

  if (src && !failed) {
    return (
      <div style={{ width: w, height: h, borderRadius: radius, overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
        <img src={src} alt="portada" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
    )
  }

  return (
    <div style={{
      width: w, height: h, borderRadius: radius, flexShrink: 0,
      background: `${color}10`, border: `1px solid ${color}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {isZip ? <Archive size={iconSize} color={color} /> : <FileText size={iconSize} color={color} />}
    </div>
  )
}

/* ── Grid card ── */
function GridCard({ doc, onDownload, onDelete, onToggleFavorite, deleting }) {
  const color = TOOL_COLORS[doc.tool] || '#fff'
  return (
    <div
      style={{
        background: 'rgba(255,255,255,.04)',
        border: `1px solid ${doc.is_favorite ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.08)'}`,
        borderRadius: 12, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'border-color .2s, transform .2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.45)' : 'rgba(255,255,255,.16)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';  e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.08)' }}
    >
      <div style={{ position: 'relative' }}>
        <Thumbnail doc={doc} size="grid" />
        <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, color, background: 'rgba(0,0,0,.65)', border: `1px solid ${color}40`, borderRadius: 100, padding: '2px 8px', backdropFilter: 'blur(4px)' }}>
          {TOOL_LABELS[doc.tool] || doc.tool}
        </span>
        <button
          onClick={() => onToggleFavorite(doc)}
          style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,.55)', border: `1px solid ${doc.is_favorite ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,.2)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,.6)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,.55)'; e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.5)' : 'rgba(255,255,255,.15)' }}
        >
          <Star size={13} color={doc.is_favorite ? '#fbbf24' : 'rgba(255,255,255,.5)'} fill={doc.is_favorite ? '#fbbf24' : 'none'} />
        </button>
      </div>
      <div style={{ padding: '12px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {doc.filename}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', margin: 0 }}>
          {formatSize(doc.file_size)} · {formatDate(doc.created_at)}
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 4 }}>
          <button
            onClick={() => onDownload(doc)}
            style={{ flex: 1, padding: '7px', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, transition: 'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.color = color }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}
          >
            <Download size={13} /> Descargar
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            disabled={deleting === doc.id}
            style={{ width: 34, padding: '7px', borderRadius: 8, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.15)', color: 'rgba(239,68,68,.55)', cursor: deleting === doc.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s', opacity: deleting === doc.id ? 0.5 : 1 }}
            onMouseEnter={e => { if (deleting !== doc.id) { e.currentTarget.style.background = 'rgba(239,68,68,.15)'; e.currentTarget.style.color = '#fca5a5' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.07)'; e.currentTarget.style.color = 'rgba(239,68,68,.55)' }}
          >
            {deleting === doc.id
              ? <div style={{ width: 12, height: 12, border: '2px solid rgba(239,68,68,.3)', borderTop: '2px solid #fca5a5', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              : <Trash2 size={13} />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── List row ── */
function ListRow({ doc, onDownload, onDelete, onToggleFavorite, deleting }) {
  const color = TOOL_COLORS[doc.tool] || '#fff'
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,.04)', border: `1px solid ${doc.is_favorite ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.08)'}`, borderRadius: 12, padding: '12px 14px', transition: 'border-color .2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.45)' : 'rgba(255,255,255,.14)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.08)'}
    >
      <Thumbnail doc={doc} size="list" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.filename}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}14`, border: `1px solid ${color}30`, borderRadius: 100, padding: '2px 8px' }}>{TOOL_LABELS[doc.tool] || doc.tool}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{formatSize(doc.file_size)}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>{formatDate(doc.created_at)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
        <button
          onClick={() => onToggleFavorite(doc)}
          style={{ width: 34, height: 34, borderRadius: 8, background: doc.is_favorite ? 'rgba(251,191,36,.1)' : 'rgba(255,255,255,.05)', border: `1px solid ${doc.is_favorite ? 'rgba(251,191,36,.35)' : 'rgba(255,255,255,.1)'}`, color: doc.is_favorite ? '#fbbf24' : 'rgba(255,255,255,.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,.18)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,.5)'; e.currentTarget.style.color = '#fbbf24' }}
          onMouseLeave={e => { e.currentTarget.style.background = doc.is_favorite ? 'rgba(251,191,36,.1)' : 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = doc.is_favorite ? 'rgba(251,191,36,.35)' : 'rgba(255,255,255,.1)'; e.currentTarget.style.color = doc.is_favorite ? '#fbbf24' : 'rgba(255,255,255,.35)' }}
        >
          <Star size={15} fill={doc.is_favorite ? '#fbbf24' : 'none'} />
        </button>
        <button
          onClick={() => onDownload(doc)}
          style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s' }}
          onMouseEnter={e => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.color = color }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}
        >
          <Download size={15} />
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          disabled={deleting === doc.id}
          style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.15)', color: 'rgba(239,68,68,.55)', cursor: deleting === doc.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s', opacity: deleting === doc.id ? 0.5 : 1 }}
          onMouseEnter={e => { if (deleting !== doc.id) { e.currentTarget.style.background = 'rgba(239,68,68,.15)'; e.currentTarget.style.color = '#fca5a5' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.07)'; e.currentTarget.style.color = 'rgba(239,68,68,.55)' }}
        >
          {deleting === doc.id
            ? <div style={{ width: 13, height: 13, border: '2px solid rgba(239,68,68,.3)', borderTop: '2px solid #fca5a5', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            : <Trash2 size={15} />}
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
  const [deleting, setDeleting]       = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // doc a eliminar o null
  const [view, setView]               = useState('list')
  const [search, setSearch]       = useState('')
  const [toolFilter, setToolFilter] = useState('all')

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
      setLoading(false)
    }
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

  const handleDelete = useCallback((id) => {
    const doc = documents.find(d => d.id === id)
    if (doc) setConfirmDelete(doc)
  }, [documents])

  const confirmDeleteDoc = useCallback(async () => {
    if (!confirmDelete) return
    const id = confirmDelete.id
    setConfirmDelete(null)
    setDeleting(id)
    try {
      await axios.delete(`${DOCS_API}/${id}`)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch {
      setError('No se pudo eliminar el documento')
    } finally {
      setDeleting(null)
    }
  }, [confirmDelete])

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

  // Filtrado en memoria — sin llamadas al backend
  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.filename.toLowerCase().includes(search.toLowerCase())
      const matchTool   = toolFilter === 'all' || doc.tool === toolFilter
      return matchSearch && matchTool
    })
  }, [documents, search, toolFilter])

  const favorites = filtered.filter(d => d.is_favorite)
  const rest      = filtered.filter(d => !d.is_favorite)
  const hasActive = search !== '' || toolFilter !== 'all'

  // Alturas del contenedor scrolleable
  const LIST_ROW_H  = 80   // px por fila (70px card + 10px gap)
  const GRID_CARD_H = 342  // px por fila de cards (160 thumb + 160 info + 14 gap + 8 extra)
  const scrollH = view === 'list' ? LIST_ROW_H * 5 : GRID_CARD_H * 2

  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }
  const listStyle = { display: 'flex', flexDirection: 'column', gap: 10 }

  const renderDoc = (doc) => view === 'grid'
    ? <GridCard key={doc.id} doc={doc} onDownload={handleDownload} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} deleting={deleting} />
    : <ListRow  key={doc.id} doc={doc} onDownload={handleDownload} onDelete={handleDelete} onToggleFavorite={handleToggleFavorite} deleting={deleting} />

  return (
    <div style={{ minHeight: '100vh', padding: 'clamp(1.5rem,4vw,2.5rem)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: '"Akt", sans-serif', fontWeight: 800, fontSize: 'clamp(28px,8vw,42px)', color: '#fff', marginBottom: 6, letterSpacing: '-1px' }}>
              Mis documentos
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)', margin: 0 }}>
              {filtered.length} de {documents.length} archivo{documents.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Toggle vista */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: 4, gap: 4 }}>
            {[
              { id: 'list', Icon: LayoutList, label: 'Lista' },
              { id: 'grid', Icon: LayoutGrid, label: 'Grid'  },
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                title={label}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', background: view === id ? 'rgba(167,139,250,.2)' : 'transparent', color: view === id ? '#c4b5fd' : 'rgba(255,255,255,.35)', cursor: 'pointer', fontSize: 13, fontWeight: view === id ? 600 : 400, transition: 'all .18s' }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Búsqueda + filtros ── */}
        <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* barra de búsqueda */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.3)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 40px 10px 38px',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10, color: '#fff', fontSize: 14,
                outline: 'none', transition: 'border-color .18s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', cursor: 'pointer', display: 'flex', padding: 2 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* pills de herramienta */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TOOL_FILTERS.map(({ value, label }) => {
              const active = toolFilter === value
              const color  = TOOL_COLORS[value] || '#c4b5fd'
              return (
                <button
                  key={value}
                  onClick={() => setToolFilter(value)}
                  style={{
                    padding: '5px 14px', borderRadius: 100, border: 'none',
                    background: active
                      ? (value === 'all' ? 'rgba(167,139,250,.2)' : `${color}20`)
                      : 'rgba(255,255,255,.05)',
                    color: active
                      ? (value === 'all' ? '#c4b5fd' : color)
                      : 'rgba(255,255,255,.4)',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    cursor: 'pointer', transition: 'all .18s',
                    border: `1px solid ${active ? (value === 'all' ? 'rgba(167,139,250,.35)' : `${color}40`) : 'rgba(255,255,255,.08)'}`,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', borderRadius: 9, padding: '11px 14px', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, margin: '0 auto 16px', border: '3px solid rgba(255,255,255,.1)', borderTop: '3px solid #c4b5fd', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 14 }}>Cargando documentos...</p>
          </div>
        )}

        {/* ── Empty total ── */}
        {!loading && documents.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,.02)', border: '1px dashed rgba(255,255,255,.08)', borderRadius: 16 }}>
            <FileText size={48} style={{ color: 'rgba(255,255,255,.15)', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Aún no tienes documentos guardados</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.25)' }}>Usa cualquier herramienta con sesión iniciada y tus archivos aparecerán aquí.</p>
          </div>
        )}

        {/* ── Sin resultados de búsqueda ── */}
        {!loading && documents.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,.02)', border: '1px dashed rgba(255,255,255,.08)', borderRadius: 16 }}>
            <Search size={36} style={{ color: 'rgba(255,255,255,.15)', margin: '0 auto 14px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>Sin resultados</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.25)' }}>
              Intenta con otro nombre o cambia el filtro de herramienta.
            </p>
            <button
              onClick={() => { setSearch(''); setToolFilter('all') }}
              style={{ marginTop: 16, padding: '8px 20px', borderRadius: 100, background: 'rgba(167,139,250,.15)', border: '1px solid rgba(167,139,250,.3)', color: '#c4b5fd', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .18s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(167,139,250,.15)'}
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* ── Contenido con scroll ── */}
        {!loading && filtered.length > 0 && (
          <div
            style={{
              maxHeight: scrollH,
              overflowY: 'auto',
              paddingRight: 4,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(167,139,250,.3) transparent',
            }}
          >
            {/* Favoritos */}
            {favorites.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Star size={13} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    Favoritos · {favorites.length}
                  </span>
                </div>
                <div style={view === 'grid' ? gridStyle : listStyle}>
                  {favorites.map(renderDoc)}
                </div>
              </div>
            )}

            {/* Recientes */}
            {rest.length > 0 && (
              <div>
                {favorites.length > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                    {hasActive ? `Resultados · ${rest.length}` : `Recientes · ${rest.length}`}
                  </span>
                )}
                <div style={view === 'grid' ? gridStyle : listStyle}>
                  {rest.map(renderDoc)}
                </div>
              </div>
            )}
          </div>
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
              {/* ícono */}
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
                ¿Eliminar documento?
              </h3>

              <p style={{
                fontSize: 13, color: 'rgba(255,255,255,.45)',
                textAlign: 'center', margin: '0 0 6px', lineHeight: 1.5,
              }}>
                Estás a punto de eliminar
              </p>
              <p style={{
                fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.75)',
                textAlign: 'center', margin: '0 0 24px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,.05)',
                borderRadius: 8,
                wordBreak: 'break-all',
              }}>
                {confirmDelete.filename}
              </p>

              <p style={{
                fontSize: 12, color: 'rgba(239,68,68,.6)',
                textAlign: 'center', margin: '0 0 24px',
              }}>
                Esta acción no se puede deshacer.
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
                  onClick={confirmDeleteDoc}
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
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes slideUp { from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
          input::placeholder { color: rgba(255,255,255,.25); }
        `}</style>
      </div>
    </div>
  )
}