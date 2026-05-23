import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── ESTILOS DE ANIMACIONES ── */
const animStyles = `
  .merge-doc{position:absolute;width:34px;height:42px;border-radius:3px;border:2px solid #6ee7b7;background:rgba(110,231,183,.12);}
  .merge-doc.a{left:2px;top:10px;animation:mergeA 2.4s ease-in-out infinite;}
  .merge-doc.b{right:2px;top:10px;animation:mergeB 2.4s ease-in-out infinite;}
  .merge-doc.c{left:50%;top:50%;transform:translate(-50%,-50%);width:36px;height:44px;border-color:#6ee7b7;background:rgba(110,231,183,.22);opacity:0;animation:mergeC 2.4s ease-in-out infinite;}
  @keyframes mergeA{0%,30%{left:2px;opacity:1}60%{left:22px;opacity:0}100%{left:2px;opacity:1}}
  @keyframes mergeB{0%,30%{right:2px;opacity:1}60%{right:22px;opacity:0}100%{right:2px;opacity:1}}
  @keyframes mergeC{0%,40%{opacity:0;transform:translate(-50%,-50%) scale(.7)}65%,85%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.7)}}

  .split-doc{position:absolute;width:36px;height:44px;border-radius:3px;border:2px solid #93c5fd;background:rgba(147,197,253,.12);}
  .split-doc.main{left:50%;top:50%;transform:translate(-50%,-50%);animation:splitMain 2.4s ease-in-out infinite;}
  .split-doc.out-a{left:2px;top:10px;opacity:0;animation:splitOutA 2.4s ease-in-out infinite;}
  .split-doc.out-b{right:2px;top:10px;opacity:0;animation:splitOutB 2.4s ease-in-out infinite;}
  .split-line{position:absolute;left:50%;top:4px;bottom:4px;width:1.5px;background:#93c5fd;opacity:0;transform:translateX(-50%);animation:splitLine 2.4s ease-in-out infinite;}
  @keyframes splitMain{0%,20%{opacity:1;transform:translate(-50%,-50%) scale(1)}50%,100%{opacity:0;transform:translate(-50%,-50%) scale(.8)}}
  @keyframes splitLine{0%,15%{opacity:0}30%,45%{opacity:.7}60%,100%{opacity:0}}
  @keyframes splitOutA{0%,40%{opacity:0;left:20px}65%,85%{opacity:1;left:2px}100%{opacity:0;left:2px}}
  @keyframes splitOutB{0%,40%{opacity:0;right:20px}65%,85%{opacity:1;right:2px}100%{opacity:0;right:2px}}

  .compress-doc{position:absolute;left:50%;top:50%;width:38px;height:46px;border-radius:3px;border:2px solid #d8b4fe;background:rgba(216,180,254,.12);transform:translate(-50%,-50%);animation:compressDoc 2.4s ease-in-out infinite;}
  .compress-arrows{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;}
  .compress-arrows span{position:absolute;font-size:15px;color:#d8b4fe;animation:compressArr 2.4s ease-in-out infinite;font-weight:600;}
  .compress-arrows span:nth-child(1){top:0;left:50%;transform:translateX(-50%);}
  .compress-arrows span:nth-child(2){bottom:0;left:50%;transform:translateX(-50%);}
  .compress-arrows span:nth-child(3){left:0;top:50%;transform:translateY(-50%);}
  .compress-arrows span:nth-child(4){right:0;top:50%;transform:translateY(-50%);}
  @keyframes compressDoc{0%,20%{width:38px;height:46px}60%,80%{width:22px;height:26px}100%{width:38px;height:46px}}
  @keyframes compressArr{0%,20%{opacity:0}45%,75%{opacity:.9}100%{opacity:0}}

  .conv-doc{position:absolute;left:0px;top:50%;width:30px;height:37px;border-radius:3px;border:2px solid #a5f3fc;background:rgba(165,243,252,.1);transform:translateY(-50%);animation:convDoc 2.4s ease-in-out infinite;}
  .conv-img{position:absolute;right:0px;top:50%;width:32px;height:27px;border-radius:4px;border:2px solid #a5f3fc;background:rgba(165,243,252,.1);transform:translateY(-50%);opacity:0;animation:convImg 2.4s ease-in-out infinite;overflow:hidden;}
  .conv-img::after{content:'';position:absolute;bottom:0;left:0;right:0;height:11px;background:linear-gradient(180deg,transparent,rgba(165,243,252,.35));}
  .conv-img::before{content:'';position:absolute;top:5px;left:6px;width:9px;height:9px;border-radius:50%;background:rgba(165,243,252,.45);}
  .conv-arrow{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:16px;color:#a5f3fc;opacity:0;animation:convArrow 2.4s ease-in-out infinite;font-weight:600;}
  @keyframes convDoc{0%,30%{opacity:1;left:0px}55%,100%{opacity:0;left:16px}}
  @keyframes convArrow{0%,25%{opacity:0}40%,55%{opacity:1}70%,100%{opacity:0}}
  @keyframes convImg{0%,50%{opacity:0;right:0px}70%,90%{opacity:1;right:2px}100%{opacity:0;right:0px}}

  @media(max-width:900px){.neat-grid{grid-template-columns:repeat(2,1fr) !important;}}
  @media(max-width:480px){.neat-grid{grid-template-columns:1fr !important;} .neat-card{aspect-ratio:unset !important;min-height:280px;}}
`

