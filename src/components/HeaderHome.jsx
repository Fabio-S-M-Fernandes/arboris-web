import { useEffect, useState } from 'react'
import AnimationToggle from './AnimationToggle'
import { useNavigate, Link } from 'react-router-dom'
import { signOutAndClear } from '../lib/auth'

export default function HeaderHome() {
  const navigate = useNavigate()
  const [logged, setLogged] = useState(() => !!localStorage.getItem('logado'))

  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'logado') setLogged(!!e.newValue) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = async () => {
    await signOutAndClear()
    setLogged(false)
    navigate('/')
  }

  return (
    <header className={`site-header`} role="banner">
      <div className="app-container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,padding:'1.5rem 0'}}>
        <div className="brand-lockup" style={{display:'flex',alignItems:'center',gap:16}}>
          <span className="brand-mark" aria-hidden="true" style={{flex:'0 0 auto',width:'64px',height:'64px'}}>
            <img src="/arboris-tree.png" alt="Arboris logo" style={{width:'100%',height:'100%'}} />
          </span>
          <div className="header-inner" style={{display:'flex',flexDirection:'column',gap:4}}>
            <p className="header-eyebrow" style={{margin:0,fontSize:'0.75rem'}}>Monitoramento Ambiental</p>
            <h1 className="neon-title" style={{margin:0,fontSize:'1.8rem'}}>Arboris.X - Dashboard</h1>
            <p className="subtitle" style={{margin:0,fontSize:'0.85rem',color:'rgba(165,200,165,0.75)'}}>Visão geral e controles</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="header-controls">
          <nav style={{display:'flex',gap:20,alignItems:'center'}} aria-label="Main">
            <Link to="/home" className="login-link">Dashboard</Link>
            <Link to="#" className="login-link">Relatórios</Link>
            <Link to="#" className="login-link">Configurações</Link>
          </nav>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <AnimationToggle />
            {logged ? (
              <button onClick={handleLogout} className="logout-btn" aria-label="Sair">Sair</button>
            ) : (
              <Link to="/login" className="login-link">Entrar</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
