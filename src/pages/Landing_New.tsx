import { motion, useAnimation, useInView } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import InteractiveHomepage from '../components/3d/InteractiveHomepage'
import PortalTravel from '../components/3d/PortalTravel'

const Landing: React.FC = () => {
	const [view, setView] = useState<'landing' | '3d' | 'portal'>('landing')
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

	// Animation controls for sections
	const featuresControls = useAnimation()
	const statsControls = useAnimation()

	// Refs for intersection observer
	const featuresRef = useRef(null)
	const statsRef = useRef(null)
	const isInViewFeatures = useInView(featuresRef, { once: true })
	const isInViewStats = useInView(statsRef, { once: true })

	// Mouse tracking for parallax effects
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({
				x: (e.clientX - window.innerWidth / 2) / 25,
				y: (e.clientY - window.innerHeight / 2) / 25
			})
		}

		window.addEventListener('mousemove', handleMouseMove)
		return () => window.removeEventListener('mousemove', handleMouseMove)
	}, [])

	// Trigger animations when sections come into view
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
						linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
						linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
					`,
					backgroundSize: '50px 50px',
					transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
				}}
			/>
		</div>
	)

	if (view === '3d') {
		return <InteractiveHomepage />
	}

	if (view === 'portal') {
		return (
			<PortalTravel
				onTravelComplete={() => {
					// This will navigate to wardrobe automatically
					console.log('Portal travel completed!')
				}}
			/>
		)
	}

	return (
		<div className="min-h-screen bg-black text-white relative overflow-hidden">
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
							className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
						>
							🌟 Enter Portal Wardrobe
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
				</motion.div>

				{/* Stats Section */}
				<motion.div
					ref={statsRef}
					initial="hidden"
					animate={statsControls}
					variants={{
						hidden: { opacity: 0, y: 50 },
						visible: {
							opacity: 1,
							y: 0,
							transition: {
								duration: 0.8,
								staggerChildren: 0.2
							}
						}
					}}
					className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
				>
					{[
						{ number: "100K+", label: "Virtual Outfits" },
						{ number: "50K+", label: "Active Users" },
						{ number: "99%", label: "Satisfaction Rate" }
					].map((stat, index) => (
						<motion.div
							key={index}
							variants={{
								hidden: { opacity: 0, scale: 0.8 },
								visible: { opacity: 1, scale: 1 }
							}}
							className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm"
						>
							<motion.h3
								className="text-3xl md:text-4xl font-bold text-purple-400 mb-2"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
							>
								{stat.number}
							</motion.h3>
							<p className="text-gray-300">{stat.label}</p>
						</motion.div>
					))}
				</motion.div>
			</div>

			{/* Features Section */}
			<motion.div
				ref={featuresRef}
				initial="hidden"
				animate={featuresControls}
				variants={{
					hidden: { opacity: 0 },
					visible: {
						opacity: 1,
						transition: {
							duration: 0.8,
							staggerChildren: 0.2
						}
					}
				}}
				className="relative z-10 py-20 px-6"
			>
				<div className="max-w-6xl mx-auto">
					<motion.h2
						variants={{
							hidden: { opacity: 0, y: 30 },
							visible: { opacity: 1, y: 0 }
						}}
						className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
					>
						Revolutionary Features
					</motion.h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								icon: "🎭",
								title: "AI Avatar Creation",
								description: "Create stunning 3D avatars with AI-powered customization"
							},
							{
								icon: "🌈",
								title: "Portal Travel",
								description: "Navigate through magical portals between fashion dimensions"
							},
							{
								icon: "👗",
								title: "Virtual Try-On",
								description: "Try on clothes virtually with realistic physics simulation"
							},
							{
								icon: "🤖",
								title: "Style AI Assistant",
								description: "Get personalized fashion recommendations from our AI stylist"
							},
							{
								icon: "🌍",
								title: "3D Wardrobe",
								description: "Organize your clothes in immersive 3D environments"
							},
							{
								icon: "✨",
								title: "Magic Effects",
								description: "Experience enchanting visual effects and animations"
							}
						].map((feature, index) => (
							<motion.div
								key={index}
								variants={{
									hidden: { opacity: 0, y: 30, scale: 0.9 },
									visible: { opacity: 1, y: 0, scale: 1 }
								}}
								whileHover={{
									scale: 1.05,
									rotateY: 5,
									boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)"
								}}
								className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300"
							>
								<div className="text-4xl mb-4">{feature.icon}</div>
								<h3 className="text-xl font-semibold text-purple-300 mb-3">{feature.title}</h3>
								<p className="text-gray-400">{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div>

			{/* Technology Showcase */}
			<div className="relative z-10 py-20 px-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
				<div className="max-w-4xl mx-auto text-center">
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-3xl md:text-4xl font-bold mb-8 text-white"
					>
						Powered by Cutting-Edge Technology
					</motion.h2>

					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="flex flex-wrap justify-center gap-6"
					>
						{["Three.js", "WebGL", "AI/ML", "React", "TypeScript", "WebRTC"].map((tech, index) => (
							<motion.span
								key={tech}
								whileHover={{ scale: 1.1, y: -5 }}
								className="px-4 py-2 bg-purple-600/20 border border-purple-400/30 rounded-full text-purple-300 font-medium backdrop-blur-sm"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 * index }}
							>
								{tech}
							</motion.span>
						))}
					</motion.div>
				</div>
			</div>

			{/* Footer CTA */}
			<div className="relative z-10 py-16 px-6 text-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="max-w-2xl mx-auto"
				>
					<h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
						Ready to Transform Your Fashion Experience?
					</h2>
					<p className="text-gray-300 mb-8">
						Join thousands of fashion enthusiasts exploring the future of style with WardrobeAI
					</p>
					<motion.button
						whileHover={{
							scale: 1.05,
							boxShadow: "0 0 40px rgba(147, 51, 234, 0.6)",
							background: "linear-gradient(45deg, #8B5CF6, #EC4899, #8B5CF6)"
						}}
						whileTap={{ scale: 0.95 }}
						onClick={() => setView('portal')}
						className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold shadow-lg transition-all duration-300"
					>
						🚀 Start Your Journey Now
					</motion.button>
				</motion.div>
			</div>
		</div>
	)
}

export default Landing
