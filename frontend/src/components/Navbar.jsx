import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import logo from '../assets/logo.png'
 
/* ─── Modal de login ─── */
function LoginModal({ open, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
 
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
 
  if (!open) return null
 
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,4,15,.6)',
        backdropFilter: 'blur(18px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'modalFadeIn .22s ease both',
      }}
    >
      <style>{`
        @keyframes modalFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes modalSlideUp { from { opacity:0; transform:translateY(18px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        .login-input::placeholder { color: rgba(255,255,255,.25); }
        .login-input:focus { border-color: rgba(167,139,250,.5) !important; background: rgba(255,255,255,.07) !important; outline: none; }
        .login-social:hover { border-color: rgba(167,139,250,.35) !important; background: rgba(139,92,246,.08) !important; }
      `}</style>
 
      <div style={{
        background: 'rgba(14,11,28,.95)',
        border: '1px solid rgba(167,139,250,.18)',
        borderRadius: 24,
        padding: '40px 36px 36px',
        width: 400, maxWidth: '100%',
        position: 'relative',
        boxShadow: '0 40px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.04)',
        animation: 'modalSlideUp .3s cubic-bezier(.34,1.4,.64,1) both',
      }}>
 
        {/* cerrar */}
        <button
          onClick={onClose}
          style={{
            position:'absolute', top:14, right:14,
            width:28, height:28, borderRadius:'50%',
            background:'rgba(255,255,255,.05)', border:'none',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, color:'rgba(255,255,255,.35)',
            transition:'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(196,181,254,.12)'; e.currentTarget.style.color='#c4b5fd' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.color='rgba(255,255,255,.35)' }}
        >✕</button>
 
        {/* ícono */}
        <div style={{
          width:46, height:46, borderRadius:13, margin:'0 auto 16px',
          background:'linear-gradient(135deg,rgba(139,92,246,.2),rgba(20,184,166,.1))',
          border:'1px solid rgba(167,139,250,.2)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <FileText size={20} color="#c4b5fd" strokeWidth={1.8}/>
        </div>
 
        <h2 style={{
          fontFamily:'"Lato", sans-serif', fontWeight:700,
          fontSize:22, color:'#fff',
          textAlign:'center', marginBottom:4, letterSpacing:'-.2px',
        }}>Bienvenido de vuelta</h2>
 
        <p style={{
          fontSize:13, color:'rgba(255,255,255,.35)',
          textAlign:'center', marginBottom:20,
          fontStyle:'italic', fontFamily:'Georgia, serif',
        }}>Accede para guardar tus documentos</p>
 
        {/* nota */}
        <div style={{
          background:'rgba(139,92,246,.07)',
          border:'1px solid rgba(167,139,250,.16)',
          borderRadius:10, padding:'10px 14px',
          fontSize:12, color:'rgba(255,255,255,.42)',
          textAlign:'center', marginBottom:20, lineHeight:1.6,
        }}>
          <span style={{ color:'#c4b5fd' }}>El login es opcional.</span>
          {' '}Puedes usar todas las herramientas sin cuenta.
        </div>
 
        {/* sociales */}
        {[
          {
            label: 'Continuar con Google',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            ),
          },
          {
            label: 'Continuar con GitHub',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,.65)">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            ),
          },
        ].map(({ label, icon }) => (
          <button
            key={label}
            className="login-social"
            style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              padding:'11px', borderRadius:12, marginBottom:9,
              border:'1px solid rgba(255,255,255,.09)',
              background:'rgba(255,255,255,.03)',
              cursor:'pointer',
              fontFamily:'"Lato", sans-serif', fontSize:13.5,
              color:'rgba(255,255,255,.65)',
              transition:'all .18s',
            }}
          >{icon}{label}</button>
        ))}
 
        {/* divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0' }}>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }}/>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.22)', letterSpacing:'.03em' }}>o con tu correo</span>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }}/>
        </div>
 
        {/* inputs */}
        <input
          className="login-input"
          type="email"
          placeholder="correo@ejemplo.com"
          style={{
            width:'100%', padding:'11px 14px', marginBottom:9,
            borderRadius:11, border:'1px solid rgba(255,255,255,.09)',
            background:'rgba(255,255,255,.04)',
            fontFamily:'"Lato", sans-serif', fontSize:14, color:'#fff',
            transition:'all .18s',
          }}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Contraseña"
          style={{
            width:'100%', padding:'11px 14px', marginBottom:16,
            borderRadius:11, border:'1px solid rgba(255,255,255,.09)',
            background:'rgba(255,255,255,.04)',
            fontFamily:'"Lato", sans-serif', fontSize:14, color:'#fff',
            transition:'all .18s',
          }}
        />
 
        <button
          style={{
            width:'100%', padding:'12px',
            borderRadius:999,
            background:'linear-gradient(135deg, #8b5cf6, #14b8a6)',
            border:'none', cursor:'pointer',
            fontFamily:'"Lato", sans-serif', fontWeight:700,
            fontSize:14, color:'#fff',
            boxShadow:'0 6px 20px rgba(139,92,246,.35)',
            transition:'all .22s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(139,92,246,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(139,92,246,.35)' }}
        >Iniciar sesión</button>
 
        <p style={{ textAlign:'center', marginTop:14, fontSize:12.5, color:'rgba(255,255,255,.25)' }}>
          ¿No tienes cuenta?{' '}
          <span style={{ color:'#c4b5fd', cursor:'pointer', fontWeight:700 }}>Regístrate gratis</span>
        </p>
      </div>
    </div>
  )
}
 
/* ─── Navbar ─── */
function Navbar() {
  const [modalOpen, setModalOpen] = useState(false)
 
  return (
    <>
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
 
      <nav style={{
        background: 'rgba(1,1,2,0.45)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(167,139,250,.2)',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          height: 64, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
 
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logo} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8 }} 
            />
            <span style={{
              fontFamily: '"Lato", sans-serif',
              fontWeight: 900,
              fontSize: 21,
              letterSpacing: '0.5px',
              color: 'white',
            }}>
              Neat<span style={{
                color: 'var(--purple)'
              }}>PDF</span>
            </span>
          </div>
 
          {/* Botón Iniciar Sesión — ahora abre el modal */}
          <button
            onClick={() => setModalOpen(true)}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(139,92,246,.2)'
              e.currentTarget.style.borderColor = 'transparent'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(167,139,250,.5)'
              e.currentTarget.style.color = '#c4b5fd'
            }}
            style={{
              fontFamily: '"Lato", sans-serif',
              fontWeight: 700,
              fontSize: 13.5,
              color: '#c4b5fd',
              background: 'transparent',
              border: '1.5px solid rgba(167,139,250,.5)',
              borderRadius: 999,
              padding: '7px 22px',
              cursor: 'pointer',
              letterSpacing: '.02em',
              transition: 'all .22s ease',
            }}
          >
            Iniciar sesión
          </button>
 
        </div>
      </nav>
    </>
  )
}
 
export default Navbar