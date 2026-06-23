import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, FileText, Zap, Shield, Database, AlertCircle, Users, Settings, ChevronDown } from 'lucide-react'

const FAQ_ITEMS = [
  {
    icon: HelpCircle,
    question: '¿Qué es NeatPDF?',
    answer: 'NeatPDF es una plataforma web gratuita que te permite editar, organizar y transformar tus archivos PDF de forma rápida y segura. Ofrece herramientas como unir, separar, comprimir y convertir PDF a imágenes, todo directamente desde tu navegador sin necesidad de instalar software adicional.',
  },
  {
    icon: Zap,
    question: '¿Es gratuito?',
    answer: 'Sí, NeatPDF es completamente gratuito. Todas las herramientas están disponibles sin costo, sin límites de uso diario y sin necesidad de suscripciones. Nuestro objetivo es hacer que la edición de PDF sea accesible para todos.',
  },
  {
    icon: Users,
    question: '¿Necesito crear una cuenta para usar las herramientas?',
    answer: 'No, puedes usar todas las herramientas sin necesidad de registrarte. Sin embargo, si creas una cuenta gratuita, podrás guardar tus documentos procesados en la nube, acceder a ellos desde cualquier dispositivo y mantener un historial de tus archivos.',
  },
  {
    icon: Shield,
    question: '¿Dónde se procesan mis archivos?',
    answer: 'Todos los archivos se procesan en nuestros servidores seguros mediante un backend construido con FastAPI. El archivo viaja desde tu navegador hasta el servidor, se transforma con bibliotecas especializadas y el resultado se devuelve directamente a tu dispositivo. En ningún momento se comparte con servicios de terceros.',
  },
  {
    icon: Database,
    question: '¿Se guardan mis archivos en el servidor?',
    answer: 'Depende de tu estado de cuenta. Usuarios no autenticados: el PDF se procesa en memoria RAM y se elimina permanentemente en cuanto completas la descarga, sin que se escriba ningún dato en disco. Usuarios autenticados: los archivos se almacenan en tu cuenta hasta que los elimines manualmente desde tu panel.',
  },
  {
    icon: Settings,
    question: '¿Hay límite en el tamaño de los archivos?',
    answer: 'Sí, el tamaño máximo permitido por archivo es de 50 MB. Este límite asegura un procesamiento rápido y eficiente para todos los usuarios.',
  },
  {
    icon: AlertCircle,
    question: '¿Qué hago si tengo problemas técnicos?',
    answer: 'Si encuentras algún problema, verifica que tu archivo no exceda los 50 MB y que sea un PDF válido y no esté dañado. Intenta con otro navegador (recomendamos Chrome o Firefox actualizados).',
  },
  {
    icon: FileText,
    question: '¿Los usuarios sin cuenta dejan algún rastro?',
    answer: 'No. No se guarda ningún archivo, no se crea ninguna sesión y no se almacena ninguna información. El archivo se procesa en memoria RAM y se descarta inmediatamente. Tampoco utilizamos herramientas de analítica de terceros ni cookies de seguimiento.',
  },
]

export default function FAQ() {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(prev => prev === i ? null : i)

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

        .faq-item {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color .25s ease;
        }
        .faq-item:hover { border-color: rgba(167,139,250,.25); }
        .faq-item.open { border-color: rgba(167,139,250,.35); background: rgba(139,92,246,.06); }

        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 22px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .faq-chevron {
          transition: transform .25s ease;
          flex-shrink: 0;
          margin-left: auto;
        }
        .faq-chevron.open { transform: rotate(180deg); }

        .faq-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height .35s ease, opacity .25s ease;
          opacity: 0;
        }
        .faq-body.open {
          max-height: 600px;
          opacity: 1;
        }
      `}</style>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '60px 32px 120px', position: 'relative', zIndex: 1 }}>

        <div style={{ animation: 'fadeUp .7s ease both', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.25)' }}>
              <HelpCircle size={24} color="var(--purple)" />
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 36, color: '#fff', letterSpacing: '-1px', margin: 0 }}>
              Preguntas frecuentes
            </h1>
          </div>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, fontWeight: 300, margin: 0, paddingLeft: 62 }}>
            Encuentra respuestas a las preguntas más comunes sobre NeatPDF.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ_ITEMS.map((item, i) => {
            const Icon = item.icon
            const isOpen = openIndex === i
            return (
              <div key={i} className={`faq-item${isOpen ? ' open' : ''}`} style={{ animation: `fadeUp .5s ease ${i * 0.05}s both` }}>
                <button className="faq-trigger" onClick={() => toggle(i)}>
                  <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,.12)' }}>
                    <Icon size={18} color="var(--purple)" />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>
                    {item.question}
                  </span>
                  <ChevronDown size={18} color="rgba(255,255,255,.4)" className={`faq-chevron${isOpen ? ' open' : ''}`} />
                </button>
                <div className={`faq-body${isOpen ? ' open' : ''}`}>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.8, fontWeight: 300, margin: 0, padding: '0 24px 22px 76px' }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}