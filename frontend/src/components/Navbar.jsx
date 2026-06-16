import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import logo from '../assets/logo.png'

function Navbar() {
  const [modalOpen, setModalOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
            <img src={logo} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span style={{
              fontFamily: '"Lato", sans-serif',
              fontWeight: 900, fontSize: 21,
              letterSpacing: '0.5px', color: 'white',
            }}>
              Neat<span style={{ color: 'var(--purple)' }}>PDF</span>
            </span>
          </div>

          {/* Auth area */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

              {/* Mis documentos */}
              <button
                onClick={() => navigate('/documents')}
                style={{
                  fontFamily: '"Lato", sans-serif',
                  fontWeight: 600, fontSize: 13,
                  color: 'rgba(255,255,255,.55)',
                  background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,.12)',
                  borderRadius: 999, padding: '7px 16px',
                  cursor: 'pointer', transition: 'all .22s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#c4b5fd'
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,.55)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'
                }}
              >
                Mis documentos
              </button>

              {/* Nombre del usuario */}
              <span style={{
                fontSize: 13, color: 'rgba(255,255,255,.5)',
                fontFamily: '"Lato", sans-serif',
                maxWidth: 180, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.full_name || user.email}
              </span>

              {/* Salir */}
              <button
                onClick={logout}
                title="Cerrar sesión"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: '"Lato", sans-serif',
                  fontWeight: 600, fontSize: 13,
                  color: 'rgba(255,255,255,.45)',
                  background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,.12)',
                  borderRadius: 999, padding: '7px 16px',
                  cursor: 'pointer', transition: 'all .22s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fca5a5'
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,.4)'
                  e.currentTarget.style.background = 'rgba(239,68,68,.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,.45)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <LogOut size={14} />
                Salir
              </button>

            </div>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                fontFamily: '"Lato", sans-serif',
                fontWeight: 700, fontSize: 13.5,
                color: '#c4b5fd', background: 'transparent',
                border: '1.5px solid rgba(167,139,250,.5)',
                borderRadius: 999, padding: '7px 22px',
                cursor: 'pointer', letterSpacing: '.02em',
                transition: 'all .22s ease',
              }}
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
            >
              Iniciar sesión
            </button>
          )}

        </div>
      </nav>
    </>
  )
}

export default Navbar