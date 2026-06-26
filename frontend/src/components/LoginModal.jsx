import { useEffect, useState, useRef } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

/* ── password strength ──────────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 6)        score++
  if (pw.length >= 10)       score++
  if (/[A-Z]/.test(pw))     score++
  if (/[0-9]/.test(pw))     score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Débil',   color: '#ef4444', width: '25%' }
  if (score <= 2) return { label: 'Regular', color: '#f97316', width: '50%' }
  if (score <= 3) return { label: 'Buena',   color: '#eab308', width: '75%' }
  return           { label: 'Fuerte',  color: '#22c55e', width: '100%' }
}

/* ── frontend field validation (runs BEFORE any request) ────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateFields({ mode, fullName, email, password }) {
  if (mode === 'register' && !fullName.trim())
    return 'Ingresa tu nombre para continuar.'

  if (!email.trim())
    return 'Ingresa tu correo electrónico.'

  if (!EMAIL_RE.test(email.trim()))
    return '"' + email.trim() + '" no es un correo válido. Ejemplo: usuario@dominio.com'

  if (!password)
    return 'Ingresa tu contraseña.'

  if (mode === 'register' && password.length < 6)
    return 'La contraseña debe tener al menos 6 caracteres.'

  if (password.includes(' '))
    return 'La contraseña no puede contener espacios.'

  return null
}

/* ── server error mapping ────────────────────────────────────────── */
function mapServerError(err) {
  if (!err.response) {
    if (err.code === 'ERR_NETWORK' || (err.message && err.message.includes('Network')))
      return 'No se pudo conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.'
    return 'La solicitud no llegó al servidor. Intenta de nuevo.'
  }

  const status = err.response.status
  const detail = err.response.data && err.response.data.detail

  if (typeof detail === 'string') {
    if (detail === 'Correo o contraseña incorrectos' || detail === 'Correo o contraseña incorrectos')
      return 'Correo o contraseña incorrectos. Revísalos e intenta de nuevo.'
    if (detail === 'Ese correo ya está registrado' || detail === 'Ese correo ya está registrado')
      return 'Ya existe una cuenta con ese correo. Inicia sesión o usa otro correo.'
    if (detail.toLowerCase().includes('not found'))
      return 'No encontramos ninguna cuenta con ese correo. Verifica que esté bien escrito o regístrate.'
    if (detail.length < 160) return detail
  }

  if (status === 422) {
    const msgs = Array.isArray(detail)
      ? detail.map(function(e) { return e.msg || JSON.stringify(e) }).join(' | ')
      : null
    return msgs
      ? 'Datos invalidos: ' + msgs
      : 'El servidor rechazó los datos. Revisa que el correo sea válido y la contraseña tenga al menos 6 caracteres.'
  }

  if (status === 400) return 'Solicitud inválida. Revisa los datos ingresados e intenta de nuevo.'
  if (status === 401) return 'Correo o contraseña incorrectos.'
  if (status === 429) return 'Demasiados intentos seguidos. Espera un momento e intenta de nuevo.'
  if (status >= 500)  return 'El servidor tuvo un problema. Intenta de nuevo en unos minutos.'

  return 'Ocurrió un error inesperado (código ' + status + '). Intenta de nuevo o recarga la página.'
}

