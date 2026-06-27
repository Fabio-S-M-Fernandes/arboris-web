import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { clearLocalAuthState, persistSession } from '../lib/auth'

export default function ProtectedRoute({ children }) {
  const [isLogged, setIsLogged] = useState(null)

  useEffect(() => {
    let isActive = true

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

    supabase.auth
      .getSession()
      .then(({ data }) => syncSession(data.session))
      .catch((error) => {
        console.error('Session check failed', error)
        syncSession(null)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  if (isLogged === null) return null
  if (!isLogged) return <Navigate to="/" replace />

  return children
}
