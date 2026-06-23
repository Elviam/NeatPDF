import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'

const LAST_UPDATED = '21 de junio de 2026'

const SECTIONS = [
  {
    title: '1. Información que recopilamos',
    blocks: [
      { subtitle: 'Datos de cuenta', text: 'Cuando creas una cuenta mediante Google OAuth, recopilamos tu nombre y dirección de correo electrónico. Esta información se utiliza exclusivamente para autenticarte y asociar tus documentos a tu perfil. No recopilamos ningún otro dato personal.' },
      { subtitle: 'Documentos procesados', text: 'Los archivos de usuarios autenticados se almacenan en tu cuenta hasta que los elimines manualmente. Los archivos de usuarios no autenticados se procesan en memoria RAM y se eliminan permanentemente al finalizar la descarga, sin que se escriba ningún dato en disco.' },
      { subtitle: 'Datos técnicos', text: 'No recopilamos información sobre tu dispositivo, navegador, comportamiento de navegación ni patrones de uso. No empleamos herramientas de analítica de terceros.' },
    ],
  },
  {
    title: '2. Cómo usamos tu información',
    blocks: [
      { subtitle: null, text: 'La información de tu cuenta se utiliza únicamente para autenticarte en cada sesión, mostrar tu nombre en la interfaz y vincular los documentos que eliges guardar a tu perfil. Nunca usamos tus datos para publicidad, perfilado ni ningún fin distinto al funcionamiento del servicio.' },
    ],
  },
  {
    title: '3. Almacenamiento y retención de archivos',
    blocks: [
      { subtitle: 'Usuarios autenticados', text: 'Los archivos que procesas con sesión activa se almacenan en tu cuenta de forma indefinida. Puedes eliminar cualquier archivo en cualquier momento desde tu panel. La eliminación es inmediata y permanente.' },
      { subtitle: 'Usuarios no autenticados', text: 'Ningún archivo se almacena en el servidor. El procesamiento ocurre en memoria y, al completar la descarga, los datos se descartan de forma permanente. No se genera ninguna sesión, registro ni identificador asociado al archivo.' },
    ],
  },
  {
    title: '4. Cookies y tecnologías de seguimiento',
    blocks: [
      { subtitle: null, text: 'NeatPDF no utiliza cookies de seguimiento, cookies de publicidad ni herramientas de analítica de terceros como Google Analytics o Hotjar. El único mecanismo de almacenamiento local que empleamos es localStorage/sessionStorage del navegador para conservar el token de sesión (JWT), necesario para mantener tu sesión activa. Este token no se comparte con terceros.' },
    ],
  },
  {
    title: '5. Compartición de datos con terceros',
    blocks: [
      { subtitle: null, text: 'No vendemos, alquilamos ni compartimos tu información personal ni tus documentos con terceros. El único servicio externo que interviene en el funcionamiento de NeatPDF es Google OAuth, utilizado exclusivamente como mecanismo de autenticación. NeatPDF no tiene acceso a tu cuenta de Google más allá del nombre y correo electrónico que autorizas durante el inicio de sesión.' },
    ],
  },
  {
    title: '6. Seguridad',
    blocks: [
      { subtitle: null, text: 'Implementamos medidas de seguridad razonables para proteger la información almacenada en nuestros servidores. Las comunicaciones entre tu navegador y nuestro servidor se realizan a través de conexiones cifradas (HTTPS). Sin embargo, ningún sistema de transmisión o almacenamiento digital puede garantizar una seguridad absoluta.' },
    ],
  },
  {
    title: '7. Cambios a esta política',
    blocks: [
      { subtitle: null, text: 'Podemos actualizar esta Política de Privacidad ocasionalmente. Cuando lo hagamos, revisaremos la fecha al inicio del documento. El uso continuado del servicio tras la publicación de cambios constituye tu aceptación de la política actualizada.' },
    ],
  },
]

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,77,255,.16) 0%,transparent 70%)', top: -140, left: -160, filter: 'blur(80px)', animation: 'orbDrift1 24s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,rgba(147,197,253,.12) 0%,transparent 70%)', top: '8%', right: -120, filter: 'blur(80px)', animation: 'orbDrift2 28s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(110,231,183,.10) 0%,transparent 70%)', bottom: '6%', left: '8%', filter: 'blur(80px)', animation: 'orbDrift3 26s ease-in-out infinite alternate' }} />
      </div>

      <style>{`
        @keyframes orbDrift1 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.06)} 100%{transform:translate(-20px,40px) scale(.96)} }
        @keyframes orbDrift2 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-35px,25px) scale(1.04)} 100%{transform:translate(28px,-20px) scale(.98)} }
        @keyframes orbDrift3 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,35px) scale(1.05)} 100%{transform:translate(-30px,-18px) scale(.97)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        .doc-section {
          padding: 32px 0;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .doc-section:last-child { border-bottom: none; }

        .doc-section-title {
          font-size: 15px;
          font-weight: 700;
          color: rgba(255,255,255,.9);
          margin: 0 0 16px;
          letter-spacing: -.1px;
        }

        .doc-subtitle {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.3px;
          text-transform: uppercase;
          color: var(--purple, #a78bfa);
          margin: 0 0 6px;
          opacity: .8;
        }

        .doc-text {
          font-size: 15px;
          color: rgba(255,255,255,.5);
          line-height: 1.85;
          margin: 0 0 20px;
          font-weight: 300;
        }
        .doc-text:last-child { margin-bottom: 0; }
      `}</style>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '60px 32px 120px', position: 'relative', zIndex: 1, animation: 'fadeUp .6s ease both' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.25)', flexShrink: 0 }}>
              <Shield size={22} color="var(--purple)" />
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 34, color: '#fff', letterSpacing: '-0.8px', margin: 0, lineHeight: 1.1 }}>
              Privacidad y datos
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.28)', margin: '0 0 8px', paddingLeft: 62 }}>
            Última actualización: {LAST_UPDATED}
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.45)', lineHeight: 1.75, fontWeight: 300, margin: 0, paddingLeft: 62, maxWidth: 560 }}>
            En NeatPDF nos tomamos en serio la privacidad de tus datos. Esta política explica qué información recopilamos, cómo la usamos y cómo la protegemos.
          </p>
        </div>

        {/* Sections */}
        <div>
          {SECTIONS.map((section) => (
            <div key={section.title} className="doc-section">
              <h2 className="doc-section-title">{section.title}</h2>
              {section.blocks.map((block, j) => (
                <div key={j}>
                  {block.subtitle && <p className="doc-subtitle">{block.subtitle}</p>}
                  <p className="doc-text">{block.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  )
}