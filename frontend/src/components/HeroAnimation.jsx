/**
 * HeroAnimation
 *
 * Componente visual autocontenido: tres hojas PDF recostadas en perspectiva,
 * puntos/rombos decorativos de color, y el chip flotante con las 4 escenas
 * animadas (unir, separar, comprimir, convertir) ciclando cada 8s.
 *
 * No recibe props — todo el estado visual es interno.
 */

const sceneStyles = `
  @keyframes sceneA{0%,18%{opacity:1;transform:translateY(0)}23%{opacity:0;transform:translateY(-6px)}96%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}
  @keyframes sceneB{0%,21%{opacity:0;transform:translateY(6px)}25%,43%{opacity:1;transform:translateY(0)}48%{opacity:0;transform:translateY(-6px)}100%{opacity:0;transform:translateY(6px)}}
  @keyframes sceneC{0%,46%{opacity:0;transform:translateY(6px)}50%,68%{opacity:1;transform:translateY(0)}73%{opacity:0;transform:translateY(-6px)}100%{opacity:0;transform:translateY(6px)}}
  @keyframes sceneD{0%,71%{opacity:0;transform:translateY(6px)}75%,93%{opacity:1;transform:translateY(0)}98%{opacity:0;transform:translateY(-6px)}100%{opacity:0;transform:translateY(6px)}}
  .npdf-scene-a{ animation:sceneA 8s ease-in-out infinite; }
  .npdf-scene-b{ animation:sceneB 8s ease-in-out infinite; }
  .npdf-scene-c{ animation:sceneC 8s ease-in-out infinite; }
  .npdf-scene-d{ animation:sceneD 8s ease-in-out infinite; }

  @keyframes dotA{0%,18%{background:#6ee7b7;transform:scale(1.3)}23%,96%{background:rgba(255,255,255,.18);transform:scale(1)}100%{background:#6ee7b7;transform:scale(1.3)}}
  @keyframes dotB{0%,21%{background:rgba(255,255,255,.18);transform:scale(1)}25%,43%{background:#93c5fd;transform:scale(1.3)}48%,100%{background:rgba(255,255,255,.18);transform:scale(1)}}
  @keyframes dotC{0%,46%{background:rgba(255,255,255,.18);transform:scale(1)}50%,68%{background:#d8b4fe;transform:scale(1.3)}73%,100%{background:rgba(255,255,255,.18);transform:scale(1)}}
  @keyframes dotD{0%,71%{background:rgba(255,255,255,.18);transform:scale(1)}75%,93%{background:#a5f3fc;transform:scale(1.3)}98%,100%{background:rgba(255,255,255,.18);transform:scale(1)}}
  .npdf-dot-a{ animation:dotA 8s ease-in-out infinite; }
  .npdf-dot-b{ animation:dotB 8s ease-in-out infinite; }
  .npdf-dot-c{ animation:dotC 8s ease-in-out infinite; }
  .npdf-dot-d{ animation:dotD 8s ease-in-out infinite; }

  @keyframes reflectGlow{
    0%,18%  { background:#6ee7b7; }
    25%,43% { background:#93c5fd; }
    50%,68% { background:#d8b4fe; }
    75%,93% { background:#a5f3fc; }
    100%    { background:#6ee7b7; }
  }
  .npdf-chip-glow{ animation:reflectGlow 8s ease-in-out infinite; }
  .npdf-reflection{ animation:reflectGlow 8s ease-in-out infinite; }

  @keyframes floatDeco {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%     { transform: translateY(-8px) rotate(6deg); }
  }
  @keyframes floatDeco2 {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%     { transform: translateY(-6px) rotate(-5deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .npdf-scene-a,.npdf-scene-b,.npdf-scene-c,.npdf-scene-d,
    .npdf-dot-a,.npdf-dot-b,.npdf-dot-c,.npdf-dot-d,
    .npdf-chip-glow,.npdf-reflection { animation:none !important; }
  }
`

