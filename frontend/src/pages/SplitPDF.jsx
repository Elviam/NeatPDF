import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Upload, X, Download, AlertCircle, Plus, Check, CheckSquare, Square } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const SPLIT_ALL_API   = 'http://localhost:8000/api/split/all'
const SPLIT_RANGE_API = 'http://localhost:8000/api/split/range'
const MERGE_API = 'http://localhost:8000/api/merge/'

/* paleta de colores por índice de rango */
const RANGE_COLORS = [
  { line: '#93c5fd', bg: 'rgba(147,197,253,.07)', border: 'rgba(147,197,253,.22)' },
  { line: '#c4b5fd', bg: 'rgba(196,181,253,.07)', border: 'rgba(196,181,253,.22)' },
  { line: '#6ee7b7', bg: 'rgba(110,231,183,.07)', border: 'rgba(110,231,183,.22)' },
  { line: '#fda4af', bg: 'rgba(253,164,175,.07)', border: 'rgba(253,164,175,.22)' },
  { line: '#fcd34d', bg: 'rgba(252,211,77,.07)',  border: 'rgba(252,211,77,.22)'  },
]
const colorOf = (i) => RANGE_COLORS[i % RANGE_COLORS.length]

let _id = 0
const newRange = (start = 1, end = 1) => ({ id: ++_id, start, end })

/* ══════════════════════════════════════════════
   CANVAS BASE — renderiza una página del PDF
══════════════════════════════════════════════ */
function PdfPageCanvas({ pdfDoc, pageNum, width = 120 }) {
  const canvasRef  = useRef(null)
  const renderTask = useRef(null)

  useEffect(() => {
    if (!pdfDoc || !pageNum) return
    let cancelled = false

    const render = async () => {
      try {
        if (renderTask.current) { try { renderTask.current.cancel() } catch (_) {} }
        const page = await pdfDoc.getPage(pageNum)
        if (cancelled) return
        const canvas = canvasRef.current
        if (!canvas) return
        const vp0   = page.getViewport({ scale: 1 })
        const scale = width / vp0.width
        const vp    = page.getViewport({ scale })
        canvas.width  = vp.width
        canvas.height = vp.height
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        renderTask.current = page.render({ canvasContext: ctx, viewport: vp })
        await renderTask.current.promise
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') console.warn(err)
      }
    }
    render()
    return () => { cancelled = true }
  }, [pdfDoc, pageNum, width])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
}

/* ══════════════════════════════════════════════
   PAGE PREVIEW — usado en tarjetas de rango
══════════════════════════════════════════════ */
function PagePreview({ pdfDoc, pageNum, accent = '#93c5fd' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 120, background: '#fff', borderRadius: 5, overflow: 'hidden', lineHeight: 0,
        boxShadow: `0 3px 16px rgba(0,0,0,.55), 0 0 0 1.5px ${accent}55`,
      }}>
        <PdfPageCanvas pdfDoc={pdfDoc} pageNum={pageNum} width={120} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: '.05em' }}>p. {pageNum}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PAGE STEPPER
══════════════════════════════════════════════ */
function PageStepper({ value, min, max, onChange, accent }) {
  const dec = value <= min
  const inc = value >= max
  const btn = (disabled) => ({
    width: 30, height: 30, borderRadius: 7,
    background: disabled ? 'rgba(255,255,255,.05)' : `${accent}22`,
    border: `1px solid ${disabled ? 'rgba(255,255,255,.07)' : accent + '55'}`,
    color: disabled ? 'rgba(255,255,255,.18)' : accent,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 17, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .15s', flexShrink: 0, lineHeight: 1,
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={dec} style={btn(dec)}>−</button>
      <input
        type="number" value={value}
        onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v))) }}
        style={{ width: 46, padding: '5px 4px', background: 'rgba(255,255,255,.05)', border: `1px solid ${accent}44`, borderRadius: 7, color: '#fff', fontSize: 14, fontWeight: 700, textAlign: 'center', outline: 'none' }}
      />
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={inc} style={btn(inc)}>+</button>
    </div>
  )
}

