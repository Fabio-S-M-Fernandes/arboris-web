import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { clearLocalAuthState, persistSession } from '../lib/auth'

export default function ProtectedRoute({ children }) {
  const [isLogged, setIsLogged] = useState(null)
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false)

  useEffect(() => {
    let isActive = true
    let timeoutId

    const syncSession = (session) => {
      if (!isActive) return

      if (session) {
        persistSession(session)
        setIsLogged(true)
        return
      }

      clearLocalAuthState()
      setIsLogged(false)
    }

    // Primeiro, tenta recuperar a sessão do Supabase
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isActive) return
        
        if (error) {
          console.error('Session check error:', error)
          // Se der erro, verifica localStorage como fallback
          if (localStorage.getItem('logado') === 'true') {
            setIsLogged(true)
            setHasCheckedStorage(true)
          } else {
            setIsLogged(false)
          }
          return
        }

        if (data?.session) {
          syncSession(data.session)
        } else if (localStorage.getItem('logado') === 'true') {
          // Fallback: se não tem sessão no Supabase mas tem no localStorage
          // tenta restaurar
          setIsLogged(true)
        } else {
          setIsLogged(false)
        }
        setHasCheckedStorage(true)
      })
      .catch((error) => {
        console.error('Session retrieval failed:', error)
        if (!isActive) return
        // Fallback para localStorage em caso de erro
        if (localStorage.getItem('logado') === 'true') {
          setIsLogged(true)
        } else {
          setIsLogged(false)
        }
        setHasCheckedStorage(true)
      })

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session)
    })

    // Timeout de segurança de 5 segundos para evitar ficar pendurado
    timeoutId = setTimeout(() => {
      if (!isActive) return
      if (isLogged === null && hasCheckedStorage === false) {
        // Se passou 5s e ainda não tem resposta, assume não logado
        if (localStorage.getItem('logado') === 'true') {
          setIsLogged(true)
        } else {
          setIsLogged(false)
        }
        setHasCheckedStorage(true)
      }
    }, 5000)

    return () => {
      isActive = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  // Mostra loading enquanto verifica
  if (isLogged === null) return <div style={{display:'none'}}></div>
  if (!isLogged) return <Navigate to="/" replace />

  return children
}
