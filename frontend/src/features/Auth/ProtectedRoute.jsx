import { useAuth } from '../../shared/contexts/AuthContext'
import { Outlet, Navigate } from 'react-router-dom'

export default function ProtectedRoute() {
 const { user } = useAuth()
 if (!user || !user.token) return <Navigate to="/signin" replace />
 return (<Outlet />)
}