import React from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import HeroAnimation from '../components/HeroAnimation'

/* ==== ESTILOS GLOBALES ==== */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  .npdf-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }

  @keyframes orbDrift1 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.06)} 100%{transform:translate(-20px,40px) scale(.96)} }
  @keyframes orbDrift2 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-35px,25px) scale(1.04)} 100%{transform:translate(28px,-20px) scale(.98)} }
  @keyframes orbDrift3 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,35px) scale(1.05)} 100%{transform:translate(-30px,-18px) scale(.97)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

  /* Tarjetas */
  .tool-card-inner { 
    transition: transform .25s ease, box-shadow .25s ease;
    aspect-ratio: 1;
  }
  .tool-card-inner:hover { 
    transform: translateY(-5px); 
    box-shadow: 0 24px 44px -18px rgba(0,0,0,.65); 
  }

  /* ==== RESPONSIVE ==== */
  
  /* Tablets y laptops pequeñas */
  @media(max-width:1024px) and (max-height:700px),
         (max-width:1000px) {
    .neat-grid { 
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 16px !important;
    }
    .tool-card-inner {
      aspect-ratio: auto !important;
      min-height: 160px !important;
      padding: 20px 18px !important;
      border-radius: 14px !important;
    }
    .tool-card-inner .tool-icon {
      width: 44px !important;
      height: 44px !important;
      margin-bottom: 10px !important;
      border-radius: 12px !important;
    }
    .tool-card-inner .tool-title {
      font-size: 18px !important;
      margin-bottom: 4px !important;
    }
    .tool-card-inner .tool-desc {
      font-size: 12.5px !important;
      line-height: 1.5 !important;
    }
  }

  @media(max-width:900px){
    .hero-grid {
      grid-template-columns: 1fr !important;
      padding-top: 40px !important;
      gap: 24px !important;
    }
    .device-col {
      max-width: 380px !important;
      margin: 0 auto;
      width: 100%;
    }
    .neat-grid {
      grid-template-columns: repeat(2,1fr) !important;
      gap: 14px !important;
    }
    .tool-card-inner {
      aspect-ratio: auto !important;
      min-height: 150px !important;
      padding: 18px 16px !important;
    }
    .tool-card-inner .tool-icon {
      width: 40px !important;
      height: 40px !important;
      margin-bottom: 8px !important;
    }
    .tool-card-inner .tool-title {
      font-size: 17px !important;
    }
    .tool-card-inner .tool-desc {
      font-size: 12px !important;
    }
  }

  @media(max-width:600px){
    .hero-grid {
      padding-top: 24px !important;
      gap: 16px !important;
    }
    .device-col {
      max-width: 280px !important;
    }
    .neat-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    .tool-card-inner {
      aspect-ratio: auto !important;
      min-height: 120px !important;
      padding: 14px 14px !important;
    }
    .tool-card-inner .tool-icon {
      width: 36px !important;
      height: 36px !important;
      margin-bottom: 6px !important;
    }
    .tool-card-inner .tool-title {
      font-size: 16px !important;
      margin-bottom: 2px !important;
    }
    .tool-card-inner .tool-desc {
      font-size: 11.5px !important;
      line-height: 1.4 !important;
    }
  }

  @media(max-width:520px){
    .neat-grid { 
      gap: 10px !important;
    }
    .hero-grid {
      padding-top: 30px !important;
      padding-bottom: 30px !important;
    }
    .tool-card-inner {
      min-height: 110px !important;
      padding: 12px 12px !important;
    }
  }

  @media(max-width:400px){
    .device-col {
      max-width: 200px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
  }
`

function InjectStyles() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />
}

/* ==== Iconos de las tarjetas ==== */
function IconMerge({ color, size = 32 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="13" height="16" rx="2"/><rect x="8" y="2" width="13" height="16" rx="2"/></svg>
}
function IconSplit({ color, size = 32 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
}
function IconCompress({ color, size = 32 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10 21 3"/><path d="M3 21l7-7"/></svg>
}
function IconConvert({ color, size = 32 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.74-3.04L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.74 3.04L21 8"/><path d="M3 16v4h4"/><path d="M21 8V4h-4"/></svg>
}

const tools = [
  { id: 'merge',    title: 'Unir PDF',      desc: 'Une varios archivos PDF en uno solo.',          accent: '#6ee7b7', Icon: IconMerge },
  { id: 'split',    title: 'Separar PDF',   desc: 'Separa las páginas en archivos individuales.',  accent: '#93c5fd', Icon: IconSplit },
  { id: 'compress', title: 'Comprimir PDF', desc: 'Reduce el tamaño sin perder calidad.',           accent: '#d8b4fe', Icon: IconCompress },
  { id: 'convert',  title: 'PDF a Imagen',  desc: 'Convierte páginas a PNG o JPG.',                accent: '#a5f3fc', Icon: IconConvert },
]

/* ==== Tool Card ==== */
function ToolCard({ tool, onClick }) {
  return (
    <div
      className="tool-card-inner"
      onClick={onClick}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'rgba(19, 10, 70, 0.42)',
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${tool.accent}55`,
        padding: '28px 22px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="tool-icon"
        style={{
          width: 58, height: 58, borderRadius: 15, marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${tool.accent}18`,
          border: `1px solid ${tool.accent}30`,
          flexShrink: 0,
        }}
      >
        <tool.Icon color={tool.accent} size={30} />
      </div>

      <div
        className="tool-title"
        style={{
          fontFamily: '"Akt", sans-serif', fontWeight: 700,
          fontSize: 22, color: '#fff',
          marginBottom: 10, letterSpacing: '-.2px',
          lineHeight: 1.2,
        }}
      >
        {tool.title}
      </div>

      <p
        className="tool-desc"
        style={{
          fontSize: 13.5, color: 'rgba(255,255,255,.5)',
          lineHeight: 1.6, fontWeight: 300, margin: 0,
        }}
      >
        {tool.desc}
      </p>
    </div>
  )
}

/* ==== Home ==== */
export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      <InjectStyles />

      {/* Atmósfera de fondo */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '34px 34px', opacity: .04 }} />
        <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,77,255,.16) 0%,transparent 70%)', top: -140, left: -160, filter: 'blur(80px)', animation: 'orbDrift1 24s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,rgba(147,197,253,.12) 0%,transparent 70%)', top: '8%', right: -120, filter: 'blur(80px)', animation: 'orbDrift2 28s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(110,231,183,.10) 0%,transparent 70%)', bottom: '6%', left: '8%', filter: 'blur(80px)', animation: 'orbDrift3 26s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(216,180,254,.12) 0%,transparent 70%)', bottom: '18%', right: '14%', filter: 'blur(80px)', animation: 'orbDrift1 30s ease-in-out infinite alternate', animationDelay: '-8s' }} />
      </div>

      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '0 32px 110px', position: 'relative', zIndex: 1 }}>

        {/* ══ HERO ══ */}
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 60, alignItems: 'center', padding: '84px 0 64px' }}>

          {/* Texto */}
          <div style={{ animation: 'fadeUp .75s ease both' }}>
            <h1 style={{
              fontFamily: '"Akt", sans-serif', fontWeight: 800,
              fontSize: 'clamp(2.7rem, 4.9vw, 5.3rem)',
              lineHeight: 1.12, letterSpacing: '-1.6px',
              color: '#fff', margin: '0 0 22px',
            }}>
              Edita tus PDFs,<br />
              <span style={{ color: 'var(--purple)' }}>sin complicaciones</span>
            </h1>
            <p style={{
              fontSize: 17.5, lineHeight: 1.75,
              color: 'rgba(255,255,255,.6)',
              maxWidth: 430, fontWeight: 300, margin: 0,
            }}>
              Herramientas rápidas y gratuitas para trabajar con tus archivos PDF directamente desde el navegador.
            </p>
          </div>

          {/* ══ ANIMACIÓN - MODIFICADO ══ */}
          <div className="device-col" style={{
            position: 'relative',
            animation: 'fadeUp .8s ease .1s both',
            width: '100%',
            maxWidth: '420px',
            margin: '0 auto',
          }}>
            <HeroAnimation />
          </div>
        </div>

        {/* ══ DIVISOR ══ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '18px 0 36px' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)' }} />
          <span className="npdf-mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.36)', whiteSpace: 'nowrap' }}>
            Elige una herramienta
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)' }} />
        </div>

        {/* ══ TARJETAS ══ */}
        <div className="neat-grid" id="tools" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          {tools.map(t => (
            <ToolCard key={t.id} tool={t} onClick={() => navigate(`/${t.id}`)} />
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}