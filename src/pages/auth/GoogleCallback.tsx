import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/auth'

const GoogleCallback: React.FC = () => {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const { setAuthenticatedUser } = useAuth()

	useEffect(() => {
		const handleCallback = async () => {
			const code = searchParams.get('code')
			const error = searchParams.get('error')

			if (error) {
				toast.error('Google authentication was cancelled or failed')
				navigate('/login')
				return
			}

			if (!code) {
				toast.error('No authorization code received')
				navigate('/login')
				return
			}

			try {
				// Handle the Google callback
				const response = await authService.handleGoogleCallback(code)

				// Update the auth context with user data and token
				setAuthenticatedUser(response.user, response.token)

				toast.success('Successfully signed in with Google!')
				navigate('/dashboard')
			} catch (error: any) {
				console.error('Google callback error:', error)
				toast.error(error.message || 'Google authentication failed')
				navigate('/login')
			}
		}

		handleCallback()
	}, [searchParams, navigate, setAuthenticatedUser])

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<LoadingSpinner />
				<p className="mt-4 text-gray-600">Completing Google sign-in...</p>
			</div>
		</div>
	)
}

export default GoogleCallback
