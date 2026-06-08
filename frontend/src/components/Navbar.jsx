import { FileText } from 'lucide-react'

function Navbar() {
  return (
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
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #8b5cf6, #14b8a6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px rgba(139,92,246,.4)',
          }}>
            <FileText size={17} color="white" strokeWidth={2} />
          </div>
          <span style={{
            fontFamily: '"Lato", sans-serif',
            fontWeight: 900,
            fontSize: 21,
            letterSpacing: '0.5px',
            color: 'white',
          }}>
            Neat<span style={{
              background: 'linear-gradient(90deg, #c4b5fd, #6ee7b7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>PDF</span>
          </span>
        </div>

        {/* Botón Iniciar Sesión */}
        <button
          onClick={() => {}}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(139,92,246,.2)'
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(167,139,250,.5)'
            e.currentTarget.style.color = '#c4b5fd'
            e.currentTarget.style.boxShadow = 'none'
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
  )
}

export default Navbar