import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilePlus2, Scissors, Minimize2, Image, Upload, Settings, Download, ChevronRight, ChevronDown, ArrowRight, ArrowDown } from 'lucide-react'

const TOOLS = [
  {
    icon: FilePlus2,
    color: '#6ee7b7',
    name: 'Unir PDF',
    path: '/merge',
    description: 'Combina dos o más archivos PDF en un único documento, en el orden que tú definas.',
    steps: [
      'Arrastra tus archivos PDF al área de carga, o haz clic para seleccionarlos desde tu dispositivo.',
      'Revisa la lista de archivos. Cada tarjeta muestra una miniatura de la primera página para que puedas identificarlos fácilmente.',
      'Ordena los archivos arrastrándolos a la posición deseada, o usa las flechas arriba y abajo en cada tarjeta.',
      'Haz clic en "Unir PDFs". El archivo combinado se descargará automáticamente.',
    ],
    notes: 'Puedes subir tantos archivos como necesites en una sola operación. El resultado conserva todas las páginas y el formato original de cada documento.',
  },
  {
    icon: Scissors,
    color: '#93c5fd',
    name: 'Separar PDF',
    path: '/split',
    description: 'Extrae páginas de un PDF de tres formas: todas las páginas, por rangos o seleccionando páginas individuales.',
    steps: [
      'Sube tu archivo PDF. NeatPDF cargará una vista previa de cada página.',
      'Elige el modo de separación: "Todas las páginas" genera un archivo por página; "Por rango" te permite definir hasta 5 intervalos; "Páginas específicas" muestra miniaturas para que elijas exactamente las que quieres.',
      'En el modo "Por rango", ajusta el inicio y fin de cada rango con los controles de cada tarjeta. Si dos rangos se solapan, recibirás un aviso pero la operación continuará.',
      'En el modo "Páginas específicas", elige si quieres recibir las páginas como archivos separados o combinadas en un solo PDF.',
      'Haz clic en el botón de acción. Si el resultado tiene más de un archivo, se empaquetará automáticamente en un ZIP.',
    ],
    notes: 'La vista previa de páginas se genera en tu navegador. Ningún contenido del PDF se envía al servidor hasta que confirmas la operación.',
  },
  {
    icon: Minimize2,
    color: '#d8b4fe',
    name: 'Comprimir PDF',
    path: '/compress',
    description: 'Reduce el tamaño de un archivo PDF eligiendo el nivel de compresión que mejor se adapte a tu caso.',
    steps: [
      'Arrastra tu PDF al área de carga o selecciónalo desde tu dispositivo.',
      'Selecciona el nivel de compresión: "Máxima compresión" para el menor tamaño posible, "Balanceado" para un equilibrio entre tamaño y calidad, o "Alta calidad" para una compresión mínima.',
      'Haz clic en "Comprimir PDF". Al finalizar verás el porcentaje de reducción obtenido y el archivo se descargará automáticamente.',
    ],
    notes: 'El resultado depende del contenido del PDF. Los documentos con imágenes de alta resolución se benefician más de la compresión que los documentos de texto puro.',
  },
  {
    icon: Image,
    color: '#a5f3fc',
    name: 'PDF a Imagen',
    path: '/convert',
    description: 'Convierte cada página de un PDF en una imagen PNG o JPG con la resolución que necesites.',
    steps: [
      'Sube tu archivo PDF.',
      'Elige el formato de salida: PNG para mayor calidad y fondo transparente, o JPG para archivos más ligeros.',
      'Ajusta la resolución con el control deslizante o selecciona un valor predefinido: 72, 150, 200 o 300 DPI. A mayor DPI, mayor calidad y tamaño de archivo.',
      'Haz clic en "Convertir". Recibirás un archivo ZIP con una imagen por cada página del PDF.',
    ],
    notes: '300 DPI es adecuado para impresión. Para uso en pantalla o web, 72 o 150 DPI son suficientes y producen archivos considerablemente más pequeños.',
  },
]

