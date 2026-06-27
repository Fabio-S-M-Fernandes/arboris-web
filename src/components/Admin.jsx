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
      <div style={{ padding: '2rem', color: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '2rem auto', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: 12 }}>
          <h2>Painel Admin</h2>
          <p>Área administrativa protegida.</p>
          <button onClick={handleLogout} style={{ padding: '0.6rem 1rem', borderRadius: 8, background: '#ff6b6b', color: '#fff', border: 'none' }}>Sair</button>
        </div>
      </div>
      <FooterAdmin />
    </>
  )
}
