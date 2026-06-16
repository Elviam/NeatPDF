import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

function LoginModal({ open, onClose }) {
  const { login, register } = useAuth()

  const [mode, setMode]         = useState('login')   // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Resetear estado al abrir/cerrar
  useEffect(() => {
    if (!open) {
      setMode('login')
      setEmail('')
      setPassword('')
      setFullName('')
      setError('')
      setLoading(false)
    }
  }, [open])

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

  const handleSubmit = async () => {
    setError('')

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    if (mode === 'register' && !fullName) {
      setError('Por favor ingresa tu nombre')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, fullName)
      }
      onClose()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail === 'Correo o contraseña incorrectos') {
        setError('Correo o contraseña incorrectos')
      } else if (detail === 'Ese correo ya está registrado') {
        setError('Ese correo ya está registrado')
      } else {
        setError('Ocurrió un error, intenta de nuevo')
      }
    } finally {
      setLoading(false)
    }
  }

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
            position: 'absolute', top: 14, right: 14,
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,.05)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: 'rgba(255,255,255,.35)', transition: 'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,181,254,.12)'; e.currentTarget.style.color = '#c4b5fd' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.35)' }}
        >✕</button>

        {/* logo */}
        <div style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt="NeatPDF" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <h2 style={{
          fontFamily: '"Lato", sans-serif', fontWeight: 700,
          fontSize: 22, color: '#fff',
          textAlign: 'center', marginBottom: 4, letterSpacing: '-.2px',
        }}>
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
        </h2>

        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,.35)',
          textAlign: 'center', marginBottom: 20,
          fontStyle: 'italic', fontFamily: 'Georgia, serif',
        }}>
          Accede para guardar tus documentos
        </p>

        {/* nota opcional */}
        <div style={{
          background: 'rgba(139,92,246,.07)',
          border: '1px solid rgba(167,139,250,.16)',
          borderRadius: 10, padding: '10px 14px',
          fontSize: 12, color: 'rgba(255,255,255,.42)',
          textAlign: 'center', marginBottom: 20, lineHeight: 1.6,
        }}>
          <span style={{ color: '#c4b5fd' }}>El login es opcional.</span>
          {' '}Puedes usar todas las herramientas sin cuenta.
        </div>

        {/* nombre — solo en registro */}
        {mode === 'register' && (
          <input
            className="login-input"
            type="text"
            placeholder="Tu nombre"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px', marginBottom: 9,
              borderRadius: 11, border: '1px solid rgba(255,255,255,.09)',
              background: 'rgba(255,255,255,.04)',
              fontFamily: '"Lato", sans-serif', fontSize: 14, color: '#fff',
              transition: 'all .18s', boxSizing: 'border-box',
            }}
          />
        )}

        <input
          className="login-input"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px', marginBottom: 9,
            borderRadius: 11, border: '1px solid rgba(255,255,255,.09)',
            background: 'rgba(255,255,255,.04)',
            fontFamily: '"Lato", sans-serif', fontSize: 14, color: '#fff',
            transition: 'all .18s', boxSizing: 'border-box',
          }}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          style={{
            width: '100%', padding: '11px 14px', marginBottom: 16,
            borderRadius: 11, border: '1px solid rgba(255,255,255,.09)',
            background: 'rgba(255,255,255,.04)',
            fontFamily: '"Lato", sans-serif', fontSize: 14, color: '#fff',
            transition: 'all .18s', boxSizing: 'border-box',
          }}
        />

        {/* error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,.1)',
            border: '1px solid rgba(239,68,68,.3)',
            color: '#fca5a5',
            borderRadius: 9, padding: '9px 14px',
            fontSize: 13, marginBottom: 14, textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            borderRadius: 999,
            background: loading
              ? 'rgba(139,92,246,.4)'
              : 'linear-gradient(135deg, #8b5cf6, #14b8a6)',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: '"Lato", sans-serif', fontWeight: 700,
            fontSize: 14, color: '#fff',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(139,92,246,.35)',
            transition: 'all .22s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(139,92,246,.5)' } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 20px rgba(139,92,246,.35)' }}
        >
          {loading ? (
            <>
              <div style={{
                width: 15, height: 15,
                border: '2px solid rgba(255,255,255,.3)',
                borderTop: '2px solid #fff',
                borderRadius: '50%',
                animation: 'spin .7s linear infinite',
              }} />
              {mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
            </>
          ) : (
            mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
          )}
        </button>

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12.5, color: 'rgba(255,255,255,.25)' }}>
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ color: '#c4b5fd', cursor: 'pointer', fontWeight: 700 }}
          >
            {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
          </span>
        </p>

        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    </div>
  )
}

export default LoginModal