const GENERAL_STEPS = [
  { icon: Upload,   title: 'Sube tu archivo',        text: 'Arrastra el PDF o selecciónalo desde tu dispositivo. Máximo 50 MB por archivo.' },
  { icon: Settings, title: 'Configura la operación', text: 'Ajusta las opciones que aparecen según la herramienta que estés usando.' },
  { icon: Download, title: 'Descarga el resultado',  text: 'El archivo procesado se descarga automáticamente. Varios archivos se empaquetan en ZIP.' },
]

export default function HowToUse() {
  const navigate = useNavigate()
  const [openSet, setOpenSet] = useState(new Set())
  const headerRefs = useRef([])

  const toggle = (i) => {
    setOpenSet(prev => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
        setTimeout(() => {
          const el = headerRefs.current[i]
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 20)
      }
      return next
    })
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,77,255,.16) 0%,transparent 70%)', top: -140, left: -160, filter: 'blur(80px)', animation: 'orbDrift1 24s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,rgba(147,197,253,.12) 0%,transparent 70%)', top: '8%', right: -120, filter: 'blur(80px)', animation: 'orbDrift2 28s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(110,231,183,.10) 0%,transparent 70%)', bottom: '6%', left: '8%', filter: 'blur(80px)', animation: 'orbDrift3 26s ease-in-out infinite alternate' }} />
      </div>

      <style>{`
        @keyframes orbDrift1 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.06)} 100%{transform:translate(-20px,40px) scale(.96)} }
        @keyframes orbDrift2 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-35px,25px) scale(1.04)} 100%{transform:translate(28px,-20px) scale(.98)} }
        @keyframes orbDrift3 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,35px) scale(1.05)} 100%{transform:translate(-30px,-18px) scale(.97)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        .acc-item {
          border-radius: 16px;
          overflow: hidden;
          transition: border-color .25s ease, background .25s ease;
        }

        .acc-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .acc-chevron {
          transition: transform .28s ease;
          flex-shrink: 0;
          margin-left: auto;
        }
        .acc-chevron.open { transform: rotate(180deg); }

        .acc-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows .35s ease;
        }
        .acc-body.open { grid-template-rows: 1fr; }
        .acc-body-inner { overflow: hidden; }

        .try-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .2s;
        }

        .step-number {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .collapse-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-top: 1px solid rgba(255,255,255,.06);
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .03em;
          transition: background .18s, color .18s;
        }
        .collapse-btn:hover { background: rgba(255,255,255,.04); }

        /* flujo general responsive */
        .flow-row {
          display: flex;
          align-items: stretch;
        }
        .flow-step {
          flex: 1;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          padding: 20px 18px;
          box-sizing: border-box;
        }
        .flow-arrow-wrap {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
        }

        @media (max-width: 600px) {
          .flow-row { flex-direction: column; gap: 0; }
          .flow-arrow-wrap { padding: 8px 0; transform: rotate(90deg); }
        }
      `}</style>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '60px 32px 120px', position: 'relative', zIndex: 1 }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
          <span style={{ cursor: 'pointer', transition: 'color .18s' }}
            onClick={() => navigate('/')}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,.7)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.35)'}>
            Inicio
          </span>
          <span style={{ color: 'rgba(255,255,255,.2)' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,.6)' }}>Cómo usar NeatPDF</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 52, animation: 'fadeUp .7s ease both' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--purple, #a78bfa)', margin: '0 0 14px' }}>
            Guía de uso
          </p>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(26px,5vw,38px)', color: '#fff', letterSpacing: '-0.8px', margin: '0 0 14px', lineHeight: 1.1 }}>
            Cómo usar NeatPDF
          </h1>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.45)', lineHeight: 1.8, margin: 0, fontWeight: 300, maxWidth: 560 }}>
            Todas las herramientas funcionan desde el navegador, sin instalar ningún programa. Sube tu PDF, configura la operación y descarga el resultado.
          </p>
        </div>

        {/* Flujo general */}
        <div style={{ marginBottom: 56, animation: 'fadeUp .6s ease .1s both' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', margin: '0 0 20px' }}>
            Flujo general
          </p>

          <div className="flow-row">
            {GENERAL_STEPS.map((step, i) => {
              const Icon = step.icon
              const isLast = i === GENERAL_STEPS.length - 1
              return (
                <div key={i} style={{ display: 'contents' }}>
                  <div className="flow-step">
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,.14)', border: '1px solid rgba(139,92,246,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <Icon size={17} color="var(--purple, #a78bfa)" />
                    </div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', margin: '0 0 7px' }}>{step.title}</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{step.text}</p>
                  </div>
                  {!isLast && (
                    <div className="flow-arrow-wrap">
                      <ArrowRight size={18} color="rgba(255,255,255,.2)" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Acordeon */}
        <div style={{ animation: 'fadeUp .6s ease .18s both' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', margin: '0 0 20px' }}>
            Herramientas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon
              const isOpen = openSet.has(i)
              return (
                <div
                  key={i}
                  ref={el => headerRefs.current[i] = el}
                  className="acc-item"
                  style={{
                    border: `1px solid ${isOpen ? `${tool.color}35` : 'rgba(255,255,255,.08)'}`,
                    background: isOpen ? `${tool.color}06` : 'rgba(255,255,255,.04)',
                    scrollMarginTop: 80,
                  }}
                >
                  {/* Trigger superior */}
                  <button className="acc-trigger" onClick={() => toggle(i)}>
                    <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${tool.color}14`, border: `1px solid ${tool.color}30` }}>
                      <Icon size={18} color={tool.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 15.5, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px', display: 'block' }}>
                        {tool.name}
                      </span>
                      {!isOpen && (
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', fontWeight: 300, display: 'block', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                          {tool.description}
                        </span>
                      )}
                    </div>
                    <ChevronDown size={18} color="rgba(255,255,255,.35)" className={`acc-chevron${isOpen ? ' open' : ''}`} />
                  </button>

                  {/* Cuerpo */}
                  <div className={`acc-body${isOpen ? ' open' : ''}`}>
                    <div className="acc-body-inner">
                      <div style={{ padding: '0 24px 20px' }}>

                        <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.5)', lineHeight: 1.75, margin: '0 0 22px', fontWeight: 300, paddingLeft: 52 }}>
                          {tool.description}
                        </p>

                        <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '0 0 22px' }} />

                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', margin: '0 0 14px' }}>
                          Pasos
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                          {tool.steps.map((step, j) => (
                            <div key={j} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                              <div className="step-number" style={{ background: `${tool.color}18`, border: `1px solid ${tool.color}35`, color: tool.color }}>
                                {j + 1}
                              </div>
                              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div style={{ padding: '12px 16px', borderRadius: 10, background: `${tool.color}08`, border: `1px solid ${tool.color}20`, marginBottom: 20 }}>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
                            <span style={{ fontWeight: 700, color: tool.color }}>Nota: </span>
                            {tool.notes}
                          </p>
                        </div>

                        <button
                          className="try-btn"
                          onClick={() => navigate(tool.path)}
                          style={{ background: `${tool.color}18`, color: tool.color, border: `1px solid ${tool.color}35` }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${tool.color}2e`; e.currentTarget.style.borderColor = `${tool.color}60` }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${tool.color}18`; e.currentTarget.style.borderColor = `${tool.color}35` }}
                        >
                          Ir a {tool.name}
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {/* Botón colapsar desde abajo */}
                      <button
                        className="collapse-btn"
                        onClick={() => toggle(i)}
                        style={{ color: 'rgba(255,255,255,.28)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.28)'}
                      >
                        <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} />
                        Contraer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </main>
    </>
  )
}