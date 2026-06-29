import { useNavigate } from 'react-router-dom'
import HeaderAdmin from './HeaderAdmin'
import FooterAdmin from './FooterAdmin'
import { signOutAndClear } from '../lib/auth'

export default function Admin() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOutAndClear()
    navigate('/')
  }

  return (
    <>
      <HeaderAdmin />
      <div style={{ padding: '2rem', color: 'var(--text-main)' }}>
        <div style={{ maxWidth: 900, margin: '2rem auto', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: 12 }}>
          <h2>Painel Admin</h2>
          <p>Área administrativa protegida.</p>
          <button onClick={handleLogout} style={{ padding: '0.6rem 1rem', borderRadius: 8, background: 'linear-gradient(90deg, var(--accent-green-strong), var(--accent-green))', color: '#021108', border: 'none', fontWeight: 700 }}>Sair</button>
        </div>
      </div>
      <FooterAdmin />
    </>
  )
}
