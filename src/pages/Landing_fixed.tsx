import { motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import InteractiveHomepage from '../components/3d/InteractiveHomepage'
import '../styles/landing.css'

const Landing: React.FC = () => {
	const [view, setView] = useState<'landing' | '3d' | 'portal'>('landing')
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [showPortalSequence, setShowPortalSequence] = useState(false)

	// Scroll-triggered portal animation
	const portalTriggerRef = useRef(null)
	const { scrollYProgress } = useScroll({
		target: portalTriggerRef,
		offset: ["start end", "end start"]
	})

	// Transform values for scroll-triggered animation
	const portalScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 1, 1.2])
	const portalOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
	const avatarY = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -200])
	const avatarScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.3])

	// Animation controls for sections
	const featuresControls = useAnimation()
	const statsControls = useAnimation()

	// Refs for intersection observer
	const featuresRef = useRef(null)
	const statsRef = useRef(null)
	const isInViewFeatures = useInView(featuresRef, { once: true })
	const isInViewStats = useInView(statsRef, { once: true })

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({
				x: (e.clientX / window.innerWidth) * 20,
				y: (e.clientY / window.innerHeight) * 20,
			})
		}

		window.addEventListener('mousemove', handleMouseMove)
		return () => window.removeEventListener('mousemove', handleMouseMove)
	}, [])

	useEffect(() => {
		if (isInViewFeatures) {
			featuresControls.start('visible')
		}
	}, [featuresControls, isInViewFeatures])

	useEffect(() => {
		if (isInViewStats) {
			statsControls.start('visible')
		}
	}, [statsControls, isInViewStats])

	// Floating particles animation component
	const FloatingParticles = () => (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{[...Array(50)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-30"
					initial={{
						x: Math.random() * window.innerWidth,
						y: Math.random() * window.innerHeight,
					}}
					animate={{
						x: [
							Math.random() * window.innerWidth,
							Math.random() * window.innerWidth,
							Math.random() * window.innerWidth,
						],
						y: [
							Math.random() * window.innerHeight,
							Math.random() * window.innerHeight,
							Math.random() * window.innerHeight,
						],
					}}
					transition={{
						duration: Math.random() * 10 + 10,
						repeat: Infinity,
						ease: "linear",
					}}
					style={{
						transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
					}}
				/>
			))}
		</div>
	)

	// Animated grid background
	const ParallaxGrid = () => (
		<div className="absolute inset-0 opacity-20">
			<motion.div
				className="absolute inset-0"
				style={{
					backgroundImage: `
						linear-gradient(90deg, rgba(147,51,234,0.1) 1px, transparent 1px),
						linear-gradient(180deg, rgba(147,51,234,0.1) 1px, transparent 1px)
					`,
					backgroundSize: '50px 50px',
					transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
				}}
				animate={{
					backgroundPosition: ['0px 0px', '50px 50px', '0px 0px'],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "linear",
				}}
			/>
		</div>
	)

	if (view === '3d') {
		return <InteractiveHomepage />
	}

	// Auto-trigger portal when scrollYProgress reaches threshold
	useEffect(() => {
		const unsubscribe = scrollYProgress.onChange((value) => {
			if (value > 0.8) {
				setShowPortalSequence(true)
				// After 4 seconds of portal animation, go to wardrobe
				setTimeout(() => {
					setView('3d')
				}, 4000)
			}
		})
		return unsubscribe
	}, [scrollYProgress])

	return (
		<div className="min-h-screen bg-black text-white relative overflow-hidden">
			{/* Fullscreen Portal Animation Overlay */}
			{showPortalSequence && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="fixed inset-0 z-50 bg-black"
				>
					<FullscreenPortalAnimation />
				</motion.div>
			)}

			{/* Animated Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
			<FloatingParticles />
			<ParallaxGrid />

			{/* Navigation */}
			<motion.nav
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="relative z-10 flex justify-between items-center p-6"
			>
				<motion.h1
					whileHover={{ scale: 1.05 }}
					className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
				>
					WardrobeAI
				</motion.h1>
				<div className="flex space-x-4">
					<motion.button
						whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.2)" }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setView('3d')}
						className="px-6 py-2 border border-purple-500 rounded-lg text-purple-400 hover:text-white transition-all duration-300"
					>
						3D Experience
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.8)" }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setView('portal')}
						className="px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-all duration-300"
					>
						Portal Travel
					</motion.button>
				</div>
			</motion.nav>

			{/* Hero Section */}
			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="max-w-4xl mx-auto"
				>
					<motion.h1
						className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent"
						animate={{
							backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
						}}
						transition={{
							duration: 5,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						Future of Fashion
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.3 }}
						className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
					>
						Experience AI-powered virtual wardrobes with stunning 3D avatars and portal travel technology
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.6 }}
						className="flex flex-col sm:flex-row gap-6 justify-center"
					>
						<motion.button
							whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)" }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setView('portal')}
							className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 animate-pulse"
							animate={{
								boxShadow: [
									"0 0 20px rgba(147, 51, 234, 0.5)",
									"0 0 60px rgba(147, 51, 234, 0.9)",
									"0 0 20px rgba(147, 51, 234, 0.5)"
								],
								scale: [1, 1.02, 1]
							}}
							transition={{ duration: 2, repeat: Infinity }}
						>
							🌟 CLICK HERE → PORTAL ANIMATION!
						</motion.button>

						<motion.button
							whileHover={{ scale: 1.05, borderColor: "rgba(147, 51, 234, 1)" }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setView('3d')}
							className="px-8 py-4 border-2 border-purple-500/50 rounded-lg text-lg font-semibold hover:bg-purple-500/10 transition-all duration-300"
						>
							🎨 3D Experience
						</motion.button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.8 }}
						className="text-center mt-8"
					>
						<p className="text-xl text-gray-300 mb-4">
							Or continue scrolling to experience the portal journey...
						</p>
						<motion.div
							animate={{ y: [0, 10, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
							className="text-purple-400 text-2xl"
						>
							↓
						</motion.div>
					</motion.div>
				</motion.div>
			</div>

			{/* Scroll Progress Indicator */}
			<motion.div
				className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 z-50 origin-left"
				style={{ scaleX: mousePosition.y / 100 + 0.1 }}
			/>

			{/* Scroll-Triggered Portal Section */}
			<div
				ref={portalTriggerRef}
				className="h-[200vh] relative flex items-center justify-center"
			>
				<motion.div
					className="sticky top-0 w-full h-screen flex items-center justify-center"
					style={{ scale: portalScale, opacity: portalOpacity }}
				>
					<motion.div
						className="text-center"
						style={{ y: avatarY, scale: avatarScale }}
					>
						<motion.div className="text-8xl mb-8">👤</motion.div>
						<motion.h2 className="text-4xl font-bold text-white mb-4">
							Continue scrolling to enter the portal...
						</motion.h2>
					</motion.div>
				</motion.div>
			</div>
		</div>
	)
}

// Fullscreen Portal Animation Component - Lusion-style
const FullscreenPortalAnimation: React.FC = () => {
	return (
		<div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-black">
			{/* Space Background */}
			<div className="absolute inset-0">
				{/* Stars */}
				{[...Array(200)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-1 h-1 bg-white rounded-full"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
						}}
						animate={{
							opacity: [0.3, 1, 0.3],
							scale: [0.5, 1, 0.5]
						}}
						transition={{
							duration: Math.random() * 3 + 1,
							repeat: Infinity,
							delay: Math.random() * 2
						}}
					/>
				))}
			</div>

			{/* Traveling Avatar */}
			<motion.div
				className="relative z-10"
				initial={{ y: 200, scale: 0.5, rotateY: 0 }}
				animate={{
					y: [-200, -100, 0, 100, 200],
					x: [-100, 0, 50, 0, -50],
					scale: [0.5, 1.2, 1.5, 1, 0.3],
					rotateY: [0, 180, 360, 540, 720],
					rotateX: [0, 20, -20, 10, 0]
				}}
				transition={{
					duration: 4,
					ease: "easeInOut",
					times: [0, 0.2, 0.5, 0.8, 1]
				}}
			>
				{/* Avatar Character */}
				<div className="text-8xl mb-4 filter drop-shadow-2xl">👤</div>

				{/* Portal Trail */}
				<motion.div
					className="absolute inset-0 -z-10"
					animate={{
						background: [
							"radial-gradient(circle, rgba(147,51,234,0.8) 0%, transparent 70%)",
							"radial-gradient(circle, rgba(236,72,153,0.8) 0%, transparent 70%)",
							"radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)",
							"radial-gradient(circle, rgba(147,51,234,0.8) 0%, transparent 70%)"
						]
					}}
					transition={{ duration: 1, repeat: Infinity }}
				/>
			</motion.div>

			{/* Portal Rings */}
			{[...Array(5)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute border-4 border-purple-500/30 rounded-full"
					style={{
						width: `${(i + 1) * 150}px`,
						height: `${(i + 1) * 150}px`,
					}}
					animate={{
						scale: [1, 1.5, 1],
						rotate: [0, 360],
						borderColor: [
							"rgba(147,51,234,0.3)",
							"rgba(236,72,153,0.6)",
							"rgba(59,130,246,0.3)",
							"rgba(147,51,234,0.3)"
						]
					}}
					transition={{
						duration: 3 + i * 0.5,
						repeat: Infinity,
						delay: i * 0.3
					}}
				/>
			))}

			{/* Energy Particles */}
			{[...Array(50)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
					style={{
						left: `${Math.random() * 100}%`,
						top: `${Math.random() * 100}%`,
					}}
					animate={{
						y: [0, -window.innerHeight],
						x: [0, (Math.random() - 0.5) * 200],
						scale: [0, 1, 0],
						opacity: [0, 1, 0]
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						delay: Math.random() * 2
					}}
				/>
			))}

			{/* Destination Text */}
			<motion.div
				className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 2, duration: 1 }}
			>
				<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
					Entering Virtual Wardrobe...
				</h1>
				<p className="text-gray-300 mt-2">Prepare for an immersive fashion experience</p>
			</motion.div>
		</div>
	)
}

export default Landing
