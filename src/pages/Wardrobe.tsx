import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Interactive3DWardrobe from '../components/3d/Interactive3DWardrobe'

interface WardrobePageProps {
	fromPortal?: boolean
}

const Wardrobe: React.FC<WardrobePageProps> = ({ fromPortal = false }) => {
	const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d')
	const [showWelcome, setShowWelcome] = useState(fromPortal)

	// Welcome animation when arriving from portal
	useEffect(() => {
		if (fromPortal) {
			const timer = setTimeout(() => {
				setShowWelcome(false)
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [fromPortal])

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
			{/* Portal Arrival Welcome Screen */}
			<AnimatePresence>
				{showWelcome && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gradient-to-b from-purple-900/90 to-black/90 flex items-center justify-center z-50"
					>
						<motion.div
							initial={{ scale: 0.5, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 1, ease: "easeOut" }}
							className="text-center text-white"
						>
							<motion.div
								animate={{
									rotate: [0, 360],
									scale: [1, 1.2, 1]
								}}
								transition={{
									duration: 2,
									repeat: 1,
									ease: "easeInOut"
								}}
								className="w-32 h-32 mx-auto mb-6"
							>
								<div className="w-full h-full bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-6xl">
									✨
								</div>
							</motion.div>

							<motion.h1
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.5 }}
								className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent"
							>
								Welcome to Your Virtual Wardrobe!
							</motion.h1>

							<motion.p
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.7 }}
								className="text-xl mb-8"
							>
								You've successfully traveled through the portal. Explore your 3D wardrobe space!
							</motion.p>

							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 1.2, type: "spring" }}
								className="flex items-center justify-center space-x-4 text-sm"
							>
								<div className="flex items-center space-x-2">
									<div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
									<span>Portal Connection Active</span>
								</div>
								<div className="flex items-center space-x-2">
									<div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
									<span>3D Environment Loaded</span>
								</div>
							</motion.div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Wardrobe Interface */}
			<div className="relative">
				{/* Header */}
				<motion.header
					initial={{ y: -50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.8 }}
					className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-40"
				>
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Link to="/" className="text-2xl font-bold text-purple-600">
									👗 Wardrobe AI
								</Link>
								{fromPortal && (
									<motion.div
										animate={{ scale: [1, 1.1, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
										className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium"
									>
										🚀 Portal Mode
									</motion.div>
								)}
							</div>

							<div className="flex items-center space-x-4">
								{/* View Toggle */}
								<div className="bg-gray-100 rounded-lg p-1 flex">
									<button
										onClick={() => setViewMode('3d')}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === '3d'
												? 'bg-white shadow-md text-purple-600'
												: 'text-gray-600 hover:text-purple-600'
											}`}
									>
										🎯 3D View
									</button>
									<button
										onClick={() => setViewMode('grid')}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'grid'
												? 'bg-white shadow-md text-purple-600'
												: 'text-gray-600 hover:text-purple-600'
											}`}
									>
										📋 Grid View
									</button>
								</div>

								{/* Portal Return Button */}
								<Link
									to="/"
									className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200"
								>
									🏠 Return Home
								</Link>
							</div>
						</div>
					</div>
				</motion.header>

				{/* Content Area */}
				<main className="relative">
					{viewMode === '3d' ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
							className="h-screen"
						>
							<Interactive3DWardrobe />
						</motion.div>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
							className="container mx-auto px-4 py-8"
						>
							{/* Grid View Content */}
							<div className="text-center py-20">
								<h2 className="text-3xl font-bold text-gray-700 mb-4">
									Classic Grid View
								</h2>
								<p className="text-gray-600 mb-8">
									Traditional wardrobe organization view coming soon!
								</p>
								<motion.button
									onClick={() => setViewMode('3d')}
									className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									🎯 Switch to 3D Experience
								</motion.button>
							</div>
						</motion.div>
					)}
				</main>

				{/* Floating Action Buttons */}
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 1, duration: 0.5 }}
					className="fixed bottom-6 right-6 z-30"
				>
					<div className="flex flex-col space-y-3">
						{/* Add Item Button */}
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
						</motion.button>

						{/* Settings Button */}
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
							className="w-14 h-14 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</motion.button>

						{/* Portal Return Button */}
						{fromPortal && (
							<Link to="/">
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
									className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
								>
									🌀
								</motion.button>
							</Link>
						)}
					</div>
				</motion.div>
			</div>
		</div>
	)
}

export default Wardrobe