/* ── component ──────────────────────────────────────────────────── */
function LoginModal({ open, onClose }) {
  const { login, loginWithGoogle, register } = useAuth()

  const [mode, setMode]                   = useState('login')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [showPassword, setShowPassword]   = useState(false)
  const [fullName, setFullName]           = useState('')
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const googleBtnRef                      = useRef(null)
  const [googleBtnWidth, setGoogleBtnWidth] = useState(328)

  const strength = mode === 'register' ? getStrength(password) : null

  useEffect(() => {
    if (!open) {
      setMode('login'); setEmail(''); setPassword('')
      setFullName(''); setError(''); setLoading(false)
      setGoogleLoading(false); setShowPassword(false)
    }
  }, [open])

  useEffect(() => {
    const onKey = function(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return function() { window.removeEventListener('keydown', onKey) }
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return function() { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function measure() {
      if (googleBtnRef.current) setGoogleBtnWidth(googleBtnRef.current.offsetWidth)
    }
    var raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return function() { cancelAnimationFrame(raf); window.removeEventListener('resize', measure) }
  }, [open])

  if (!open) return null

  /* ── handlers ── */
  async function handleGoogleSuccess(credentialResponse) {
    setGoogleLoading(true); setError('')
    try {
      await loginWithGoogle(credentialResponse.credential)
      onClose()
    } catch (err) {
      setError(mapServerError(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleSubmit() {
    setError('')

    // 1. validate client-side first — never hit server with bad data
    var fieldError = validateFields({ mode, fullName, email, password })
    if (fieldError) { setError(fieldError); return }

    // 2. request
    setLoading(true)
    try {
      if (mode === 'login') await login(email.trim(), password)
      else                  await register(email.trim(), password, fullName.trim())
      onClose()
    } catch (err) {
      setError(mapServerError(err))
    } finally {
      setLoading(false)
    }
  }

  /* ── shared input style ── */
  var inputStyle = {
    width: '100%', padding: '11px 14px', marginBottom: 9, borderRadius: 11,
    border: '1px solid rgba(255,255,255,.09)', background: 'rgba(255,255,255,.04)',
    fontFamily: '"Lato", sans-serif', fontSize: 14, color: '#fff',
    transition: 'all .18s', boxSizing: 'border-box',
  }

  /* ── render ── */
  return (
    <div
      onClick={function(e) { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,4,15,.7)',
        backdropFilter: 'blur(18px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'modalFadeIn .22s ease both',
        overflowY: 'auto',
      }}
    >
      <style>{`
        @keyframes modalFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes modalSlideUp { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .login-input::placeholder { color:rgba(255,255,255,.25); }
        .login-input:focus { border-color:rgba(167,139,250,.5)!important; background:rgba(255,255,255,.07)!important; outline:none; }
        .pw-toggle:hover { color:#c4b5fd!important; }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-webkit-clear-button,
        input[type="password"]::-webkit-password-toggle {
            display: none;
        }


        @media (max-height: 680px) {
          .modal-card    { padding: 24px 20px 20px!important; }
          .modal-logo    { width:40px!important; height:40px!important; margin-bottom:8px!important; }
          .modal-title   { font-size:17px!important; margin-bottom:2px!important; }
          .modal-subtitle{ margin-bottom:10px!important; }
          .modal-notice  { display:none!important; }
        }
        @media (max-width: 430px) {
          .modal-card { padding: 28px 16px 24px!important; border-radius:18px!important; }
        }
      `}</style>

      <div
        className="modal-card"
        style={{
          background: 'rgba(14,11,28,.97)',
          border: '1px solid rgba(167,139,250,.18)',
          borderRadius: 24, padding: '36px 32px 32px',
          width: '100%', maxWidth: 400, position: 'relative',
          boxShadow: '0 40px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.04)',
          animation: 'modalSlideUp .3s cubic-bezier(.34,1.4,.64,1) both',
          boxSizing: 'border-box',
        }}
      >
        {/* close */}
        <button
          onClick={onClose}
          style={{ position:'absolute', top:14, right:14, width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,.05)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'rgba(255,255,255,.35)', transition:'all .18s' }}
          onMouseEnter={function(e){e.currentTarget.style.background='rgba(196,181,254,.12)';e.currentTarget.style.color='#c4b5fd'}}
          onMouseLeave={function(e){e.currentTarget.style.background='rgba(255,255,255,.05)';e.currentTarget.style.color='rgba(255,255,255,.35)'}}
        >✕</button>

        {/* logo */}
        <div className="modal-logo" style={{ width:60, height:60, margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={logo} alt="NeatPDF" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
        </div>

        <h2 className="modal-title" style={{ fontFamily:'"Lato",sans-serif', fontWeight:700, fontSize:21, color:'#fff', textAlign:'center', marginBottom:4, letterSpacing:'-.2px' }}>
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
        </h2>
        <p className="modal-subtitle" style={{ fontSize:13, color:'rgba(255,255,255,.35)', textAlign:'center', marginBottom:18, fontStyle:'italic', fontFamily:'Georgia,serif' }}>
          Accede para guardar tus documentos
        </p>

        <div className="modal-notice" style={{ background:'rgba(139,92,246,.07)', border:'1px solid rgba(167,139,250,.16)', borderRadius:10, padding:'9px 14px', fontSize:12, color:'rgba(255,255,255,.42)', textAlign:'center', marginBottom:18, lineHeight:1.6 }}>
          <span style={{ color:'#c4b5fd' }}>El login es opcional.</span>{' '}
          Puedes usar todas las herramientas sin cuenta.
        </div>

        {/* Google */}
        <div ref={googleBtnRef} style={{ marginBottom:14, width:'100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={function() { setError('No se pudo conectar con Google. Intenta de nuevo o usa tu correo.') }}
            theme="filled_black" shape="rectangular" size="large"
            width={googleBtnWidth} text="continue_with" locale="es"
          />
        </div>

        {/* divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'0 0 14px' }}>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }}/>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.22)', letterSpacing:'.03em' }}>o con tu correo</span>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.07)' }}/>
        </div>

        {/* name — register only */}
        {mode === 'register' && (
          <input
            className="login-input" type="text" placeholder="Nombre"
            value={fullName} onChange={function(e){setFullName(e.target.value)}}
            style={inputStyle}
          />
        )}

        {/* email */}
        <input
          className="login-input" type="email" placeholder="correo@ejemplo.com"
          value={email} onChange={function(e){setEmail(e.target.value)}}
          style={inputStyle}
        />

        {/* password with show/hide */}
        <div style={{ position:'relative', marginBottom: mode === 'register' ? 4 : 14 }}>
          <input
            className="login-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={function(e){setPassword(e.target.value)}}
            onKeyDown={function(e){ if (e.key==='Enter') handleSubmit() }}
            style={Object.assign({}, inputStyle, { marginBottom:0, paddingRight:42 })}
          />
          <button
            className="pw-toggle"
            onClick={function(){setShowPassword(function(v){return !v})}}
            tabIndex={-1}
            style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.3)', fontSize:15, lineHeight:1, padding:2, transition:'color .18s' }}
            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword
              ? <EyeOff size={15} />
              : <Eye size={15} />}
          </button>
        </div>

        {/* strength bar — register only */}
        {mode === 'register' && password.length > 0 && strength && (
          <div style={{ marginBottom:10, marginTop:2 }}>
            <div style={{ height:3, borderRadius:999, background:'rgba(255,255,255,.08)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:strength.width, background:strength.color, borderRadius:999, transition:'all .3s ease' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              <span style={{ fontSize:11, color:strength.color, fontFamily:'"Lato",sans-serif' }}>
                Seguridad: {strength.label}
              </span>
              {password.length < 6 && (
                <span style={{ fontSize:11, color:'rgba(255,255,255,.28)', fontFamily:'"Lato",sans-serif' }}>
                  mínimo 6 caracteres
                </span>
              )}
            </div>
          </div>
        )}
        {mode === 'register' && password.length === 0 && (
          <div style={{ marginBottom:10 }}/>
        )}

        {/* error box */}
        {error && (
          <div style={{
            background:'rgba(239,68,68,.1)',
            border:'1px solid rgba(239,68,68,.3)',
            color:'#fca5a5',
            borderRadius:9,
            padding:'10px 14px',
            fontSize:12.5,
            marginBottom:12,
            lineHeight:1.6,
            display:'flex',
            gap:8,
            alignItems:'flex-start',
          }}>
            <AlertCircle size={14} style={{ flexShrink:0, marginTop:2 }} />
            <span>{error}</span>
          </div>
        )}

        {/* submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width:'100%', padding:'13px',
            background: loading ? 'rgba(48,19,80,.57)' : 'var(--purple)',
            border:'none', color:'#fff', fontSize:15, fontWeight:400,
            borderRadius:10, cursor: loading ? 'not-allowed' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            transition:'all .25s',
            boxShadow: loading ? 'none' : '0 6px 10px rgba(7,14,33,.60)',
            fontFamily:'"Lato",sans-serif',
          }}
          onMouseEnter={function(e){ if(!loading){e.currentTarget.style.background='var(--purple-medium)';e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow='0 8px 15px rgba(7,14,33,.70)'}}}
          onMouseLeave={function(e){ if(!loading){e.currentTarget.style.background='var(--purple)';e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 6px 10px rgba(7,14,33,.60)'}}}
        >
          {loading ? (
            <>
              <div style={{ width:15, height:15, border:'2px solid rgba(255,255,255,.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
              {mode==='login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
            </>
          ) : (
            mode==='login' ? 'Iniciar sesión' : 'Crear cuenta'
          )}
        </button>

        <p style={{ textAlign:'center', marginTop:12, fontSize:12.5, color:'rgba(255,255,255,.25)' }}>
          {mode==='login' ? 'No tienes cuenta? ' : 'Ya tienes cuenta? '}
          <span
            onClick={function(){ setMode(mode==='login'?'register':'login'); setError(''); setPassword(''); setShowPassword(false) }}
            style={{ color:'#c4b5fd', cursor:'pointer', fontWeight:400 }}
          >
            {mode==='login' ? 'Regístrate gratis' : 'Inicia sesión'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default LoginModal