function InjectStyles() {
  return <style dangerouslySetInnerHTML={{ __html: animStyles }} />
}

function MergeAnim() {
  return <>
    <div className="merge-doc a" />
    <div className="merge-doc b" />
    <div className="merge-doc c" />
  </>
}
function SplitAnim() {
  return <>
    <div className="split-doc main" />
    <div className="split-doc out-a" />
    <div className="split-doc out-b" />
    <div className="split-line" />
  </>
}
function CompressAnim() {
  return <>
    <div className="compress-doc" />
    <div className="compress-arrows">
      <span>↓</span><span>↑</span><span>→</span><span>←</span>
    </div>
  </>
}
function ConvertAnim() {
  return <>
    <div className="conv-doc" />
    <div className="conv-arrow">→</div>
    <div className="conv-img" />
  </>
}

const tools = [
  { id: 'merge',    title: 'Unir PDF',    desc: 'Une varios archivos PDF en uno solo, en el orden que elijas.',    accent: '#6ee7b7', glow: 'rgba(110,231,183,.45)', Anim: MergeAnim },
  { id: 'split',    title: 'Separar PDF',    desc: 'Separa las páginas de un PDF en archivos individuales.',           accent: '#93c5fd', glow: 'rgba(147,197,253,.45)', Anim: SplitAnim },
  { id: 'compress', title: 'Comprimir PDF', desc: 'Reduce el tamaño de tu PDF sin perder calidad visible.',           accent: '#d8b4fe', glow: 'rgba(216,180,254,.45)', Anim: CompressAnim },
  { id: 'convert',  title: 'PDF a Imagen', desc: 'Convierte páginas de PDF a imágenes PNG o JPG fácilmente.',        accent: '#a5f3fc', glow: 'rgba(165,243,252,.45)', Anim: ConvertAnim },
]

const FOLD = 44

