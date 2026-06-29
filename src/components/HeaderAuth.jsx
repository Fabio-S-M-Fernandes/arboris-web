export default function HeaderAuth() {
  return (
    <header className="site-header site-header--compact site-header--auth" role="banner">
      <div className="app-container" style={{display:'flex',alignItems:'center',justifyContent:'flex-start',gap:20,padding:'2rem 1rem'}}>
        <span className="brand-mark brand-mark--auth" aria-hidden="true" style={{flex:'0 0 auto'}}>
          <img src="/arboris-tree.png" alt="Arboris logo" style={{width:'80px',height:'80px'}} />
        </span>
        <div className="header-inner" style={{display:'flex',flexDirection:'column',justifyContent:'center',gap:6,textAlign:'left'}}>
          <p style={{margin:0,color:'rgba(178, 226, 182, 0.7)',fontSize:'0.75rem',fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase'}}>
            Núcleo de Monitoramento
          </p>
          <h1 className="neon-title" style={{margin:0,fontSize:'2rem'}}>Arboris.X</h1>
          <p style={{margin:0,color:'rgba(165,200,165,0.75)',fontSize:'0.85rem',fontWeight:400}}>
            Visualização Holográfica Inteligente
          </p>
        </div>
      </div>
    </header>
  )
}