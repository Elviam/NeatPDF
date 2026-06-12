import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <>
      <style>{`
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .neat-footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
        }

        .footer-link {
          display: block;
          font-size: 14px;
          color: rgba(255,255,255,.45);
          text-decoration: none;
          margin-bottom: 12px;
          transition: color .2s;
        }

        .footer-link:hover {
          color: white;
        }

        @media (max-width: 768px) {
          .neat-footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .neat-footer-bottom {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>

      <footer
        style={{
          marginTop: 80,
          borderTop: '1px solid rgba(255,255,255,.08)',
          paddingTop: 48,
          paddingBottom: 32,
        }}
      >
        <div className="footer-container">
          <div
            className="neat-footer-grid"
            style={{
              marginBottom: 36,
            }}
          >
            {/* Marca */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <img
                  src={logo}
                  alt="NeatPDF"
                  style={{
                    width: 42,
                    height: 42,
                    objectFit: 'contain',
                  }}
                />

                <span
                  style={{
                    fontFamily: '"Lato", sans-serif',
                    fontWeight: 900,
                    fontSize: 20,
                    color: 'white',
                    letterSpacing: '.3px',
                  }}
                >
                  Neat
                  <span
                    style={{
                      color: 'var(--purple)',}}
                  >
                    PDF
                  </span>
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,.45)',
                  lineHeight: 1.8,
                  maxWidth: 280,
                  margin: '0 0 18px',
                  fontWeight: 300,
                }}
              >
                Edita y organiza tus archivos PDF de forma rápida,
                segura y privada, directamente desde tu navegador.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(110,231,183,.08)',
                  border: '1px solid rgba(110,231,183,.18)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  color: '#6ee7b7',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>

                Procesamiento seguro y privado
              </div>
            </div>

            {/* Herramientas */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.28)',
                  marginBottom: 18,
                }}
              >
                Herramientas
              </div>

              {[
                'Unir PDF',
                'Separar PDF',
                'Comprimir PDF',
                'PDF a Imagen',
              ].map((t) => (
                <a
                  key={t}
                  href="#"
                  className="footer-link"
                >
                  {t}
                </a>
              ))}
            </div>

            {/* Información */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.28)',
                  marginBottom: 18,
                }}
              >
                Información
              </div>

              {[
                'Acerca de',
                'Privacidad',
                'Términos de uso',
                'Contacto',
              ].map((t) => (
                <a
                  key={t}
                  href="#"
                  className="footer-link"
                >
                  {t}
                </a>
              ))}
            </div>
          </div>

          <div
            className="neat-footer-bottom"
            style={{
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,.06)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,.28)',
              }}
            >
              © 2026 NeatPDF
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}