/* ── Mini iconos para el chip ── */
function IconMerge({ color, size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="13" height="16" rx="2"/><rect x="8" y="2" width="13" height="16" rx="2"/></svg>
}
function IconSplit({ color, size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
}
function IconCompress({ color, size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10 21 3"/><path d="M3 21l7-7"/></svg>
}
function IconConvert({ color, size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.74-3.04L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.74 3.04L21 8"/><path d="M3 16v4h4"/><path d="M21 8V4h-4"/></svg>
}

/* ── Hoja PDF genérica (recostada en perspectiva) ── */
function PdfSheet({ style, opacity = 1, lineOpacity = 0.13, showLabel = false }) {
  return (
    <div style={{
      position: 'absolute',
      width: '55%',
      aspectRatio: '0.766',
      maxWidth: 236,
      background: 'linear-gradient(165deg, rgba(255,255,255,.09), rgba(255,255,255,.025))',
      border: '1px solid rgba(255,255,255,.16)',
      borderRadius: 10,
      boxShadow: '0 55px 70px -28px rgba(0,0,0,.7)',
      transform: 'rotateX(50deg) rotateZ(-26deg)',
      opacity,
      ...style,
    }}>
      {[56, 74, 92, 110, 128].map((top, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: '10%',
          top: `${18 + i * 6}%`,
          width: `${[60, 78, 48, 70, 38][i]}%`,
          height: '2%',
          borderRadius: 3,
          background: `rgba(255,255,255,${lineOpacity})`
        }} />
      ))}
      {showLabel && <div style={{
        position: 'absolute',
        left: '10%',
        bottom: '8%',
        fontSize: 'clamp(8px, 1.2vw, 11px)',
        letterSpacing: '.08em',
        color: 'rgba(255,255,255,.28)',
        fontWeight: 700
      }}>PDF</div>}
    </div>
  )
}

/* ── Punto decorativo ── */
function DecoDot({ x, y, color, size = 6, shape = 'circle', animDelay = '0s' }) {
  const isSquare = shape === 'square'
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size,
      borderRadius: isSquare ? 2 : '50%',
      background: color,
      opacity: 0.7,
      animation: `floatDeco ${2.8 + Math.random() * 2}s ease-in-out infinite`,
      animationDelay: animDelay,
      transform: isSquare ? 'rotate(45deg)' : 'none',
      flexShrink: 0,
    }} />
  )
}

