// FooterAuth uses plain anchors; React default import not required for JSX runtime

export default function FooterAuth() {
  return (
    <footer className="site-footer site-footer--compact" role="contentinfo">
      <div className="app-container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <strong>Arboris.X</strong>
          <small style={{color:'rgba(148,165,148,0.7)'}}>Monitoramento Inteligente Ambiental</small>
        </div>

        <nav aria-label="Auth footer" style={{display:'flex',gap:8,alignItems:'center'}}>
          <a href="#termos" className="footer-link">Termos de Uso</a>
          <span style={{color:'rgba(148,165,148,0.6)'}}>|</span>
          <a href="#privacidade" className="footer-link">Política de Privacidade</a>
        </nav>

        <div>
          <small style={{color:'rgba(148,165,148,0.7)'}}>© 2025 Arboris.X - Projeto Acadêmico</small>
        </div>
      </div>
    </footer>
  )
}
