import { useEffect, useState } from 'react'
import AnimationToggle from './AnimationToggle'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [logged, setLogged] = useState(() => !!localStorage.getItem('logado'))

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'logado') setLogged(!!e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Re-read auth state when location changes (login happens in same tab)
  useEffect(() => {
    const id = setTimeout(() => {
      setLogged(!!localStorage.getItem('logado'))
    }, 0)
    return () => clearTimeout(id)
  }, [location.pathname])

  const isAuthRoute = ['/','/login','/cadastro'].includes(location.pathname)

  useEffect(() => {
    const cls = 'header-compact-active'
    if (isAuthRoute) document.body.classList.add(cls)
    else document.body.classList.remove(cls)
    return () => document.body.classList.remove(cls)
  }, [isAuthRoute])

  const handleLogout = () => {
    localStorage.removeItem('logado')
    localStorage.removeItem('token')
    setLogged(false)
    navigate('/')
  }

  return (
    <header className={`site-header ${isAuthRoute ? 'site-header--compact' : ''}`} role="banner">
      <div className="app-container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <img src="/arboris-tree.png" alt="Arboris logo" />
          </span>
          <div className="header-inner">
            {!isAuthRoute && <p className="header-eyebrow">Monitoramento Ambiental</p>}
            <h1 className="neon-title">Arboris.X</h1>
            {!isAuthRoute && <p className="subtitle">Núcleo de Monitoramento Ambiental e Visualização Holográfica</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="header-controls">
          <AnimationToggle />
          {logged ? (
            <button
              onClick={handleLogout}
              className="logout-btn"
              aria-label="Sair"
            >
              Sair
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
