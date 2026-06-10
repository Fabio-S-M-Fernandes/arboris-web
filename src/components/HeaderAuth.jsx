// HeaderAuth is a simple presentational header for auth routes; no default React import needed

export default function HeaderAuth() {
  return (
    <header className="site-header site-header--compact site-header--auth" role="banner">
      <div className="header-topbar header-topbar--compact">
        <div className="app-container" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div className="brand-lockup brand-lockup--auth" style={{display:'flex',alignItems:'center',gap:12}}>
            <span className="brand-mark brand-mark--auth" aria-hidden="true">
              <img src="/arboris-tree.png" alt="Arboris logo" />
            </span>
            <div className="header-inner">
              <h1 className="neon-title">Arboris.X</h1>
              <p className="auth-tagline">Núcleo de Monitoramento Ambiental</p>
            </div>
          </div>

          <div style={{display:'flex',gap:18,alignItems:'center'}} className="status-group">
            <div className="status-item status-item--green">
              <small className="status-label">Status:</small>
              <strong className="status-value">Ativo</strong>
            </div>
            <div className="status-item">
              <small className="status-label">Sensores</small>
              <span className="status-value">1,450 Conectados</span>
            </div>
            <div className="status-item">
              <small className="status-label">Registros de Dados</small>
              <span className="status-value">2.1M</span>
            </div>
          </div>

          <div style={{display:'flex',gap:12,alignItems:'center'}} className="topbar-controls">
            <a href="#" className="top-link">Ajuda com Acesso</a>
            <a href="#" className="top-link">Informações do Sistema</a>
            <div className="uptime">Tempo de Execução: <strong>35 Dias</strong></div>
          </div>
        </div>
      </div>
    </header>
  )
}
