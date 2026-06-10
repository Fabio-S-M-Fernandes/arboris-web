import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const isLogged = localStorage.getItem('logado') === 'true'
  if (!isLogged) return <Navigate to="/" replace />
  return children
}
