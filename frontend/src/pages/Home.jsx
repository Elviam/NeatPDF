import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

/* ─────────────────────────────────────────
   ESTILOS GLOBALES
───────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap');

  /* orbs de fondo */
  @keyframes orbDrift1 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.06)} 100%{transform:translate(-20px,40px) scale(.96)} }
  @keyframes orbDrift2 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-35px,25px) scale(1.04)} 100%{transform:translate(28px,-20px) scale(.98)} }
  @keyframes orbDrift3 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,35px) scale(1.05)} 100%{transform:translate(-30px,-18px) scale(.97)} }

  /* hero */
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  /* cards flotantes — cada una con su rotación fija */
  @keyframes hf1 { 0%,100%{transform:translateY(0)   rotate(-4deg)} 50%{transform:translateY(-14px) rotate(-4deg)} }
  @keyframes hf2 { 0%,100%{transform:translateY(0)   rotate(3deg)}  50%{transform:translateY(-11px) rotate(3deg)}  }
  @keyframes hf3 { 0%,100%{transform:translateY(0)   rotate(-1.5deg)} 50%{transform:translateY(-15px) rotate(-1.5deg)} }
  @keyframes hf4 { 0%,100%{transform:translateY(0)   rotate(2.5deg)} 50%{transform:translateY(-12px) rotate(2.5deg)} }
  @keyframes hf5 { 0%,100%{transform:translateY(0)   rotate(-3deg)} 50%{transform:translateY(-10px) rotate(-3deg)} }

  @keyframes fillBar { from{width:0} to{width:88%} }

  /* tool cards */
  .merge-doc{position:absolute;width:34px;height:42px;border-radius:3px;border:2px solid #6ee7b7;background:rgba(110,231,183,.12);}
  .merge-doc.a{left:2px;top:10px;animation:mergeA 2.4s ease-in-out infinite;}
  .merge-doc.b{right:2px;top:10px;animation:mergeB 2.4s ease-in-out infinite;}
  .merge-doc.c{left:50%;top:50%;transform:translate(-50%,-50%);width:36px;height:44px;border-color:#6ee7b7;background:rgba(110,231,183,.22);opacity:0;animation:mergeC 2.4s ease-in-out infinite;}
  @keyframes mergeA{0%,30%{left:2px;opacity:1}60%{left:22px;opacity:0}100%{left:2px;opacity:1}}
  @keyframes mergeB{0%,30%{right:2px;opacity:1}60%{right:22px;opacity:0}100%{right:2px;opacity:1}}
  @keyframes mergeC{0%,40%{opacity:0;transform:translate(-50%,-50%) scale(.7)}65%,85%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.7)}}

  .split-doc{position:absolute;width:36px;height:44px;border-radius:3px;border:2px solid #93c5fd;background:rgba(147,197,253,.12);}
  .split-doc.main{left:50%;top:50%;transform:translate(-50%,-50%);animation:splitMain 2.4s ease-in-out infinite;}
  .split-doc.out-a{left:2px;top:10px;opacity:0;animation:splitOutA 2.4s ease-in-out infinite;}
  .split-doc.out-b{right:2px;top:10px;opacity:0;animation:splitOutB 2.4s ease-in-out infinite;}
  .split-line{position:absolute;left:50%;top:4px;bottom:4px;width:1.5px;background:#93c5fd;opacity:0;transform:translateX(-50%);animation:splitLine 2.4s ease-in-out infinite;}
  @keyframes splitMain{0%,20%{opacity:1;transform:translate(-50%,-50%) scale(1)}50%,100%{opacity:0;transform:translate(-50%,-50%) scale(.8)}}
  @keyframes splitLine{0%,15%{opacity:0}30%,45%{opacity:.7}60%,100%{opacity:0}}
  @keyframes splitOutA{0%,40%{opacity:0;left:20px}65%,85%{opacity:1;left:2px}100%{opacity:0;left:2px}}
  @keyframes splitOutB{0%,40%{opacity:0;right:20px}65%,85%{opacity:1;right:2px}100%{opacity:0;right:2px}}

  .compress-doc{position:absolute;left:50%;top:50%;width:38px;height:46px;border-radius:3px;border:2px solid #d8b4fe;background:rgba(216,180,254,.12);transform:translate(-50%,-50%);animation:compressDoc 2.4s ease-in-out infinite;}
  .compress-arrows{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;}
  .compress-arrows span{position:absolute;font-size:15px;color:#d8b4fe;animation:compressArr 2.4s ease-in-out infinite;font-weight:600;}
  .compress-arrows span:nth-child(1){top:0;left:50%;transform:translateX(-50%);}
  .compress-arrows span:nth-child(2){bottom:0;left:50%;transform:translateX(-50%);}
  .compress-arrows span:nth-child(3){left:0;top:50%;transform:translateY(-50%);}
  .compress-arrows span:nth-child(4){right:0;top:50%;transform:translateY(-50%);}
  @keyframes compressDoc{0%,20%{width:38px;height:46px}60%,80%{width:22px;height:26px}100%{width:38px;height:46px}}
  @keyframes compressArr{0%,20%{opacity:0}45%,75%{opacity:.9}100%{opacity:0}}

  .conv-doc{position:absolute;left:0;top:50%;width:30px;height:37px;border-radius:3px;border:2px solid #a5f3fc;background:rgba(165,243,252,.1);transform:translateY(-50%);animation:convDoc 2.4s ease-in-out infinite;}
  .conv-img{position:absolute;right:0;top:50%;width:32px;height:27px;border-radius:4px;border:2px solid #a5f3fc;background:rgba(165,243,252,.1);transform:translateY(-50%);opacity:0;animation:convImg 2.4s ease-in-out infinite;overflow:hidden;}
  .conv-img::after{content:'';position:absolute;bottom:0;left:0;right:0;height:11px;background:linear-gradient(180deg,transparent,rgba(165,243,252,.35));}
  .conv-img::before{content:'';position:absolute;top:5px;left:6px;width:9px;height:9px;border-radius:50%;background:rgba(165,243,252,.45);}
  .conv-arrow{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:16px;color:#a5f3fc;opacity:0;animation:convArrow 2.4s ease-in-out infinite;font-weight:600;}
  @keyframes convDoc{0%,30%{opacity:1;left:0}55%,100%{opacity:0;left:16px}}
  @keyframes convArrow{0%,25%{opacity:0}40%,55%{opacity:1}70%,100%{opacity:0}}
  @keyframes convImg{0%,50%{opacity:0;right:0}70%,90%{opacity:1;right:2px}100%{opacity:0;right:0}}

  /* responsive */
  @media(max-width:860px){
    .hero-grid { grid-template-columns:1fr !important; min-height:auto !important; padding-top:32px !important; }
    .hero-float-col { display:none !important; }
  }
  @media(max-width:900px){ .neat-grid { grid-template-columns:repeat(2,1fr) !important; } }
  @media(max-width:480px){ .neat-grid { grid-template-columns:1fr !important; } .neat-card { aspect-ratio:unset !important; min-height:260px; } }
  @media(max-width:640px){
    .neat-footer-grid { grid-template-columns:1fr !important; gap:28px !important; }
    .neat-footer-bottom { flex-direction:column !important; gap:8px !important; text-align:center; }
  }
`

function InjectStyles() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />
}

/* ─── Tool anims ─── */
function MergeAnim()    { return <><div className="merge-doc a"/><div className="merge-doc b"/><div className="merge-doc c"/></> }
function SplitAnim()    { return <><div className="split-doc main"/><div className="split-doc out-a"/><div className="split-doc out-b"/><div className="split-line"/></> }
function CompressAnim() { return <><div className="compress-doc"/><div className="compress-arrows"><span>↓</span><span>↑</span><span>→</span><span>←</span></div></> }
function ConvertAnim()  { return <><div className="conv-doc"/><div className="conv-arrow">→</div><div className="conv-img"/></> }

const tools = [
  { id:'merge',    title:'Unir PDF',      desc:'Une varios archivos PDF en uno solo, en el orden que elijas.',        accent:'#6ee7b7', glow:'rgba(110,231,183,.45)', Anim:MergeAnim    },
  { id:'split',    title:'Separar PDF',   desc:'Separa las páginas de un PDF en archivos individuales.',              accent:'#93c5fd', glow:'rgba(147,197,253,.45)', Anim:SplitAnim    },
  { id:'compress', title:'Comprimir PDF', desc:'Reduce el tamaño de tu PDF sin perder calidad visible.',              accent:'#d8b4fe', glow:'rgba(216,180,254,.45)', Anim:CompressAnim },
  { id:'convert',  title:'PDF a Imagen',  desc:'Convierte páginas de PDF a imágenes PNG o JPG fácilmente.',          accent:'#a5f3fc', glow:'rgba(165,243,252,.45)', Anim:ConvertAnim  },
]

const FOLD = 44

/* ─── Tool Card ─── */
function ToolCard({ tool, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className="neat-card"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        aspectRatio:'0.707',
        background: hov ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.16)',
        backdropFilter:'blur(20px)',
        position:'relative', overflow:'hidden', cursor:'pointer',
        transform: hov ? 'translateY(-7px)' : 'translateY(0)',
        boxShadow: hov
          ? '0 32px 72px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.15)'
          : '0 6px 28px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.09)',
        transition:'transform .25s ease, box-shadow .25s ease, background .25s ease',
        display:'flex', flexDirection:'column',
        padding:'28px 22px 26px',
        clipPath:`polygon(0 0, calc(100% - ${FOLD}px) 0, 100% ${FOLD}px, 100% 100%, 0 100%)`,
      }}
    >
      <div style={{position:'absolute',top:0,right:0,width:0,height:0,borderStyle:'solid',borderWidth:`${FOLD}px 0 0 ${FOLD}px`,borderTopColor:'transparent',borderLeftColor:'rgba(255,255,255,.08)',zIndex:3,pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:0,right:0,width:0,height:0,borderStyle:'solid',borderWidth:`0 ${FOLD}px ${FOLD}px 0`,borderRightColor:'rgba(255,255,255,.28)',borderBottomColor:'transparent',zIndex:4,filter:'drop-shadow(-3px 4px 7px rgba(0,0,0,.7))',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:-30,right:-30,width:110,height:110,borderRadius:'50%',background:tool.glow,filter:'blur(30px)',opacity:.5,pointerEvents:'none',zIndex:1}}/>
      <div style={{position:'absolute',left:0,right:0,top:0,bottom:0,pointerEvents:'none',zIndex:0,opacity:.045,backgroundImage:'repeating-linear-gradient(to bottom,transparent,transparent 22px,rgba(255,255,255,.8) 22px,rgba(255,255,255,.8) 23px)',backgroundPosition:'0 56px'}}/>
      <div style={{position:'absolute',left:22,top:0,bottom:0,width:1,background:'rgba(255,100,100,.09)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${tool.accent},transparent)`,zIndex:2,opacity:hov?1:0.5,transition:'opacity .25s ease'}}/>
      <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{width:80,height:80,marginBottom:20,position:'relative',flexShrink:0}}>
          <tool.Anim/>
        </div>
        <div style={{fontFamily:'"Akt",sans-serif',fontWeight:700,fontSize:25,color:'#fff',marginBottom:9,letterSpacing:'-.2px',lineHeight:1.25}}>
          {tool.title}
        </div>
        <div style={{fontSize:14.5,color:'rgba(255,255,255,.9)',lineHeight:1.65,margin:0,flex:1}}>
          {tool.desc}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:hov?9:4,fontSize:12,fontWeight:600,marginTop:18,color:tool.accent,transition:'gap .2s ease'}}>
          Abrir <span>→</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Hero floating card ─── */
function FloatCard({ style, accent, animName, delay, children }) {
  return (
    <div style={{
      position:'absolute',
      ...style,
      background:'rgba(255,255,255,.065)',
      backdropFilter:'blur(18px)',
      WebkitBackdropFilter:'blur(18px)',
      border:'1px solid rgba(255,255,255,.12)',
      borderRadius:18,
      padding:'18px 20px',
      boxShadow:'0 10px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.05)',
      animation:`${animName} ease-in-out infinite`,
      animationDelay: delay || '0s',
      zIndex:2,
    }}>
      <div style={{position:'absolute',top:-16,right:-16,width:70,height:70,borderRadius:'50%',background:accent,filter:'blur(20px)',opacity:.7,pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1}}>{children}</div>
    </div>
  )
}

function FLabel({ color, children }) {
  return <div style={{fontSize:10,fontWeight:700,letterSpacing:'.8px',textTransform:'uppercase',color,marginBottom:5}}>{children}</div>
}
function FTitle({ children }) {
  return <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:15,fontWeight:600,color:'#fff',lineHeight:1.3}}>{children}</div>
}
function FIcon({ bg, children }) {
  return <div style={{width:34,height:34,borderRadius:9,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,marginBottom:11}}>{children}</div>
}
function FPill({ color, bg, border, children }) {
  return <div style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:10,padding:'3px 10px',borderRadius:100,background:bg,border:`1px solid ${border}`,fontSize:10,fontWeight:700,color}}>{children}</div>
}

