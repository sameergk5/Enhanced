import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'

const Login: React.FC = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const { login } = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			await login(email, password)
			toast.success('Login successful!')
			navigate('/dashboard')
		} catch (error) {
			toast.error('Login failed. Please check your credentials.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
					<CardDescription className="text-center">
						Sign in to your Wardrobe AI account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium">
								Email
							</label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium">
								Password
							</label>
							<Input
								id="password"
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading}
						>
							{isLoading ? 'Signing in...' : 'Sign in'}
						</Button>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>
						<div className="mt-4">
							<GoogleSignInButton
								disabled={isLoading}
								text="Sign in with Google"
							/>
						</div>
					</div>
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Don't have an account?{' '}
							<Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">
								Sign up
							</Link>
						</p>
					</div>
					<div className="mt-4 text-center">
						<Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
							← Back to home
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default Login
