import { Link, useLocation } from 'react-router-dom'

export default function Footer() {
  const location = useLocation()
  const isAuthRoute = ['/','/login','/cadastro'].includes(location.pathname)

  return (
    <footer className={`site-footer ${isAuthRoute ? 'site-footer--compact' : ''}`} role="contentinfo">
      <div className="app-container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <strong>Arboris.X</strong>
          <small style={{color:'rgba(148,165,148,0.7)'}}>Núcleo de Monitoramento Ambiental</small>
        </div>

        <nav aria-label="Footer links" style={{display:'flex',gap:12,alignItems:'center'}}>
          <Link to="/" className="footer-link">Início</Link>
          <Link to="/cadastro" className="footer-link">Cadastro</Link>
          <a href="#contato" className="footer-link">Contato</a>
        </nav>

        <div style={{textAlign:'right'}}>
          <small style={{color:'rgba(148,165,148,0.7)'}}>&copy; {new Date().getFullYear()} Arboris.X — Todos os direitos</small>
        </div>
      </div>
    </footer>
  )
}
