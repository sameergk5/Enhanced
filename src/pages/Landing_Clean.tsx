import {
	Environment,
	OrbitControls,
	PerspectiveCamera
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useScroll, useTransform } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import InteractiveCursor from '../components/InteractiveCursor'
import '../styles/3d-enhancements.css'

// Avatar Component for 3D Scene
function Avatar() {
	const meshRef = useRef<THREE.Mesh>(null)

	useFrame(() => {
		if (meshRef.current) {
			meshRef.current.rotation.y += 0.01
		}
	})

	return (
		<mesh ref={meshRef} position={[0, 0, 0]}>
			<capsuleGeometry args={[0.5, 1.5, 4, 8]} />
			<meshStandardMaterial color="#4f46e5" />
			<mesh position={[0, 0.8, 0]}>
				<sphereGeometry args={[0.3, 16, 16]} />
				<meshStandardMaterial color="#fbbf24" />
			</mesh>
		</mesh>
	)
}

// Star Field Component
function StarField({ count = 200 }) {
	const points = useRef<THREE.Points>(null)

	const starPositions = React.useMemo(() => {
		const positions = new Float32Array(count * 3)
		for (let i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 100
			positions[i * 3 + 1] = (Math.random() - 0.5) * 100
			positions[i * 3 + 2] = (Math.random() - 0.5) * 100
		}
		return positions
	}, [count])

	useFrame(() => {
		if (points.current) {
			points.current.rotation.y += 0.0005
			points.current.rotation.x += 0.0002
		}
	})

	return (
		<points ref={points}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={count}
					array={starPositions}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial size={0.02} color="white" />
		</points>
	)
}

// Portal Ring Component
function PortalRing({ radius = 2, position = [0, 0, 0] }) {
	const ringRef = useRef<THREE.Mesh>(null)

	useFrame(() => {
		if (ringRef.current) {
			ringRef.current.rotation.z += 0.02
		}
	})

	return (
		<mesh ref={ringRef} position={position as [number, number, number]}>
			<torusGeometry args={[radius, 0.1, 16, 100]} />
			<meshStandardMaterial
				color="#06b6d4"
				emissive="#06b6d4"
				emissiveIntensity={0.5}
				transparent
				opacity={0.8}
			/>
		</mesh>
	)
}

