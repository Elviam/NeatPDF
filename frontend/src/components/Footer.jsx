import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

const TOOLS = [
  { label: 'Unir PDF',       path: '/merge' },
  { label: 'Separar PDF',    path: '/split' },
  { label: 'Comprimir PDF',  path: '/compress' },
  { label: 'PDF a Imagen',   path: '/convert' },
]

const RESOURCES = [
  { label: 'Cómo usar NeatPDF',    path: '/how-to-use' },
  { label: 'Preguntas frecuentes', path: '/faq'},
]

const LEGAL = [
  { label: 'Privacidad y datos',  path: '/privacy' },
  { label: 'Términos de uso',     path: '/terms' },
]

export default function Footer() {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        .footer-link {
          display: block;
          font-size: 13.5px;
          color: rgba(255,255,255,.42);
          text-decoration: none;
          margin-bottom: 11px;
          transition: color .18s;
          cursor: pointer;
        }
        .footer-link:hover { color: #fff; }

        .footer-social {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
          color: rgba(255,255,255,.5);
          text-decoration: none;
          transition: all .18s;
        }
        .footer-social:hover {
          border-color: rgba(167,139,250,.4);
          background: rgba(139,92,246,.12);
          color: #c4b5fd;
        }

        .footer-col-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,.28);
          margin-bottom: 18px;
        }

        .neat-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
        }

        @media (max-width: 900px) {
          .neat-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }
        }

        @media (max-width: 520px) {
          .neat-footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-bottom-row {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
        }
      `}</style>

      <footer style={{
        marginTop: 80,
        borderTop: '1px solid rgba(255,255,255,.08)',
        paddingTop: 52,
        paddingBottom: 32,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 32px' }}>

          {/* Grid principal */}
          <div className="neat-footer-grid" style={{ marginBottom: 40 }}>

            {/* ── Columna 1: Marca ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <img src={logo} alt="NeatPDF" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
                <span style={{ fontFamily: '"Lato", sans-serif', fontWeight: 900, fontSize: 19, color: 'white', letterSpacing: '.3px' }}>
                  Neat<span style={{ color: 'var(--purple)' }}>PDF</span>
                </span>
              </div>

              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.42)', lineHeight: 1.8, maxWidth: 260, margin: '0 0 20px', fontWeight: 300 }}>
                Edita y organiza tus archivos PDF de forma rápida, segura y privada, directamente desde tu navegador.
              </p>

              {/* Badge seguridad */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(110,231,183,.07)', border: '1px solid rgba(110,231,183,.16)', borderRadius: 999, padding: '6px 13px', fontSize: 11.5, color: '#6ee7b7', marginBottom: 22 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Procesamiento seguro y privado
              </div>

              {/* Redes sociales */}
              <div style={{ display: 'flex', gap: 8 }}>
                {/* GitHub */}
                <a href="https://github.com/elviam" target="_blank" rel="noopener noreferrer" className="footer-social" title="GitHub">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a href="https://www.linkedin.com/in/elvia-guti%C3%A9rrez-85b139352" target="_blank" rel="noopener noreferrer" className="footer-social" title="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* ── Columna 2: Herramientas ── */}
            <div>
              <div className="footer-col-title">Herramientas</div>
              {TOOLS.map(t => (
                <span key={t.path} className="footer-link" onClick={() => navigate(t.path)}>
                  {t.label}
                </span>
              ))}
            </div>

           {/* ── Columna 3: Recursos ── */}
            <div>
              <div className="footer-col-title">Recursos</div>
              {RESOURCES.map(r => (
                <span
                  key={r.label}
                  className="footer-link"
                  onClick={() => r.path && navigate(r.path)}
                >
                  {r.label}
                </span>
              ))}
            </div>

            {/* ── Columna 4: Legal ── */}
            <div>
              <div className="footer-col-title">Legal</div>
              {LEGAL.map(l => (
                <span
                  key={l.label}
                  className="footer-link"
                  onClick={() => navigate(l.path)}
                >
                  {l.label}
                </span>
              ))}
            </div>

          </div>

          {/* Línea inferior */}
          <div
            className="footer-bottom-row"
            style={{
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>
              © 2026 NeatPDF
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.18)' }}>
              Hecho con ♥ por{' '}
              <a 
                href="https://www.linkedin.com/in/elvia-guti%C3%A9rrez-85b139352"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,.25)', textDecoration: 'none', transition: 'color .18s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.5)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.25)'}
              >
                Elvia
              </a>
            </span>
          </div>

        </div>
      </footer>
    </>
  )
}