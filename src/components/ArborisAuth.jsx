import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ArborisAuth.css';
import TermsModal from './TermsModal'

// Use VITE_API_BASE if definido; fallback para caminho provável no XAMPP
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost/ArborisX/backend'

export default function ArborisAuth({ defaultIsLogin = true }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(defaultIsLogin);

  // login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showTerms, setShowTerms] = useState(false)

  // register state
  const [regNome, setRegNome] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regSenha, setRegSenha] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regMsg, setRegMsg] = useState('')

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      })
      const data = await res.json()
      if (res.ok && data.status === 'sucesso') {
        localStorage.setItem('logado', 'true')
        if (data.token) localStorage.setItem('token', data.token)
        // If backend says terms already accepted, persist locally and go home
        if (data.termsAccepted === true || data.termsAccepted === 1 || data.termsAccepted === '1') {
          localStorage.setItem('termsAccepted', 'true')
          navigate('/home')
        } else if (localStorage.getItem('termsAccepted') === 'true') {
          navigate('/home')
        } else {
          setShowTerms(true)
        }
      } else {
        setLoginError(data.mensagem || data.error || 'Credenciais inválidas')
      }
    } catch (err) {
      console.error('Login request failed', err)
      setLoginError('Erro na conexão')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegMsg('')
    setRegLoading(true)
    try {
      const res = await fetch(`${API_BASE}/cadastro.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: regNome, email: regEmail, senha: regSenha }),
      })
      const data = await res.json()
      if (res.ok && data.status === 'sucesso') {
        // Try to auto-login the newly created user so we can show terms immediately
        try {
          const loginRes = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: regEmail, senha: regSenha }),
          })
          const loginData = await loginRes.json()
          if (loginRes.ok && loginData.status === 'sucesso') {
            localStorage.setItem('logado', 'true')
            if (loginData.token) localStorage.setItem('token', loginData.token)
            if (loginData.termsAccepted === true || loginData.termsAccepted === 1 || loginData.termsAccepted === '1') {
              localStorage.setItem('termsAccepted', 'true')
              navigate('/home')
            } else {
              setShowTerms(true)
            }
          } else {
            setRegMsg('Usuário criado. Faça login para continuar.')
            setTimeout(() => setIsLogin(true), 900)
          }
        } catch (err) {
          console.error('Auto-login failed', err)
          setRegMsg('Usuário criado. Faça login para continuar.')
          setTimeout(() => setIsLogin(true), 900)
        }
      } else {
        setRegMsg(data.mensagem || data.error || 'Erro no cadastro')
      }
    } catch (err) {
      console.error('Register request failed', err)
      setRegMsg('Erro na conexão')
    } finally {
      setRegLoading(false)
    }
  }

  const handleAcceptTerms = () => {
    ;(async () => {
      const token = localStorage.getItem('token')
      try {
        const res = await fetch(`${API_BASE}/accept_terms.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
          body: JSON.stringify({}),
        })
        const data = await res.json()
        if (res.ok && data.status === 'sucesso') {
          localStorage.setItem('termsAccepted', 'true')
          setShowTerms(false)
          navigate('/home')
        } else {
          setLoginError(data.mensagem || 'Não foi possível registrar o aceite dos termos')
        }
      } catch (err) {
        console.error('Accept terms request failed', err)
        setLoginError('Erro na conexão ao aceitar termos')
      }
    })()
  }

  const handleDeclineTerms = () => {
    // Clear login state and redirect to landing
    localStorage.removeItem('logado')
    localStorage.removeItem('token')
    setShowTerms(false)
    setLoginError('Você precisa aceitar os termos para usar o sistema')
    navigate('/')
  }

  return (
    <div className="arboris-auth-wrapper">
      <div className="arboris-auth-bg"></div>
      <div className="auth-plate" aria-hidden="true"></div>

      <div className={`auth-card-container ${isLogin ? '' : 'flipped'}`}>
        <div className="auth-card">

          <div className="card-face card-front">
            <div className="brand-header">
              <span className="tree-icon">🌳</span>
              <h2>Entrar</h2>
            </div>

            {loginError && <div className="auth-error" style={{textAlign:'center'}}>{loginError}</div>}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-group">
                <input value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} type="email" placeholder="Email" required />
                <div className="holographic-line"></div>
              </div>
              <div className="input-group">
                <input value={loginSenha} onChange={(e)=>setLoginSenha(e.target.value)} type="password" placeholder="Senha" required />
                <div className="holographic-line"></div>
              </div>
              <button disabled={loginLoading} type="submit" className="holo-button">{loginLoading ? 'Entrando...' : 'Acessar Sistema'}</button>
            </form>
            <p className="toggle-text">
              Não tem conta? <span onClick={() => setIsLogin(false)}>Cadastre-se</span>
            </p>
          </div>

          <div className="card-face card-back">
            <div className="brand-header">
              <span className="tree-icon">🌿</span>
              <h2>Cadastro</h2>
            </div>

            {regMsg && <div className="auth-error" style={{textAlign:'center'}}>{regMsg}</div>}

            <form onSubmit={handleRegister} className="auth-form">
              <div className="input-group">
                <input value={regNome} onChange={(e)=>setRegNome(e.target.value)} type="text" placeholder="Nome Completo" required />
                <div className="holographic-line"></div>
              </div>
              <div className="input-group">
                <input value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} type="email" placeholder="Email" required />
                <div className="holographic-line"></div>
              </div>
              <div className="input-group">
                <input value={regSenha} onChange={(e)=>setRegSenha(e.target.value)} type="password" placeholder="Senha" required />
                <div className="holographic-line"></div>
              </div>
              <button disabled={regLoading} type="submit" className="holo-button">{regLoading ? 'Enviando...' : 'Registrar Identidade'}</button>
            </form>
            <p className="toggle-text">
              Já possui acesso? <span onClick={() => setIsLogin(true)}>Voltar ao Login</span>
            </p>
          </div>

        </div>
      </div>
        {showTerms && <TermsModal onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />}
    </div>
  );
}
