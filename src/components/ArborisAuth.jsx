import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './ArborisAuth.css';
import TermsModal from './TermsModal'
import { supabase } from '../lib/supabase';
import { clearLocalAuthState, persistSession, signOutAndClear } from '../lib/auth';

export default function ArborisAuth({ defaultIsLogin = true }) {
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const cardContainerRef = useRef(null)
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

  useEffect(() => {
    const wrapperEl = wrapperRef.current
    if (!wrapperEl) return

    const ctx = gsap.context(() => {
      gsap.from(wrapperEl, {
        opacity: 0,
        y: 30,
        duration: 1.1,
        ease: 'power3.out',
      })

      gsap.from(wrapperEl.querySelectorAll('.card-face'), {
        opacity: 0,
        y: 25,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.12,
      })

      gsap.from(wrapperEl.querySelectorAll('.auth-card'), {
        x: 40,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.14,
      })

      gsap.from(wrapperEl.querySelectorAll('.input-group'), {
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08,
        delay: 0.2,
      })

      gsap.from(wrapperEl.querySelectorAll('.holo-button'), {
        scale: 0.95,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.5)',
        delay: 0.3,
      })
    }, wrapperEl)

    const handleMove = (event) => {
      if (!wrapperEl || !cardContainerRef.current) return
      const rect = wrapperEl.getBoundingClientRect()
      const x = (event.clientX - rect.left - rect.width / 2) / rect.width
      const y = (event.clientY - rect.top - rect.height / 2) / rect.height

      gsap.to(cardContainerRef.current, {
        rotationY: x * 9,
        rotationX: -y * 9,
        transformPerspective: 900,
        transformOrigin: 'center',
        duration: 0.65,
        ease: 'power3.out',
      })

      gsap.to(wrapperEl.querySelectorAll('.arboris-auth-bg'), {
        x: x * 36,
        y: y * 36,
        duration: 0.7,
        ease: 'power3.out',
      })

      gsap.to(wrapperEl.querySelectorAll('.tree-icon'), {
        x: x * 8,
        y: y * 8,
        duration: 0.7,
        ease: 'power3.out',
      })
    }

    const handleLeave = () => {
      if (!cardContainerRef.current) return
      gsap.to(cardContainerRef.current, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.9,
        ease: 'power3.out',
      })
      gsap.to(wrapperEl.querySelectorAll('.arboris-auth-bg'), {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
      })
      gsap.to(wrapperEl.querySelectorAll('.tree-icon'), {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
      })
    }

    wrapperEl.addEventListener('mousemove', handleMove)
    wrapperEl.addEventListener('mouseleave', handleLeave)

    return () => {
      wrapperEl?.removeEventListener('mousemove', handleMove)
      wrapperEl?.removeEventListener('mouseleave', handleLeave)
      ctx.revert()
    }
  }, [])

  return (
    <div className="arboris-auth-wrapper" ref={wrapperRef}>
      <div className="arboris-auth-bg"></div>
      <div className={`auth-card-container ${isLogin ? '' : 'flipped'}`} ref={cardContainerRef}>
        <div className="auth-cards-wrapper">
          {/* Card de Login */}
          <div className="auth-card">
            <div className="card-face">
              <div>
                <div className="brand-header">
                  <span className="tree-icon">🌳</span>
                  <h2>Entrar</h2>
                </div>

                {loginError && <div className="auth-error" role="alert">{loginError}</div>}

                <form onSubmit={handleLogin} className="auth-form">
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input 
                      value={loginEmail} 
                      onChange={(e)=>setLoginEmail(e.target.value)} 
                      type="email" 
                      placeholder="seu@email.com"
                      disabled={loginLoading}
                      autoComplete="email"
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Senha</label>
                    <input 
                      value={loginSenha} 
                      onChange={(e)=>setLoginSenha(e.target.value)} 
                      type="password" 
                      placeholder="••••••••"
                      disabled={loginLoading}
                      autoComplete="current-password"
                      required 
                    />
                  </div>
                  <button 
                    disabled={loginLoading} 
                    type="submit" 
                    className="holo-button"
                  >
                    {loginLoading ? (
                      <span>⟳ Entrando...</span>
                    ) : (
                      'Acessar Sistema'
                    )}
                  </button>
                </form>
              </div>
              
              <p className="toggle-text">
                Não tem conta? <span onClick={() => setIsLogin(false)}>Cadastre-se</span>
              </p>
            </div>
          </div>

          {/* Card de Cadastro */}
          <div className="auth-card">
            <div className="card-face card-back">
              <div>
                <div className="brand-header">
                  <span className="tree-icon">🌿</span>
                  <h2>Cadastro</h2>
                </div>

                {regMsg && (
                  <div className={regMsg.includes('Cadastro realizado') ? 'auth-success' : 'auth-error'} role="alert">
                    {regMsg}
                  </div>
                )}

                <form onSubmit={handleRegister} className="auth-form">
                  <div className="input-group">
                    <label className="input-label">Nome Completo</label>
                    <input 
                      value={regNome} 
                      onChange={(e)=>setRegNome(e.target.value)} 
                      type="text" 
                      placeholder="Seu nome aqui"
                      disabled={regLoading}
                      autoComplete="name"
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input
                      value={regEmail}
                      onChange={(e)=>setRegEmail(e.target.value)}
                      type="email"
                      placeholder="seu@email.com"
                      disabled={regLoading}
                      autoComplete="email"
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Senha</label>
                    <input
                      value={regSenha}
                      onChange={(e)=>setRegSenha(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      disabled={regLoading}
                      autoComplete="new-password"
                      minLength="6"
                      required
                    />
                  </div>
                  <button 
                    disabled={regLoading} 
                    type="submit" 
                    className="holo-button"
                  >
                    {regLoading ? (
                      <span>⟳ Enviando...</span>
                    ) : (
                      'Registrar Identidade'
                    )}
                  </button>
                </form>
              </div>

              <p className="toggle-text">
                Já possui acesso? <span onClick={() => setIsLogin(true)}>Voltar ao Login</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {showTerms && <TermsModal onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />}
    </div>
  );
}
