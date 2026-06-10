import React from 'react'

export default function FooterAdmin() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="app-container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <strong>Arboris.X</strong>
          <small style={{color:'rgba(190,204,214,0.7)'}}>Monitoramento Inteligente Ambiental</small>
        </div>

        <nav aria-label="Footer" style={{display:'flex',gap:12,alignItems:'center'}}>
          <a href="#termos" className="footer-link">Termos de Uso</a>
          <span style={{color:'rgba(190,204,214,0.6)'}}>|</span>
          <a href="#privacidade" className="footer-link">Política de Privacidade</a>
        </nav>

        <div style={{textAlign:'right'}}>
          <small style={{color:'rgba(190,204,214,0.7)'}}>© 2025 Arboris.X - Projeto Acadêmico</small>
        </div>
      </div>
    </footer>
  )
}
