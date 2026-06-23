import { useNavigate } from 'react-router-dom'
import { ScrollText } from 'lucide-react'

const LAST_UPDATED = '21 de junio de 2026'

const SECTIONS = [
  {
    title: '1. Aceptación de los términos',
    text: 'Al acceder o utilizar NeatPDF, ya sea con o sin una cuenta registrada, aceptas quedar vinculado por estos Términos de Uso. Si no estás de acuerdo con alguno de los términos aquí descritos, te pedimos que no utilices el servicio.',
  },
  {
    title: '2. Descripción del servicio',
    text: 'NeatPDF es una aplicación web que permite a los usuarios procesar archivos PDF mediante herramientas como unión, separación, compresión y conversión a imagen. El servicio está disponible de forma gratuita, con funcionalidades adicionales para usuarios con cuenta registrada. El procesamiento se realiza en nuestro servidor y el resultado se entrega directamente al dispositivo del usuario.',
  },
  {
    title: '3. Uso aceptable',
    text: 'Te comprometes a utilizar NeatPDF exclusivamente para fines lícitos. Está prohibido usar el servicio para procesar, almacenar o distribuir contenido que infrinja derechos de propiedad intelectual, que contenga material ilegal o malicioso, o que interfiera con el funcionamiento del servicio. NeatPDF se reserva el derecho de suspender el acceso en caso de uso indebido.',
  },
  {
    title: '4. Cuentas de usuario',
    text: 'Para acceder a las funcionalidades de almacenamiento, puedes crear una cuenta mediante Google OAuth. Eres responsable de mantener la confidencialidad de tu sesión y de todas las actividades que ocurran bajo tu cuenta.',
  },
  {
    title: '5. Propiedad de los archivos',
    text: 'Conservas la propiedad total de todos los archivos que subes y procesas en NeatPDF. No reclamamos ninguna licencia ni derecho sobre tus documentos. Al subir un archivo, únicamente concedes a NeatPDF el permiso técnico mínimo necesario para procesarlo y devolverte el resultado.',
  },
  {
    title: '6. Eliminación de archivos',
    text: 'Los archivos de usuarios no autenticados se eliminan permanentemente en cuanto completas la descarga. Los archivos de usuarios autenticados permanecen en tu cuenta hasta que los elimines manualmente desde tu panel. La eliminación es inmediata e irreversible; NeatPDF no mantiene copias de seguridad de los documentos una vez eliminados.',
  },
  {
    title: '7. Limitación de responsabilidad',
    text: 'NeatPDF se proporciona "tal como está" y "según disponibilidad". No garantizamos que el servicio sea ininterrumpido, sin errores ni completamente seguro. En la máxima medida permitida por la ley aplicable, NeatPDF no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del servicio, incluyendo la pérdida de datos.',
  },
  {
    title: '8. Modificaciones al servicio y a estos términos',
    text: 'Nos reservamos el derecho de modificar o interrumpir el servicio en cualquier momento y sin previo aviso. También podemos actualizar estos Términos de Uso; cuando lo hagamos, revisaremos la fecha al inicio del documento. El uso continuado del servicio tras la publicación de cambios constituye tu aceptación de los términos actualizados.',
  },
  {
    title: '9. Ley aplicable',
    text: 'Estos términos se rigen por las leyes vigentes en México. Cualquier disputa derivada del uso del servicio se someterá a la jurisdicción de los tribunales competentes.',
  },
]

export default function Terms() {
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
          margin: 0 0 14px;
          letter-spacing: -.1px;
        }

        .doc-text {
          font-size: 15px;
          color: rgba(255,255,255,.5);
          line-height: 1.85;
          margin: 0;
          font-weight: 300;
        }
      `}</style>

      <main style={{ maxWidth: 740, margin: '0 auto', padding: '60px 32px 120px', position: 'relative', zIndex: 1, animation: 'fadeUp .6s ease both' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.25)', flexShrink: 0 }}>
              <ScrollText size={22} color="var(--purple)" />
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 34, color: '#fff', letterSpacing: '-0.8px', margin: 0, lineHeight: 1.1 }}>
              Términos de uso
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.28)', margin: '0 0 8px', paddingLeft: 62 }}>
            Última actualización: {LAST_UPDATED}
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.45)', lineHeight: 1.75, fontWeight: 300, margin: 0, paddingLeft: 62, maxWidth: 560 }}>
            Al usar NeatPDF aceptas los siguientes términos. Te recomendamos leerlos antes de utilizar el servicio.
          </p>
        </div>

        {/* Sections */}
        <div>
          {SECTIONS.map((section) => (
            <div key={section.title} className="doc-section">
              <h2 className="doc-section-title">{section.title}</h2>
              <p className="doc-text">{section.text}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}