function ToolCard({ tool, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="neat-card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: '0.707',
        background: hovered ? 'rgba(255,255,255,.18)' : 'rgba(255, 255, 255, 0.16)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-7px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 32px 72px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.15)`
          : `0 6px 28px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.09)`,
        transition: 'transform .25s ease, box-shadow .25s ease, background .25s ease',
        display: 'flex', flexDirection: 'column',
        padding: '28px 22px 26px',
        clipPath: `polygon(0 0, calc(100% - ${FOLD}px) 0, 100% ${FOLD}px, 100% 100%, 0 100%)`,
      }}
    >
      {/* ── ESQUINA DOBLADA — ambas mitades con color ── */}
      {/*
        Técnica: dos triángulos superpuestos que forman el cuadrado de la esquina.
        El superior-derecho (pliegue visible) tiene color claro.
        El inferior-izquierdo (sombra del pliegue) tiene color más oscuro.
        Ambos juntos llenan todo el área FOLD×FOLD sin dejar zonas vacías.
      */}

      {/* triángulo inferior-izquierdo del pliegue (sombra, más oscuro) */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: `${FOLD}px 0 0 ${FOLD}px`,
        borderTopColor: 'transparent',
        borderLeftColor: `rgba(255,255,255,.08)`,
        zIndex: 3,
        pointerEvents: 'none',
      }} />

      {/* triángulo superior-derecho del pliegue (color principal, más claro) */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: `0 ${FOLD}px ${FOLD}px 0`,
        borderRightColor: 'rgba(255,255,255,.28)',
        borderBottomColor: 'transparent',
        zIndex: 4,
        filter: `drop-shadow(-3px 4px 7px rgba(0,0,0,.7))`,
        pointerEvents: 'none',
      }} />

      {/* glow de color en esquina */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 110, height: 110, borderRadius: '50%',
        background: tool.glow, filter: 'blur(30px)',
        opacity: .5, pointerEvents: 'none', zIndex: 1,
      }} />

      {/* líneas de renglón */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 0, opacity: .045,
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 22px, rgba(255,255,255,.8) 22px, rgba(255,255,255,.8) 23px)',
        backgroundPosition: '0 56px',
      }} />

      {/* margen rojo */}
      <div style={{
        position: 'absolute', left: 22, top: 0, bottom: 0,
        width: 1, background: 'rgba(255,100,100,.09)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* línea accent inferior */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)`,
        zIndex: 2, opacity: hovered ? 1 : 0.5,
        transition: 'opacity .25s ease',
      }} />

      {/* ── CONTENIDO ── */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>

        <div style={{ width: 80, height: 80, marginBottom: 20, position: 'relative', flexShrink: 0 }}>
          <tool.Anim />
        </div>

        <div style={{
          fontFamily: '"Akt", sans-serif', fontWeight: 700, fontSize: 25,
          color: '#fff', marginBottom: 9, letterSpacing: '-.2px', lineHeight: 1.25,
        }}>
          {tool.title}
        </div>

        <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,.90)', lineHeight: 1.65, margin: 0, flex: 1 }}>
          {tool.desc}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center',
          gap: hovered ? 9 : 4,
          fontSize: 12, fontWeight: 600, marginTop: 18,
          color: tool.accent, transition: 'gap .2s ease',
        }}>
          Abrir <span>→</span>
        </div>
      </div>
    </div>
  )
}

function Home() {
  const navigate = useNavigate()

  return (
    <>
      <InjectStyles />
      <main style={{ maxWidth: 1060, margin: '0 auto', padding: '0 2rem 5rem', position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: 'center', padding: '80px 0 64px', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 560, height: 280, pointerEvents: 'none',
            background: 'radial-gradient(ellipse, rgba(139,92,246,.18) 0%, transparent 70%)',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 999, padding: '7px 18px', marginBottom: 32,
            fontSize: 12.5, fontWeight: 500, color: '#a7f3d0', letterSpacing: '.02em',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', flexShrink: 0, boxShadow: '0 0 8px #34d399' }} />
            Procesamiento 100% en servidor seguro
          </div>

          <h1 style={{
            fontFamily: '"Akt", sans-serif', fontWeight: 800,
            fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)',
            color: '#fff', lineHeight: 1.08, letterSpacing: '-2px', marginBottom: 22,
          }}>
            Edita tus PDFs,<br />
            <span style={{
              background: 'linear-gradient(90deg, #c4b5fd 0%, #a78bfa 40%, #6ee7b7 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              sin complicaciones
            </span>
          </h1>

          <p style={{
            fontSize: 16.5, lineHeight: 1.75, color: 'rgba(255,255,255,.70)',
            maxWidth: 430, margin: '0 auto 52px',
          }}>
            Herramientas rápidas y gratuitas para trabajar con tus archivos PDF
            directamente desde el navegador.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ padding: '0 38px', textAlign: 'center' }}>
              <div style={{
                fontFamily: '"Akt", sans-serif', fontWeight: 800, fontSize: 28,
                background: 'linear-gradient(135deg, #c4b5fd, #6ee7b7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>100%</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.70)', marginTop: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                Gratuito
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION LABEL ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 24px' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)' }} />
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.70)' }}>
            elige una herramienta
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)' }} />
        </div>

        {/* ── GRID ── */}
        <div className="neat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => navigate(`/${tool.id}`)} />
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.70)', margin: 0 }}>
            Los archivos se procesan en el servidor y no se almacenan permanentemente.
          </p>
        </div>

      </main>
    </>
  )
}

export default Home