import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ArborisAuth.css';
import TermsModal from './TermsModal'
import { supabase } from '../lib/supabase';
import { clearLocalAuthState, persistSession, signOutAndClear } from '../lib/auth';

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginSenha,
      })

      if (error) {
        setLoginError(error.message || 'Credenciais inválidas')
        return
      }

      if (data?.session) {
        persistSession(data.session)
        
        // Verificar se termos já foram aceitos
        const termsAccepted = data.user?.user_metadata?.terms_accepted || false
        
        if (termsAccepted) {
          localStorage.setItem('termsAccepted', 'true')
          navigate('/home')
        } else {
          setShowTerms(true)
        }
      }
    } catch (err) {
      console.error('Login failed', err)
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
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regSenha,
        options: {
          data: {
            name: regNome,
            terms_accepted: false,
          }
        }
      })

      if (error) {
        setRegMsg(error.message || 'Erro no cadastro')
        return
      }

      if (data?.session) {
        persistSession(data.session)
        setShowTerms(true)
        return
      }

      if (data?.user) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: regEmail,
          password: regSenha,
        })

        if (loginError) {
          setRegMsg('Cadastro realizado. Faça login para continuar.')
          setTimeout(() => setIsLogin(true), 1200)
          return
        }

        if (loginData?.session) {
          persistSession(loginData.session)
          setShowTerms(true)
          return
        }

        setRegMsg('Cadastro realizado. Faça login para continuar.')
        setTimeout(() => setIsLogin(true), 1200)
      }
    } catch (err) {
      console.error('Register failed', err)
      setRegMsg('Erro na conexão')
    } finally {
      setRegLoading(false)
    }
  }

  const handleAcceptTerms = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { terms_accepted: true }
      })

      if (error) {
        setLoginError(error.message || 'Não foi possível registrar o aceite dos termos')
        return
      }

      localStorage.setItem('termsAccepted', 'true')
      setShowTerms(false)
      navigate('/home')
    } catch (err) {
      console.error('Accept terms failed', err)
      setLoginError('Erro ao aceitar termos')
    }
  }

  const handleDeclineTerms = () => {
    // Clear login state and redirect to landing
    clearLocalAuthState()
    setShowTerms(false)
    setLoginError('Você precisa aceitar os termos para usar o sistema')
    navigate('/')
    // Sign out from Supabase
    signOutAndClear()
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
