import { useEffect, useState } from 'react'
import AnimationToggle from './AnimationToggle'
import { useNavigate, Link } from 'react-router-dom'

export default function HeaderHome() {
  const navigate = useNavigate()
  const [logged, setLogged] = useState(() => !!localStorage.getItem('logado'))

  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'logado') setLogged(!!e.newValue) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('logado')
    localStorage.removeItem('token')
    setLogged(false)
    navigate('/')
  }

  return (
    <header className={`site-header`} role="banner">
      <div className="app-container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <img src="/arboris-tree.png" alt="Arboris logo" />
          </span>
          <div className="header-inner">
            <p className="header-eyebrow">Monitoramento Ambiental</p>
            <h1 className="neon-title">Arboris.X - Dashboard</h1>
            <p className="subtitle">Visão geral e controles</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="header-controls">
          <nav style={{display:'flex',gap:8,alignItems:'center'}} aria-label="Main">
            <Link to="/home" className="login-link">Dashboard</Link>
            <Link to="#" className="login-link">Relatórios</Link>
            <Link to="#" className="login-link">Configurações</Link>
          </nav>
          <AnimationToggle />
          {logged ? (
            <button onClick={handleLogout} className="logout-btn" aria-label="Sair">Sair</button>
          ) : (
            <Link to="/login" className="login-link">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  )
}
