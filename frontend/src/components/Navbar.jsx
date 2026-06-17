import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, FileText, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import logo from '../assets/logo.png'

const INNER_ROUTES = ['/merge', '/split', '/compress', '/convert', '/documents']

function Navbar() {
  const [modalOpen,    setModalOpen]    = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const dropRef   = useRef(null)

  const isInner = INNER_ROUTES.some(r => location.pathname.startsWith(r))

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/')
  }

  const initial = user
    ? (user.full_name || user.email || '?')[0].toUpperCase()
    : ''

  return (
    <>
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <nav style={{
        background: 'rgba(1,1,2,0.45)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(167,139,250,.2)',
        padding: '0 clamp(12px, 4vw, 24px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          height: 64, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 8,
        }}>

          {/* ── Lado izquierdo ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 0, flexShrink: 1 }}>

            {isInner && (
              <button
                onClick={() => navigate(-1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,.45)',
                  cursor: 'pointer', fontSize: 13,
                  padding: '6px 8px 6px 0',
                  transition: 'color .18s',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                <span className="nav-back-label">Volver</span>
              </button>
            )}

            {isInner && (
              <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,.12)', margin: '0 10px', flexShrink: 0 }} />
            )}

            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', minWidth: 0, flexShrink: 1 }}
            >
              <img src={logo} alt="Logo" style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }} />
              <span style={{
                fontFamily: '"Lato", sans-serif',
                fontWeight: 900, fontSize: 19,
                letterSpacing: '0.4px', color: 'white',
                whiteSpace: 'nowrap',
              }}>
                Neat<span style={{ color: 'var(--purple)' }}>PDF</span>
              </span>
            </div>
          </div>

          {/* ── Lado derecho ── */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

              {/* Mis documentos */}
              <button
                onClick={() => navigate('/documents')}
                title="Mis documentos"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: '"Lato", sans-serif',
                  fontWeight: 600, fontSize: 13,
                  color: location.pathname === '/documents' ? '#c4b5fd' : 'rgba(255,255,255,.6)',
                  background: location.pathname === '/documents' ? 'rgba(167,139,250,.12)' : 'transparent',
                  border: `1.5px solid ${location.pathname === '/documents' ? 'rgba(167,139,250,.35)' : 'rgba(255,255,255,.12)'}`,
                  borderRadius: 999,
                  height: 36,
                  padding: '0 14px',
                  boxSizing: 'border-box',
                  cursor: 'pointer', transition: 'all .2s ease',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (location.pathname !== '/documents') {
                    e.currentTarget.style.color = '#c4b5fd'
                    e.currentTarget.style.borderColor = 'rgba(167,139,250,.35)'
                    e.currentTarget.style.background = 'rgba(167,139,250,.08)'
                  }
                }}
                onMouseLeave={e => {
                  if (location.pathname !== '/documents') {
                    e.currentTarget.style.color = 'rgba(255,255,255,.6)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <FileText size={14} style={{ flexShrink: 0 }} />
                <span className="nav-docs-label">Mis documentos</span>
              </button>

              {/* Chip de usuario con dropdown */}
              <div ref={dropRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: dropdownOpen ? 'rgba(167,139,250,.15)' : 'rgba(255,255,255,.06)',
                    border: `1.5px solid ${dropdownOpen ? 'rgba(167,139,250,.4)' : 'rgba(255,255,255,.12)'}`,
                    borderRadius: 999,
                    height: 36,
                    padding: '0 10px 0 5px',
                    boxSizing: 'border-box',
                    cursor: 'pointer', transition: 'all .2s ease',
                  }}
                  onMouseEnter={e => {
                    if (!dropdownOpen) {
                      e.currentTarget.style.background = 'rgba(167,139,250,.1)'
                      e.currentTarget.style.borderColor = 'rgba(167,139,250,.3)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!dropdownOpen) {
                      e.currentTarget.style.background = 'rgba(255,255,255,.06)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'
                    }
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--purple)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    flexShrink: 0,
                  }}>
                    {initial}
                  </div>
                  <ChevronDown
                    size={13}
                    color="rgba(255,255,255,.5)"
                    style={{ flexShrink: 0, transition: 'transform .2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {dropdownOpen && (
                  <div className="nav-dropdown" style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                    width: 210, maxWidth: 'calc(100vw - 24px)',
                    background: 'rgba(14,11,28,.97)',
                    border: '1px solid rgba(167,139,250,.18)',
                    borderRadius: 14,
                    boxShadow: '0 20px 40px rgba(0,0,0,.7)',
                    overflow: 'hidden',
                    animation: 'dropdownIn .18s cubic-bezier(.34,1.4,.64,1) both',
                    zIndex: 100,
                  }}>
                    <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--purple)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#fff',
                        marginBottom: 8,
                      }}>
                        {initial}
                      </div>
                      {user.full_name && (
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 2px', wordBreak: 'break-word' }}>
                          {user.full_name}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', margin: 0, wordBreak: 'break-all' }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Mis documentos — visible también aquí en pantallas chicas */}
                    <button
                      onClick={() => { setDropdownOpen(false); navigate('/documents') }}
                      className="nav-dropdown-docs"
                      style={{
                        width: '100%', padding: '12px 16px',
                        display: 'none', alignItems: 'center', gap: 10,
                        background: 'transparent', border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,.07)',
                        color: 'rgba(255,255,255,.6)',
                        fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,.08)'; e.currentTarget.style.color = '#c4b5fd' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.6)' }}
                    >
                      <FileText size={14} />
                      Mis documentos
                    </button>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'transparent', border: 'none',
                        color: 'rgba(255,255,255,.5)',
                        fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.08)'; e.currentTarget.style.color = '#fca5a5' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.5)' }}
                    >
                      <LogOut size={14} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                fontFamily: '"Lato", sans-serif',
                fontWeight: 700, fontSize: 13.5,
                color: '#c4b5fd', background: 'transparent',
                border: '1.5px solid rgba(167,139,250,.5)',
                borderRadius: 999, padding: '7px 18px',
                cursor: 'pointer', letterSpacing: '.02em',
                transition: 'all .22s ease', whiteSpace: 'nowrap', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,.2)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(167,139,250,.5)'; e.currentTarget.style.color = '#c4b5fd' }}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </nav>

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* Pantallas medianas: ocultar texto "Mis documentos" del botón principal,
           pero mostrarlo dentro del dropdown en su lugar */
        @media (max-width: 560px) {
          .nav-docs-label { display: none; }
          .nav-dropdown-docs { display: flex !important; }
        }

        /* Pantallas muy chicas: ocultar texto "Volver", solo flecha */
        @media (max-width: 400px) {
          .nav-back-label { display: none; }
        }
      `}</style>
    </>
  )
}

export default Navbar