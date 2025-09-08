import { AnimatePresence } from 'framer-motion'
import React, { Suspense, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { RewardNotification } from './components/gamification/RewardNotification'
import PageTransition from './components/PageTransition'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { AuthProvider } from './contexts/AuthContext'
import { RewardProvider } from './contexts/RewardContext'
import { ThemeProvider } from './contexts/ThemeContext'
import type { MilestoneReward } from './services/streak'

// Lazy load pages for better performance
import Landing from './pages/Landing'
const Login = React.lazy(() => import('./pages/auth/Login'))
const Register = React.lazy(() => import('./pages/auth/Register'))
const GoogleCallback = React.lazy(() => import('./pages/auth/GoogleCallback'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Avatar = React.lazy(() => import('./pages/Avatar'))
const Wardrobe = React.lazy(() => import('./pages/Wardrobe'))
const Social = React.lazy(() => import('./pages/Social'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Settings = React.lazy(() => import('./pages/Settings'))

function App() {
	const [rewards, setRewards] = useState<MilestoneReward[]>([])
	const [showRewardNotification, setShowRewardNotification] = useState(false)

	const handleRewardUnlocked = (newRewards: MilestoneReward[]) => {
		setRewards(newRewards)
		setShowRewardNotification(true)
	}

	const handleCloseRewardNotification = () => {
		setShowRewardNotification(false)
		setRewards([])
	}

	return (
		<ThemeProvider>
			<AuthProvider>
				<RewardProvider onRewardUnlocked={handleRewardUnlocked}>
					<Router>
						<div className="min-h-screen bg-background">
							<Suspense fallback={<LoadingSpinner />}>
								<AnimatePresence mode="wait">
									<Routes>
										{/* Public routes */}
										<Route path="/" element={
											<PageTransition>
												<Landing />
											</PageTransition>
										} />
										<Route path="/login" element={
											<PageTransition>
												<Login />
											</PageTransition>
										} />
										<Route path="/register" element={
											<PageTransition>
												<Register />
											</PageTransition>
										} />
										<Route path="/auth/google/callback" element={
											<PageTransition>
												<GoogleCallback />
											</PageTransition>
										} />

										{/* Protected routes */}
										<Route path="/dashboard" element={
											<ProtectedRoute>
												<PageTransition>
													<Dashboard />
												</PageTransition>
											</ProtectedRoute>
										} />

										<Route path="/avatar" element={
											<ProtectedRoute>
												<PageTransition>
													<Avatar />
												</PageTransition>
											</ProtectedRoute>
										} />

										<Route path="/wardrobe" element={
											<ProtectedRoute>
												<PageTransition>
													<Wardrobe />
												</PageTransition>
											</ProtectedRoute>
										} />

										<Route path="/social" element={
											<ProtectedRoute>
												<PageTransition>
													<Social />
												</PageTransition>
											</ProtectedRoute>
										} />

										<Route path="/profile" element={
											<ProtectedRoute>
												<PageTransition>
													<Profile />
												</PageTransition>
											</ProtectedRoute>
										} />

										<Route path="/settings" element={
											<ProtectedRoute>
												<PageTransition>
													<Settings />
												</PageTransition>
											</ProtectedRoute>
										} />
									</Routes>
								</AnimatePresence>
							</Suspense>

							<Toaster
								position="top-right"
								toastOptions={{
									duration: 4000,
									style: {
										background: 'var(--color-surface)',
										color: 'var(--color-primary)',
										border: '1px solid var(--color-surface-variant)',
										boxShadow: '0 4px 12px -2px rgba(0,0,0,0.15)'
									},
									success: {
										iconTheme: {
											primary: 'var(--color-success)',
											secondary: 'var(--color-on-success, #fff)'
										}
									},
									error: {
										iconTheme: {
											primary: 'var(--color-error)',
											secondary: 'var(--color-on-error, #fff)'
										}
									}
								}}
							/>

							{/* Global Reward Notification */}
							{showRewardNotification && rewards.length > 0 && (
								<RewardNotification
									rewards={rewards}
									onClose={handleCloseRewardNotification}
								/>
							)}
						</div>
					</Router>
				</RewardProvider>
			</AuthProvider>
		</ThemeProvider>
	)
}

export default App