/* ─────────────────────────────────────────
   HOME
───────────────────────────────────────── */
function Home() {
  const navigate = useNavigate()

  return (
    <>
      <InjectStyles/>

      {/* orbs */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,77,255,.18) 0%,transparent 70%)',top:-120,left:-150,filter:'blur(80px)',animation:'orbDrift1 22s ease-in-out infinite alternate'}}/>
        <div style={{position:'absolute',width:480,height:480,borderRadius:'50%',background:'radial-gradient(circle,rgba(147,197,253,.14) 0%,transparent 70%)',top:'30%',right:-100,filter:'blur(72px)',animation:'orbDrift2 28s ease-in-out infinite alternate'}}/>
        <div style={{position:'absolute',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle,rgba(110,231,183,.11) 0%,transparent 70%)',bottom:'8%',left:'14%',filter:'blur(64px)',animation:'orbDrift3 24s ease-in-out infinite alternate'}}/>
        <div style={{position:'absolute',width:260,height:260,borderRadius:'50%',background:'radial-gradient(circle,rgba(216,180,254,.14) 0%,transparent 70%)',bottom:'30%',right:'18%',filter:'blur(56px)',animation:'orbDrift1 32s ease-in-out infinite alternate',animationDelay:'-6s'}}/>
      </div>

      <main style={{maxWidth:1060,margin:'0 auto',padding:'0 2rem 5rem',position:'relative',zIndex:1}}>

        {/* ══ HERO ══ */}
        <div className="hero-grid" style={{
          display:'grid', gridTemplateColumns:'1fr 1fr',
          alignItems:'center', gap:56,
          minHeight:'calc(100vh - 64px)',
          paddingTop:16, paddingBottom:48,
        }}>

          {/* copy */}
          <div style={{animation:'fadeUp .75s ease both'}}>
            <h1 style={{
              fontFamily:'"Akt","Lato",sans-serif',
              fontWeight:800,
              fontSize:'clamp(2.8rem,5vw,4.4rem)',
              color:'#fff', lineHeight:1.06,
              letterSpacing:'-2px', marginBottom:18,
            }}>
              Edita tus PDFs,<br/>
              <span style={{background:'linear-gradient(100deg,#c4b5fd 0%,#a78bfa 40%,#6ee7b7 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                sin complicaciones
              </span>
            </h1>

            <p style={{fontSize:16,lineHeight:1.8,color:'rgba(255,255,255,.55)',maxWidth:400,marginBottom:36,fontWeight:300}}>
              Herramientas rápidas y gratuitas para trabajar con tus archivos PDF
              directamente desde el navegador.
            </p>

            <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
              <a href="#tools"
                style={{display:'inline-flex',alignItems:'center',gap:9,padding:'13px 28px',borderRadius:100,background:'linear-gradient(135deg,#8b5cf6,#14b8a6)',color:'#fff',fontFamily:'"Lato",sans-serif',fontSize:14,fontWeight:700,textDecoration:'none',boxShadow:'0 8px 24px rgba(139,92,246,.35)',transition:'all .25s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 14px 32px rgba(139,92,246,.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 8px 24px rgba(139,92,246,.35)'}}
              >Ver herramientas <span>→</span></a>

              <a href="#"
                style={{padding:'12px 24px',borderRadius:100,border:'1px solid rgba(255,255,255,.12)',background:'rgba(255,255,255,.04)',color:'rgba(255,255,255,.55)',fontFamily:'"Lato",sans-serif',fontSize:14,fontWeight:400,textDecoration:'none',transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(196,181,254,.3)';e.currentTarget.style.color='#c4b5fd'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.12)';e.currentTarget.style.color='rgba(255,255,255,.55)'}}
              >¿Cómo funciona?</a>
            </div>
          </div>

          {/* cards flotantes — posicionadas para no encimarse */}
          <div className="hero-float-col" style={{position:'relative',height:600,animation:'fadeUp .8s ease .12s both'}}>

            {/* top-izquierda: Comprimir */}
            <FloatCard
              style={{top:0, left:0, width:188}}
              accent="rgba(110,231,183,.3)"
              animName="hf1 6.2s"
              delay="0s"
            >
              <FIcon bg="rgba(110,231,183,.14)">📦</FIcon>
              <FLabel color="rgba(110,231,183,.75)">Comprimir</FLabel>
              <FTitle>Reducción de peso</FTitle>
              <div style={{height:3,borderRadius:2,background:'rgba(255,255,255,.09)',overflow:'hidden',marginTop:10}}>
                <div style={{height:'100%',borderRadius:2,background:'linear-gradient(90deg,#6ee7b7,#a5f3fc)',animation:'fillBar 2s ease 1.2s both'}}/>
              </div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:5}}>hasta −88% de tamaño</div>
            </FloatCard>

            {/* top-derecha: Convertir */}
            <FloatCard
              style={{top:20, right:0, width:180}}
              accent="rgba(147,197,253,.28)"
              animName="hf2 7s"
              delay="-2.5s"
            >
              <FIcon bg="rgba(147,197,253,.14)">⇄</FIcon>
              <FLabel color="rgba(147,197,253,.75)">Convertir</FLabel>
              <FTitle>PDF ↔ Word,<br/>Excel, Imagen</FTitle>
              <FPill color="#93c5fd" bg="rgba(147,197,253,.1)" border="rgba(147,197,253,.2)">20+ formatos</FPill>
            </FloatCard>

            {/* centro: NeatPDF central */}
            <FloatCard
              style={{top:'50%', left:'50%', width:200, marginTop:-80, marginLeft:-100}}
              accent="rgba(216,180,254,.28)"
              animName="hf3 7.8s"
              delay="-4s"
            >
              <FIcon bg="rgba(216,180,254,.14)">✨</FIcon>
              <FLabel color="rgba(216,180,254,.75)">NeatPDF</FLabel>
              <FTitle>Herramientas PDF,<br/>sin complicaciones</FTitle>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:6}}>Todas. Siempre gratis.</div>
            </FloatCard>

            {/* bottom-izquierda: Privacidad */}
            <FloatCard
              style={{bottom:60, left:8, width:185}}
              accent="rgba(110,231,183,.22)"
              animName="hf4 6.8s"
              delay="-1.8s"
            >
              <FIcon bg="rgba(110,231,183,.12)">🔒</FIcon>
              <FLabel color="rgba(110,231,183,.75)">Privacidad</FLabel>
              <FTitle>Archivos eliminados<br/>al instante</FTitle>
              <FPill color="#6ee7b7" bg="rgba(110,231,183,.09)" border="rgba(110,231,183,.2)">100% privado</FPill>
            </FloatCard>

            {/* bottom-derecha: Fusionar */}
            <FloatCard
              style={{bottom:0, right:4, width:170}}
              accent="rgba(165,243,252,.22)"
              animName="hf5 6s"
              delay="-3.1s"
            >
              <FIcon bg="rgba(165,243,252,.12)">🔗</FIcon>
              <FLabel color="rgba(165,243,252,.75)">Fusionar</FLabel>
              <FTitle>Combina PDFs<br/>fácilmente</FTitle>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:6}}>Arrastra y suelta</div>
            </FloatCard>

          </div>
        </div>

        {/* ══ HERRAMIENTAS ══ */}
        <div id="tools" style={{paddingTop:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'0 0 28px'}}>
            <div style={{flex:1,height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)'}}/>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.35)'}}>elige una herramienta</span>
            <div style={{flex:1,height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)'}}/>
          </div>

          <div className="neat-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18}}>
            {tools.map(t => (
              <ToolCard key={t.id} tool={t} onClick={() => navigate(`/${t.id}`)}/>
            ))}
          </div>
        </div>
      </main>
      <Footer/>
    </>
  )
}

export default Home