// Interactive Homepage Component
function InteractiveHomepage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative">
			<Canvas className="w-full h-full">
				<PerspectiveCamera makeDefault position={[0, 0, 8]} fov={75} />
				<Environment preset="sunset" />

				{/* Lighting */}
				<ambientLight intensity={0.4} />
				<pointLight position={[10, 10, 10]} intensity={0.8} />
				<pointLight position={[-10, -10, -10]} color="#4ecdc4" intensity={0.3} />

				{/* Star Field */}
				<StarField count={200} />

				{/* Main Avatar */}
				<Avatar />

				{/* Portal Rings */}
				<PortalRing radius={3} position={[0, 0, -2]} />
				<PortalRing radius={2.5} position={[0, 0, -1.5]} />

				<OrbitControls
					enablePan={false}
					enableZoom={false}
					enableRotate={true}
					autoRotate={true}
					autoRotateSpeed={0.5}
				/>
			</Canvas>

			{/* Text Overlay */}
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
				<motion.div
					className="text-center space-y-6 z-10"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.5 }}
				>
					<motion.h1
						className="text-7xl font-bold text-white mb-4"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 1, delay: 0.8 }}
						style={{
							textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(138,43,226,0.3)'
						}}
					>
						WardrobeAI
					</motion.h1>
					<motion.p
						className="text-xl text-gray-200 max-w-2xl mx-auto mb-8"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1.2, duration: 0.8 }}
					>
						Experience the future of fashion with AI-powered wardrobe management and stunning 3D interactions.
					</motion.p>
					<motion.div
						className="mt-8"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.5, duration: 0.5 }}
					>
						<div className="text-gray-400 text-sm">
							Scroll down to enter the portal
						</div>
						<motion.div
							className="mt-2 w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex justify-center"
							animate={{ opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<motion.div
								className="w-1 h-3 bg-white/60 rounded-full mt-2"
								animate={{ y: [0, 12, 0] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</div>
	)
}

// Main Landing Component
export default function Landing() {
	const [portalActive, setPortalActive] = useState(false)
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()
	const portalTriggerRef = useRef<HTMLDivElement>(null)

	const { scrollYProgress } = useScroll({
		target: portalTriggerRef,
		offset: ["start end", "end start"]
	})

	const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
	const scale = useTransform(scrollYProgress, [0.7, 1], [1, 1.2])

	// Loading simulation
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false)
		}, 2000)
		return () => clearTimeout(timer)
	}, [])

	// Portal activation on scroll
	useEffect(() => {
		const unsubscribe = scrollYProgress.onChange((progress) => {
			if (progress > 0.8 && !portalActive) {
				setPortalActive(true)
			}
		})
		return unsubscribe
	}, [scrollYProgress, portalActive])

	// Portal activation effect
	useEffect(() => {
		if (portalActive) {
			const timer = setTimeout(() => {
				navigate('/wardrobe')
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [portalActive, navigate])

	const wardrobeItems = [
		{
			title: "AI Styling",
			description: "Smart outfit recommendations",
			icon: "🤖",
		},
		{
			title: "3D Wardrobe",
			description: "Virtual try-on experience",
			icon: "👗",
		},
		{
			title: "AR Mirror",
			description: "Augmented reality fitting",
			icon: "🪞",
		},
		{
			title: "Style Analytics",
			description: "Fashion insights & trends",
			icon: "📊",
		}
	]

	return (
		<div className="relative">
			{/* Interactive Cursor */}
			<InteractiveCursor />

			{/* Loading State */}
			{loading && (
				<div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
					<div className="text-center">
						<div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
						<p className="text-white text-xl">Loading WardrobeAI...</p>
					</div>
				</div>
			)}

			{/* Portal Activation Effect */}
			{portalActive && (
				<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
					<div className="text-center">
						<motion.div
							className="w-32 h-32 border-4 border-cyan-400 rounded-full mb-8 mx-auto"
							animate={{ rotate: 360, scale: [1, 1.2, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						/>
						<motion.h2
							className="text-4xl font-bold text-white mb-4"
							animate={{ opacity: [0.5, 1, 0.5] }}
							transition={{ duration: 1, repeat: Infinity }}
						>
							Entering Portal...
						</motion.h2>
						<p className="text-cyan-400 text-lg">Traveling to your wardrobe</p>
					</div>
				</div>
			)}

			{!loading && (
				<>
					{/* Main Landing Section */}
					<motion.section
						className="h-screen sticky top-0"
						style={{ opacity, scale }}
					>
						<InteractiveHomepage />
					</motion.section>

					{/* Features Section */}
					<motion.section
						className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-20"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 1 }}
					>
						<div className="container mx-auto px-4">
							<motion.div
								className="text-center mb-16"
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8 }}
							>
								<h2 className="text-5xl font-bold mb-6 text-white">
									Revolutionary Fashion Technology
								</h2>
								<p className="text-xl text-gray-300 max-w-3xl mx-auto">
									Discover the future of fashion with our cutting-edge AI and 3D technologies
								</p>
							</motion.div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
								{wardrobeItems.map((item, index) => (
									<motion.div
										key={item.title}
										className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
										initial={{ opacity: 0, y: 50 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6, delay: index * 0.2 }}
										whileHover={{ scale: 1.05 }}
									>
										<div className="text-4xl mb-4">{item.icon}</div>
										<h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
										<p className="text-gray-300 text-sm">{item.description}</p>
									</motion.div>
								))}
							</div>
						</div>
					</motion.section>

					{/* Portal Trigger Section */}
					<div
						ref={portalTriggerRef}
						className="h-[200vh] relative bg-black"
					>
						<div className="absolute inset-0 flex items-center justify-center">
							<motion.div
								className="text-center text-white"
								initial={{ opacity: 0, y: 100 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 1 }}
							>
								<motion.h2
									className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
									initial={{ scale: 0.8 }}
									whileInView={{ scale: 1 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.8,
										type: "spring",
										stiffness: 100,
										damping: 15
									}}
								>
									Ready for the Journey?
								</motion.h2>
								<p className="text-xl text-white/80 mb-8">Continue scrolling to activate the portal...</p>

								<motion.button
									className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-white font-bold hover:scale-105 transition-transform"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => setPortalActive(true)}
								>
									Enter Portal Now
								</motion.button>
							</motion.div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