/* ══════════════════════════════════════════════
   TIMELINE — segmentos de rangos sobre la línea del PDF
══════════════════════════════════════════════ */
function RangeTimeline({ ranges, totalPages }) {
  if (!totalPages) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.05em' }}>p. 1</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.05em' }}>p. {totalPages}</span>
      </div>
      <div style={{ position: 'relative', height: 14, borderRadius: 5, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
        {ranges.map((r, i) => {
          const left  = ((r.start - 1) / totalPages) * 100
          const width = ((r.end - r.start + 1) / totalPages) * 100
          const c     = colorOf(i)
          return (
            <div key={r.id} style={{
              position: 'absolute',
              left: `${left}%`, width: `${width}%`,
              top: 0, bottom: 0,
              background: c.line,
              opacity: 0.6,
              mixBlendMode: 'screen',
              borderRadius: 3,
              transition: 'left .2s, width .2s',
            }}/>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
        {ranges.map((r, i) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: colorOf(i).line, flexShrink: 0 }}/>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>
              R{i + 1}: {r.start}–{r.end} ({r.end - r.start + 1}p)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   RANGE CARD
══════════════════════════════════════════════ */
function RangeCard({ range, index, totalPages, pdfDoc, onChange, onRemove, canRemove, hasOverlap }) {
  const c = colorOf(index)
  const setStart = (v) => onChange({ ...range, start: Math.min(v, range.end) })
  const setEnd   = (v) => onChange({ ...range, end: Math.max(v, range.start) })

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: '18px 18px 20px',
      position: 'relative',
      transition: 'border-color .2s, background .2s',
    }}>
      {/* cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: c.line + '28', border: `1px solid ${c.line}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: c.line }}>{index + 1}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: c.line }}>Rango {index + 1}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginLeft: 8 }}>
              p. {range.start} – {range.end} · {range.end - range.start + 1}p
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {hasOverlap && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 600, color: '#fcd34d',
              background: 'rgba(252,211,77,.1)', border: '1px solid rgba(252,211,77,.25)',
              borderRadius: 100, padding: '3px 9px', whiteSpace: 'nowrap',
            }}>
              <AlertCircle size={11}/> se solapa
            </span>
          )}
          {canRemove && (
            <button
              onClick={onRemove}
              title="Eliminar rango"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: 'rgba(239,68,68,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.2)'; e.currentTarget.style.color = '#fca5a5' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.1)'; e.currentTarget.style.color = 'rgba(239,68,68,.6)' }}
            >
              <X size={13}/>
            </button>
          )}
        </div>
      </div>

      {/* columnas desde / hasta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${c.line}22`, borderRadius: 9, padding: '14px 12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: c.line + 'aa', alignSelf: 'flex-start' }}>Desde</span>
          {pdfDoc ? <PagePreview pdfDoc={pdfDoc} pageNum={range.start} accent={c.line}/> : <div style={{ width: 120, height: 85, background: 'rgba(255,255,255,.03)', borderRadius: 5 }}/>}
          <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: c.line, width: `${((range.start - 1) / Math.max(totalPages - 1, 1)) * 100}%`, transition: 'width .18s' }}/>
          </div>
          <PageStepper value={range.start} min={1} max={range.end} onChange={setStart} accent={c.line}/>
        </div>

        <div style={{ background: 'rgba(255,255,255,.03)', border: `1px solid ${c.line}22`, borderRadius: 9, padding: '14px 12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: c.line + 'aa', alignSelf: 'flex-start' }}>Hasta</span>
          {pdfDoc ? <PagePreview pdfDoc={pdfDoc} pageNum={range.end} accent={c.line}/> : <div style={{ width: 120, height: 85, background: 'rgba(255,255,255,.03)', borderRadius: 5 }}/>}
          <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: c.line, width: `${((range.end - 1) / Math.max(totalPages - 1, 1)) * 100}%`, transition: 'width .18s' }}/>
          </div>
          <PageStepper value={range.end} min={range.start} max={totalPages} onChange={setEnd} accent={c.line}/>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MINIATURA SELECCIONABLE — modo "páginas específicas"
══════════════════════════════════════════════ */
function SelectablePageThumb({ pdfDoc, pageNum, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(pageNum)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <div style={{
        position: 'relative', width: '100%', borderRadius: 6, overflow: 'hidden',
        background: '#fff', lineHeight: 0,
        boxShadow: selected
          ? '0 0 0 2.5px #93c5fd, 0 6px 18px rgba(147,197,253,.35)'
          : '0 2px 8px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06)',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow .15s, transform .15s, opacity .15s',
        opacity: selected ? 1 : 0.78,
      }}>
        <PdfPageCanvas pdfDoc={pdfDoc} pageNum={pageNum} width={100} />

        {/* overlay de selección */}
        <div style={{
          position: 'absolute', inset: 0,
          background: selected ? 'rgba(147,197,253,.16)' : 'transparent',
          transition: 'background .15s',
        }}/>

        {/* checkbox */}
        <div style={{
          position: 'absolute', top: 5, right: 5,
          width: 19, height: 19, borderRadius: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: selected ? '#93c5fd' : 'rgba(0,0,0,.35)',
          border: selected ? 'none' : '1.5px solid rgba(255,255,255,.5)',
          transition: 'all .15s',
        }}>
          {selected && <Check size={12} color="#0a0a0f" strokeWidth={3}/>}
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: selected ? '#93c5fd' : 'rgba(255,255,255,.4)', transition: 'color .15s' }}>
        {pageNum}
      </span>
    </button>
  )
}

/* ══════════════════════════════════════════════
   SPLIT PDF — componente principal
══════════════════════════════════════════════ */
export default function SplitPDF() {
  const navigate = useNavigate()

  const [file,          setFile]          = useState(null)
  const [dragActive,    setDragActive]    = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [success,       setSuccess]       = useState('')
  const [totalPages,    setTotalPages]    = useState(null)
  const [splitMode,     setSplitMode]     = useState('all') // 'all' | 'range' | 'pages'
  const [pdfDoc,        setPdfDoc]        = useState(null)
  const [ranges,        setRanges]        = useState([newRange(1, 1)])
  const [selectedPages, setSelectedPages] = useState(new Set())
  const [pagesOutputMode, setPagesOutputMode] = useState('merge') // 'merge' | 'separate'

  /* ── páginas que aparecen en más de un rango ── */
  const overlapInfo = useMemo(() => {
    if (ranges.length < 2) return []
    const pageMap = new Map() // page -> [rangeIndex(1-based)...]
    ranges.forEach((r, idx) => {
      for (let p = r.start; p <= r.end; p++) {
        if (!pageMap.has(p)) pageMap.set(p, [])
        pageMap.get(p).push(idx + 1)
      }
    })
    return [...pageMap.entries()]
      .filter(([, idxs]) => idxs.length > 1)
      .sort((a, b) => a[0] - b[0])
  }, [ranges])

  const overlappingRangeIdxs = useMemo(() => {
    const s = new Set()
    overlapInfo.forEach(([, idxs]) => idxs.forEach(i => s.add(i - 1)))
    return s
  }, [overlapInfo])

  const formatRangos = (idxs) => {
    if (idxs.length === 1) return `Rango ${idxs[0]}`
    if (idxs.length === 2) return `Rangos ${idxs[0]} y ${idxs[1]}`
    return `Rangos ${idxs.slice(0, -1).join(', ')} y ${idxs[idxs.length - 1]}`
  }

  /* ── cargar PDF ── */
  const addFile = useCallback((sel) => {
    if (!sel) return
    if (sel.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF'); setTimeout(() => setError(''), 3000); return
    }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target.result)
        const doc  = await pdfjsLib.getDocument({ data }).promise
        setPdfDoc(doc)
        setTotalPages(doc.numPages)
        setRanges([newRange(1, doc.numPages)])
        setSelectedPages(new Set())
        setFile({ id: Math.random(), file: sel, name: sel.name, size: sel.size })
      } catch (e) {
        console.error(e)
        setFile({ id: Math.random(), file: sel, name: sel.name, size: sel.size })
      }
    }
    reader.readAsArrayBuffer(sel)
  }, [])

  const removeFile = () => {
    setFile(null); setTotalPages(null); setPdfDoc(null)
    setRanges([newRange(1, 1)]); setSelectedPages(new Set())
    setError(''); setSuccess('')
  }

  /* ── drag & drop ── */
  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type !== 'dragleave') }
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); addFile(e.dataTransfer.files[0]) }

  /* ── rangos ── */
  const addRange = () => {
    const last = ranges[ranges.length - 1]
    const next = Math.min((last?.end ?? 0) + 1, totalPages ?? 1)
    setRanges(prev => [...prev, newRange(next, totalPages ?? next)])
  }
  const updateRange = (id, updated) => setRanges(prev => prev.map(r => r.id === id ? updated : r))
  const removeRange = (id) => setRanges(prev => prev.filter(r => r.id !== id))

  /* ── selección de páginas ── */
  const togglePage = (p) => {
    setSelectedPages(prev => {
      const next = new Set(prev)
      next.has(p) ? next.delete(p) : next.add(p)
      return next
    })
  }
  const selectAllPages = () => setSelectedPages(new Set(Array.from({ length: totalPages }, (_, i) => i + 1)))
  const clearSelection = () => setSelectedPages(new Set())

  /* ── descarga helper ── */
  const triggerDownload = (data, name) => {
    const url = window.URL.createObjectURL(new Blob([data]))
    const a   = document.createElement('a')
    a.href    = url; a.setAttribute('download', name)
    document.body.appendChild(a); a.click(); a.remove()
    window.URL.revokeObjectURL(url)
  }

  const buildFD = () => { const fd = new FormData(); fd.append('file', file.file); return fd }

  /* empaqueta varios blobs en ZIP, con fallback secuencial */
  const downloadResults = async (results, fileNameFn, zipName, singleNameFn) => {
    if (results.length === 1) {
      triggerDownload(results[0].blob, singleNameFn(results[0]))
      return
    }
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      results.forEach((r, i) => zip.file(fileNameFn(r, i), r.blob))
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      triggerDownload(zipBlob, zipName)
    } catch {
      results.forEach((r, i) => setTimeout(() => triggerDownload(r.blob, fileNameFn(r, i)), i * 300))
    }
  }
  const mergeBlobs = async (results) => {
  const fd = new FormData()
  results.forEach((r, i) => {
    fd.append('files', new File([r.blob], `page_${i + 1}.pdf`, { type: 'application/pdf' }))
  })
  const res = await axios.post(MERGE_API, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  })
  return res.data
}

  /* ── split all ── */
  const handleSplitAll = async () => {
    if (!file) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await axios.post(SPLIT_ALL_API, buildFD(), { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob' })
      triggerDownload(res.data, 'split_pages.zip')
      setSuccess('✓ PDF separado exitosamente!')
      removeFile()
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al separar el PDF')
    } finally { setLoading(false) }
  }

  /* ── split por rangos (solapamientos permitidos) ── */
  const handleSplitRanges = async () => {
    if (!file) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const requests = ranges.map(r =>
        axios.post(SPLIT_RANGE_API, buildFD(), {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { start_page: r.start, end_page: r.end },
          responseType: 'blob',
        }).then(res => ({ range: r, blob: res.data }))
      )
      const results = await Promise.all(requests)

      await downloadResults(
        results,
        (r, i) => `rango_${i + 1}_p${r.range.start}-${r.range.end}.pdf`,
        'rangos_extraidos.zip',
        (r) => `paginas_${r.range.start}-${r.range.end}.pdf`,
      )

      setSuccess(results.length === 1
        ? `✓ Páginas ${results[0].range.start}–${results[0].range.end} extraídas exitosamente!`
        : `✓ ${results.length} rangos extraídos y empaquetados!`
      )
      removeFile()
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al extraer rangos')
    } finally { setLoading(false) }
  }

  /* ── split por páginas específicas ── */
 const handleExtractPages = async () => {
    if (!file || selectedPages.size === 0) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const sorted = [...selectedPages].sort((a, b) => a - b)
      const requests = sorted.map(p =>
        axios.post(SPLIT_RANGE_API, buildFD(), {
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { start_page: p, end_page: p },
          responseType: 'blob',
        }).then(res => ({ page: p, blob: res.data }))
      )
      const results = await Promise.all(requests)

      if (pagesOutputMode === 'merge' && results.length > 1) {
        const mergedBlob = await mergeBlobs(results)
        triggerDownload(mergedBlob, `${file.name.replace(/\.pdf$/i, '')}_combined_pages.pdf`)
        setSuccess(`✓ ${results.length} páginas combinadas en un solo PDF!`)
      } else {
        await downloadResults(
          results,
          (r) => `${file.name.replace(/\.pdf$/i, '')}_split_p${r.page}.pdf`,
          `${file.name.replace(/\.pdf$/i, '')}_split.zip`,
          (r) => `${file.name.replace(/\.pdf$/i, '')}_split_p${r.page}.pdf`,
        )
        setSuccess(`✓ ${results.length} página${results.length > 1 ? 's' : ''} extraída${results.length > 1 ? 's' : ''} exitosamente!`)
      }
      removeFile()
    } catch (e) {
      console.error(e)
      setError(e.response?.data?.detail || 'Error al extraer páginas')
    } finally { setLoading(false) }
  }
  const fmt = (b) => { if (!b) return '0 B'; const k = 1024, s = ['B', 'KB', 'MB']; const i = Math.floor(Math.log(b) / Math.log(k)); return Math.round(b / Math.pow(k, i) * 100) / 100 + ' ' + s[i] }

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div style={{ minHeight: '100vh', padding: 'clamp(1rem,4vw,2rem)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <h1 style={{ fontFamily: '"Akt",sans-serif', fontWeight: 800, fontSize: 'clamp(28px,8vw,42px)', color: '#fff', marginBottom: 8, letterSpacing: '-1px' }}>
          Separar PDF
        </h1>
        <p style={{ fontSize: 'clamp(14px,3.5vw,15px)', color: 'rgba(255,255,255,.55)', marginBottom: 28, lineHeight: 1.6 }}>
          Extrae páginas individuales, define rangos o elige exactamente qué páginas quieres.
        </p>

        {/* ── drop zone ── */}
        {!file ? (
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => document.getElementById('fi').click()}
            style={{ border: `2px dashed ${dragActive ? '#93c5fd' : 'rgba(255,255,255,.15)'}`, borderRadius: 12, padding: 'clamp(24px,8vw,48px)', textAlign: 'center', cursor: 'pointer', background: dragActive ? 'rgba(147,197,253,.06)' : 'rgba(255,255,255,.02)', transition: 'all .25s', marginBottom: 28 }}
          >
            <Upload size={44} style={{ color: dragActive ? '#93c5fd' : 'rgba(147,197,253,.5)', margin: '0 auto 14px' }}/>
            <p style={{ fontSize: 'clamp(14px,4vw,16px)', fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>Arrastra tu PDF aquí</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: 0 }}>o haz clic para seleccionar</p>
          </div>
        ) : (
          <>
            {/* file row */}
            <div style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: '10px 14px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', margin: 0 }}>{fmt(file.size)}{totalPages && ` · ${totalPages} páginas`}</p>
              </div>
              <button onClick={removeFile} style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: 'rgba(239,68,68,.65)', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', flexShrink: 0 }}>
                <X size={15}/>
              </button>
            </div>

            {/* mode selector — 3 opciones */}
            {totalPages !== 1 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: 10 }}>¿Cómo quieres separar?</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    ['all',   'Todas las páginas'],
                    ['range', 'Por rango'],
                    ['pages', 'Páginas específicas'],
                  ].map(([m, l]) => (
                    <button key={m} onClick={() => setSplitMode(m)} style={{
                      flex: '1 1 140px', padding: '11px 14px',
                      background: splitMode === m ? 'rgba(147,197,253,.15)' : 'rgba(255,255,255,.04)',
                      border: `1px solid ${splitMode === m ? 'rgba(147,197,253,.4)' : 'rgba(255,255,255,.09)'}`,
                      color: splitMode === m ? '#93c5fd' : 'rgba(255,255,255,.55)',
                      borderRadius: 9, cursor: 'pointer', fontWeight: splitMode === m ? 600 : 400,
                      fontSize: 14, transition: 'all .2s',
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            )}

            {/* single page notice */}
            {totalPages === 1 && (
              <div style={{ background: 'rgba(251,146,60,.08)', border: '1px solid rgba(251,146,60,.25)', borderRadius: 9, padding: 12, marginBottom: 22, textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#fed7aa', margin: 0, fontWeight: 500 }}>📄 Tu PDF solo tiene una página.</p>
              </div>
            )}

            {/* ════════════════════════════════════════
                MODO: POR RANGO
            ════════════════════════════════════════ */}
            {splitMode === 'range' && totalPages > 1 && (
              <div>
                <RangeTimeline ranges={ranges} totalPages={totalPages}/>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>
                      {ranges.length === 1 ? 'Rango seleccionado' : `${ranges.length} rangos definidos`}
                    </span>
                    {ranges.length > 1 && (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginLeft: 8 }}>
                        · {ranges.reduce((a, r) => a + (r.end - r.start + 1), 0)}p en total
                      </span>
                    )}
                  </div>

                  {ranges.length < 5 && (
                    <button
                      onClick={addRange}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: 'rgba(147,197,253,.1)', border: '1.5px dashed rgba(147,197,253,.4)', color: '#93c5fd', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(147,197,253,.18)'; e.currentTarget.style.borderColor = 'rgba(147,197,253,.7)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(147,197,253,.1)'; e.currentTarget.style.borderColor = 'rgba(147,197,253,.4)' }}
                    >
                      <Plus size={14} strokeWidth={2.5}/> Añadir rango
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                  {ranges.map((r, i) => (
                    <RangeCard
                      key={r.id}
                      range={r}
                      index={i}
                      totalPages={totalPages}
                      pdfDoc={pdfDoc}
                      onChange={(updated) => updateRange(r.id, updated)}
                      onRemove={() => removeRange(r.id)}
                      canRemove={ranges.length > 1}
                      hasOverlap={overlappingRangeIdxs.has(i)}
                    />
                  ))}
                </div>

                {ranges.length >= 2 && ranges.length < 5 && (
                  <button
                    onClick={addRange}
                    style={{ width: '100%', padding: '12px', background: 'transparent', border: '1.5px dashed rgba(255,255,255,.12)', borderRadius: 10, color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .2s', marginBottom: 18 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(147,197,253,.4)'; e.currentTarget.style.color = '#93c5fd'; e.currentTarget.style.background = 'rgba(147,197,253,.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = 'rgba(255,255,255,.3)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <Plus size={15} strokeWidth={2}/>
                    Añadir otro rango <span style={{ fontSize: 11, opacity: .6 }}>({5 - ranges.length} disponibles)</span>
                  </button>
                )}

                {ranges.length >= 5 && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', textAlign: 'center', margin: '0 0 18px' }}>
                    Máximo 5 rangos por extracción.
                  </p>
                )}

                {/* ── AVISO DE SOLAPAMIENTO (informativo, no bloquea) ── */}
                {overlapInfo.length > 0 && (
                  <div style={{
                    background: 'rgba(252,211,77,.07)', border: '1px solid rgba(252,211,77,.25)',
                    borderRadius: 10, padding: '12px 14px', marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                      <AlertCircle size={15} color="#fcd34d" style={{ flexShrink: 0 }}/>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fcd34d' }}>
                        Algunas páginas aparecerán en más de un archivo
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 22 }}>
                      {overlapInfo.map(([page, idxs]) => (
                        <span key={page} style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>
                          Página {page} → {formatRangos(idxs)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════
                MODO: PÁGINAS ESPECÍFICAS
            ════════════════════════════════════════ */}
            {splitMode === 'pages' && totalPages > 1 && (
              <div>
                {/* cabecera con contador y acciones */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>
                      {selectedPages.size === 0
                        ? 'Selecciona las páginas que quieres extraer'
                        : `${selectedPages.size} página${selectedPages.size > 1 ? 's' : ''} seleccionada${selectedPages.size > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={selectAllPages}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.55)', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#93c5fd'; e.currentTarget.style.borderColor = 'rgba(147,197,253,.35)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)' }}
                    >
                      <CheckSquare size={13}/> Todas
                    </button>
                    <button
                      onClick={clearSelection}
                      disabled={selectedPages.size === 0}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: selectedPages.size === 0 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.55)', cursor: selectedPages.size === 0 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500, transition: 'all .15s' }}
                      onMouseEnter={e => { if (selectedPages.size) { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,.3)' } }}
                      onMouseLeave={e => { e.currentTarget.style.color = selectedPages.size === 0 ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)' }}
                    >
                      <Square size={13}/> Limpiar
                    </button>
                  </div>
                </div>

                {/* galería de páginas */}
                <div style={{
                  background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 12, padding: 16, marginBottom: 20,
                  maxHeight: 460, overflowY: 'auto',
                }}>
                  {pdfDoc ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: 12 }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <SelectablePageThumb
                          key={p}
                          pdfDoc={pdfDoc}
                          pageNum={p}
                          selected={selectedPages.has(p)}
                          onToggle={togglePage}
                        />
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', textAlign: 'center', margin: '40px 0' }}>Cargando páginas…</p>
                  )}
                </div>

                {/* resumen de selección */}
                {selectedPages.size > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(147,197,253,.06)', border: '1px solid rgba(147,197,253,.18)', borderRadius: 9, padding: '10px 14px', marginBottom: 10, fontSize: 12, color: 'rgba(255,255,255,.5)', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#93c5fd', flexShrink: 0 }}>Páginas:</span>
                    <span>{[...selectedPages].sort((a, b) => a - b).join(', ')}</span>
                  </div>
                )}

                {/* selector de salida — solo si hay más de 1 página */}
                {selectedPages.size > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>Salida:</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        ['merge', 'Un solo PDF'],
                        ['separate', 'Archivos separados'],
                      ].map(([m, l]) => (
                        <button key={m} onClick={() => setPagesOutputMode(m)} style={{
                          padding: '6px 13px',
                          background: pagesOutputMode === m ? 'rgba(147,197,253,.15)' : 'rgba(255,255,255,.04)',
                          border: `1px solid ${pagesOutputMode === m ? 'rgba(147,197,253,.4)' : 'rgba(255,255,255,.09)'}`,
                          color: pagesOutputMode === m ? '#93c5fd' : 'rgba(255,255,255,.5)',
                          borderRadius: 100, cursor: 'pointer', fontWeight: pagesOutputMode === m ? 600 : 400,
                          fontSize: 12, transition: 'all .2s',
                        }}>{l}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* mensajes */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5', padding: '11px 14px', borderRadius: 9, marginBottom: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }}/>{error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(34,197,94,.09)', border: '1px solid rgba(34,197,94,.28)', color: '#86efac', padding: '11px 14px', borderRadius: 9, marginBottom: 20, fontSize: 13 }}>
            {success}
          </div>
        )}

        {/* ── botón de acción ── */}
        {file && (
          <>
            {splitMode === 'all' && (
              <button onClick={handleSplitAll} disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(147,197,253,.25)' : 'linear-gradient(135deg,#93c5fd,#60a5fa)',
                border: 'none', color: '#000', fontSize: 15, fontWeight: 700,
                borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1, transition: 'all .25s',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(147,197,253,.25)',
              }}>
                {loading ? <><Spinner/> Separando…</> : <><Download size={17}/>Separar todas las páginas</>}
              </button>
            )}

            {splitMode === 'range' && totalPages > 1 && (
              <button onClick={handleSplitRanges} disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(147,197,253,.25)' : 'linear-gradient(135deg,#93c5fd,#60a5fa)',
                border: 'none', color: '#000', fontSize: 15, fontWeight: 700,
                borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1, transition: 'all .25s',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(147,197,253,.25)',
              }}>
                {loading ? (
                  <><Spinner/> Extrayendo {ranges.length > 1 ? `${ranges.length} rangos` : ''}…</>
                ) : (
                  <><Download size={17}/>
                    {ranges.length === 1
                      ? `Extraer páginas ${ranges[0].start}–${ranges[0].end}`
                      : `Extraer ${ranges.length} rangos · ${ranges.reduce((a, r) => a + (r.end - r.start + 1), 0)}p`}
                  </>
                )}
              </button>
            )}

            {splitMode === 'pages' && totalPages > 1 && (
              <button onClick={handleExtractPages} disabled={loading || selectedPages.size === 0} style={{
                width: '100%', padding: '14px',
                background: (loading || selectedPages.size === 0) ? 'rgba(147,197,253,.15)' : 'linear-gradient(135deg,#93c5fd,#60a5fa)',
                border: 'none',
                color: (loading || selectedPages.size === 0) ? 'rgba(255,255,255,.35)' : '#000',
                fontSize: 15, fontWeight: 700,
                borderRadius: 10, cursor: (loading || selectedPages.size === 0) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all .25s',
                boxShadow: (loading || selectedPages.size === 0) ? 'none' : '0 6px 20px rgba(147,197,253,.25)',
              }}>
                {loading
                  ? <><Spinner dark={selectedPages.size > 0}/> {pagesOutputMode === 'merge' && selectedPages.size > 1 ? 'Combinando…' : 'Extrayendo…'}</>
                  : selectedPages.size === 0
                    ? 'Selecciona al menos una página'
                    : pagesOutputMode === 'merge' && selectedPages.size > 1
                      ? <><Download size={17}/>Combinar {selectedPages.size} páginas en un PDF</>
                      : <><Download size={17}/>Extraer {selectedPages.size} página{selectedPages.size > 1 ? 's' : ''} seleccionada{selectedPages.size > 1 ? 's' : ''}</>
                }
              </button>
            )}
          </>
        )}

        <input id="fi" type="file" accept=".pdf" onChange={(e) => addFile(e.target.files[0])} style={{ display: 'none' }}/>

        <style>{`
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
          input[type=number] { -moz-appearance:textfield; }
        `}</style>

      </div>
    </div>
  )
}

function Spinner({ dark = true }) {
  const c = dark ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.2)'
  const t = dark ? '#000' : '#fff'
  return <div style={{ width: 15, height: 15, border: `2px solid ${c}`, borderTop: `2px solid ${t}`, borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }}/>
}