export default function HeroAnimation() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sceneStyles }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        margin: '0 auto',
        aspectRatio: '1/1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          perspective: '1300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          {/* sombra de la hoja principal */}
          <div style={{
            position: 'absolute',
            width: '60%',
            height: '20%',
            left: '50%',
            top: '60%',
            transform: 'translate(-50%,-50%) rotateZ(-26deg)',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,.55), transparent 70%)',
            filter: 'blur(18px)'
          }} />

          {/* hoja trasera izquierda */}
          <PdfSheet
            opacity={0.9}
            lineOpacity={0.08}
            style={{
              width: '38%',
              left: '50%',
              top: '50%',
              marginLeft: '-8%',
              marginTop: '-55%',
              zIndex: 1,
            }}
          />

          {/* hoja trasera derecha */}
          <PdfSheet
            opacity={0.45}
            lineOpacity={0.07}
            style={{
              width: '28%',
              left: '50%',
              top: '50%',
              marginLeft: '-30%',
              marginTop: '10%',
              zIndex: 2,
            }}
          />

          {/* hoja principal */}
          <div style={{
            position: 'relative',
            width: '55%',
            aspectRatio: '0.766',
            maxWidth: 236,
            background: 'linear-gradient(165deg, rgba(30,18,80,.95), rgba(15,8,40,.98))',
            border: '1px solid rgba(255,255,255,.18)',
            borderRadius: 10,
            boxShadow: '0 55px 70px -28px rgba(0,0,0,.7)',
            transform: 'rotateX(50deg) rotateZ(-26deg)',
            zIndex: 3,
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 20% 20% 0',
              borderColor: 'transparent rgba(255,255,255,.24) transparent transparent'
            }} />
            {[56, 74, 92, 110, 128].map((top, i) => (
              <span key={i} style={{
                position: 'absolute',
                left: '10%',
                top: `${18 + i * 6}%`,
                width: `${[60, 78, 48, 70, 38][i]}%`,
                height: '2%',
                borderRadius: 3,
                background: 'rgba(255,255,255,.13)'
              }} />
            ))}
            <div style={{
              position: 'absolute',
              left: '10%',
              bottom: '8%',
              fontSize: 'clamp(8px, 1.2vw, 11px)',
              letterSpacing: '.08em',
              color: 'rgba(255,255,255,.28)',
              fontWeight: 700
            }}>PDF</div>
          </div>

          {/* ── Puntos y rombos decorativos ── */}
          <DecoDot x="12%" y="18%" color="#6ee7b7" size={7}  shape="circle" animDelay="0s" />
          <DecoDot x="18%" y="72%" color="#93c5fd" size={5}  shape="square" animDelay="0.4s" />
          <DecoDot x="8%"  y="45%" color="#d8b4fe" size={9}  shape="square" animDelay="0.8s" />
          <DecoDot x="82%" y="22%" color="#a5f3fc" size={6}  shape="circle" animDelay="1.2s" />
          <DecoDot x="88%" y="60%" color="#6ee7b7" size={8}  shape="square" animDelay="0.6s" />
          <DecoDot x="76%" y="80%" color="#d8b4fe" size={5}  shape="circle" animDelay="1.0s" />
          <DecoDot x="50%" y="10%" color="#93c5fd" size={6}  shape="circle" animDelay="0.3s" />
          <DecoDot x="62%" y="88%" color="#a5f3fc" size={7}  shape="square" animDelay="0.9s" />
          <DecoDot x="28%" y="14%" color="#d8b4fe" size={4}  shape="circle" animDelay="1.4s" />
          <DecoDot x="72%" y="15%" color="#6ee7b7" size={5}  shape="square" animDelay="0.2s" />

          {/* ── Chip flotante ── */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '34%',
            transform: 'translate(-50%,-50%)',
            width: '65%',
            maxWidth: 226,
            minWidth: 140,
            zIndex: 10,
          }}>
            <div className="npdf-chip-glow" style={{
              position: 'absolute',
              inset: '-22px',
              borderRadius: 22,
              filter: 'blur(26px)',
              opacity: .45
            }} />
            <div style={{
              position: 'relative',
              height: 'clamp(38px, 6vw, 60px)',
              background: 'rgba(12,12,18,.78)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,.14)',
              borderRadius: 14,
              boxShadow: '0 26px 42px -16px rgba(0,0,0,.65)',
              overflow: 'hidden',
            }}>
              {/* Escena A */}
              <div className="npdf-scene-a" style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(4px, 1vw, 11px)',
                padding: '0 clamp(6px, 1.5vw, 15px)',
              }}>
                <span style={{
                  width: 'clamp(18px, 3.5vw, 32px)',
                  height: 'clamp(18px, 3.5vw, 32px)',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'rgba(110,231,183,.15)',
                }}><IconMerge color="#6ee7b7" size={14}/></span>
                <span style={{
                  fontSize: 'clamp(10px, 1.7vw, 13px)',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}>Uniendo archivos</span>
              </div>

              {/* Escena B */}
              <div className="npdf-scene-b" style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(10px, 1vw, 11px)',
                padding: '0 clamp(6px, 1.5vw, 15px)',
              }}>
                <span style={{
                  width: 'clamp(18px, 3.5vw, 32px)',
                  height: 'clamp(18px, 3.5vw, 32px)',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'rgba(147,197,253,.15)',
                }}><IconSplit color="#93c5fd" size={14}/></span>
                <span style={{
                  fontSize: 'clamp(10px, 1.7vw, 13px)',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}>Separando páginas</span>
              </div>

              {/* Escena C */}
              <div className="npdf-scene-c" style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(4px, 1vw, 11px)',
                padding: '0 clamp(6px, 1.5vw, 15px)',
              }}>
                <span style={{
                  width: 'clamp(18px, 3.5vw, 32px)',
                  height: 'clamp(18px, 3.5vw, 32px)',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'rgba(216,180,254,.15)',
                }}><IconCompress color="#d8b4fe" size={14}/></span>
                <span style={{
                  fontSize: 'clamp(10px, 1.7vw, 13px)',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}>Comprimiendo</span>
              </div>

              {/* Escena D */}
              <div className="npdf-scene-d" style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(4px, 1vw, 11px)',
                padding: '0 clamp(6px, 1.5vw, 15px)',
              }}>
                <span style={{
                  width: 'clamp(18px, 3.5vw, 32px)',
                  height: 'clamp(18px, 3.5vw, 32px)',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'rgba(165,243,252,.15)',
                }}><IconConvert color="#a5f3fc" size={14}/></span>
                <span style={{
                  fontSize: 'clamp(9.5px, 1.7vw, 13px)',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                }}>Convirtiendo a imagen</span>
              </div>
            </div>

            {/* Puntos indicadores */}
            <div style={{
              display: 'flex',
              gap: 'clamp(4px, 0.8vw, 6px)',
              justifyContent: 'center',
              marginTop: 'clamp(6px, 1.2vw, 11px)',
            }}>
              <span className="npdf-dot-a" style={{
                width: 'clamp(4px, 0.8vw, 6px)',
                height: 'clamp(4px, 0.8vw, 6px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,.18)',
                display: 'inline-block'
              }} />
              <span className="npdf-dot-b" style={{
                width: 'clamp(4px, 0.8vw, 6px)',
                height: 'clamp(4px, 0.8vw, 6px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,.18)',
                display: 'inline-block'
              }} />
              <span className="npdf-dot-c" style={{
                width: 'clamp(4px, 0.8vw, 6px)',
                height: 'clamp(4px, 0.8vw, 6px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,.18)',
                display: 'inline-block'
              }} />
              <span className="npdf-dot-d" style={{
                width: 'clamp(4px, 0.8vw, 6px)',
                height: 'clamp(4px, 0.8vw, 6px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,.18)',
                display: 'inline-block'
              }} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}