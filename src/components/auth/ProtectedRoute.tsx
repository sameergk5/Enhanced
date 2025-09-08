import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

interface ProtectedRouteProps {
	children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { user, loading } = useAuth()
	const location = useLocation()

	if (loading) {
		return <LoadingSpinner />
	}

	if (!user) {
		// Redirect to login page with return url
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	return <>{children}</>
}

export default ProtectedRoute
