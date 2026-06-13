import { useEffect } from 'react'
import logo from '../assets/logo.png'

function LoginModal({ open, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(5,4,15,.6)',
        backdropFilter: 'blur(18px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'modalFadeIn .22s ease both',
      }}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .login-input::placeholder {
          color: rgba(255,255,255,.25);
        }

        .login-input:focus {
          border-color: rgba(167,139,250,.5) !important;
          background: rgba(255,255,255,.07) !important;
          outline: none;
        }

        .login-social:hover {
          border-color: rgba(167,139,250,.35) !important;
          background: rgba(139,92,246,.08) !important;
        }
      `}</style>

      <div
        style={{
          background: 'rgba(14,11,28,.95)',
          border: '1px solid rgba(167,139,250,.18)',
          borderRadius: 24,
          padding: '40px 36px 36px',
          width: 400,
          maxWidth: '100%',
          position: 'relative',
          boxShadow:
            '0 40px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.04)',
          animation:
            'modalSlideUp .3s cubic-bezier(.34,1.4,.64,1) both',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.05)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: 'rgba(255,255,255,.35)',
            transition: 'all .18s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'rgba(196,181,254,.12)'
            e.currentTarget.style.color = '#c4b5fd'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'rgba(255,255,255,.05)'
            e.currentTarget.style.color =
              'rgba(255,255,255,.35)'
          }}
        >
          ✕
        </button>

        <div
            style={{
                width: 64,
                height: 64,
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            >
            <img
                src={logo}
                alt="NeatPDF"
                style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                }}
            />
            </div>

        <h2
          style={{
            fontFamily: '"Lato", sans-serif',
            fontWeight: 700,
            fontSize: 22,
            color: '#fff',
            textAlign: 'center',
            marginBottom: 4,
            letterSpacing: '-.2px',
          }}
        >
          Bienvenido de vuelta
        </h2>

        <p
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,.35)',
            textAlign: 'center',
            marginBottom: 20,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
          }}
        >
          Accede para guardar tus documentos
        </p>

        <div
          style={{
            background: 'rgba(139,92,246,.07)',
            border: '1px solid rgba(167,139,250,.16)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 12,
            color: 'rgba(255,255,255,.42)',
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: '#c4b5fd' }}>
            El login es opcional.
          </span>{' '}
          Puedes usar todas las herramientas sin cuenta.
        </div>

        <input
          className="login-input"
          type="email"
          placeholder="correo@ejemplo.com"
          style={{
            width: '100%',
            padding: '11px 14px',
            marginBottom: 9,
            borderRadius: 11,
            border: '1px solid rgba(255,255,255,.09)',
            background: 'rgba(255,255,255,.04)',
            color: '#fff',
          }}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Contraseña"
          style={{
            width: '100%',
            padding: '11px 14px',
            marginBottom: 16,
            borderRadius: 11,
            border: '1px solid rgba(255,255,255,.09)',
            background: 'rgba(255,255,255,.04)',
            color: '#fff',
          }}
        />

        <button
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 999,
            background:
              'linear-gradient(135deg,#8b5cf6,#14b8a6)',
            border: 'none',
            cursor: 'pointer',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  )
}

export default LoginModal