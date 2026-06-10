import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HeaderAdmin() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('logado')
    localStorage.removeItem('token')
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
            <p className="header-eyebrow">Admin</p>
            <h1 className="neon-title">Painel Administrativo</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </div>
    </header>
  )
}
