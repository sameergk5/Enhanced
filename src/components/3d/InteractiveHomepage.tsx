import {
	ContactShadows,
	Cylinder,
	Environment,
	Float,
	Html,
	OrbitControls,
	Scroll,
	ScrollControls,
	Sparkles,
	Stars,
	Text,
	Torus,
	useScroll
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion } from 'framer-motion'
import React, { Suspense, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'

// Interactive 3D Avatar Mannequin
function AvatarMannequin({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
	const meshRef = useRef<THREE.Mesh>(null)
	const [hovered, setHovered] = useState(false)

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
			meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
		}
	})

	return (
		<Float
			speed={1}
			rotationIntensity={0.5}
			floatIntensity={0.5}
			position={position}
		>
			<group
				onPointerOver={() => setHovered(true)}
				onPointerOut={() => setHovered(false)}
			>
				{/* Mannequin Body */}
				<mesh ref={meshRef} scale={hovered ? 1.1 : 1}>
					<capsuleGeometry args={[0.5, 1.5, 4, 8]} />
					<meshStandardMaterial
						color={hovered ? "#e0e0e0" : "#f5f5f5"}
						roughness={0.1}
						metalness={0.1}
					/>
				</mesh>

				{/* Head */}
				<mesh position={[0, 1.3, 0]}>
					<sphereGeometry args={[0.35, 16, 16]} />
					<meshStandardMaterial
						color={hovered ? "#e0e0e0" : "#f5f5f5"}
						roughness={0.1}
						metalness={0.1}
					/>
				</mesh>

				{/* Interactive Sparkles around avatar */}
				{hovered && (
					<Sparkles
						count={50}
						scale={3}
						size={2}
						speed={0.4}
						color="#8b5cf6"
					/>
				)}
			</group>
		</Float>
	)
}

// Floating Clothing Items
function FloatingClothingItem({
	position,
	rotation,
	color,
	type = 'shirt'
}: {
	position: [number, number, number]
	rotation?: [number, number, number]
	color: string
	type?: 'shirt' | 'pants' | 'dress' | 'jacket'
}) {
	const meshRef = useRef<THREE.Mesh>(null)

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.x = rotation?.[0] || 0 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
			meshRef.current.rotation.y = rotation?.[1] || 0 + Math.sin(state.clock.elapsedTime * 0.3) * 0.2
		}
	})

	const getGeometry = () => {
		switch (type) {
			case 'shirt':
				return <boxGeometry args={[0.8, 1, 0.1]} />
			case 'pants':
				return <cylinderGeometry args={[0.3, 0.4, 1.2, 8]} />
			case 'dress':
				return <coneGeometry args={[0.6, 1.5, 8]} />
			case 'jacket':
				return <boxGeometry args={[0.9, 1.1, 0.15]} />
			default:
				return <boxGeometry args={[0.8, 1, 0.1]} />
		}
	}

	return (
		<Float
			speed={2}
			rotationIntensity={0.3}
			floatIntensity={0.8}
			position={position}
		>
			<mesh ref={meshRef}>
				{getGeometry()}
				<meshStandardMaterial
					color={color}
					roughness={0.2}
					metalness={0.1}
					transparent
					opacity={0.8}
				/>
			</mesh>
		</Float>
	)
}

// Interactive Wardrobe Portal
function WardrobePortal({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
	const [hovered, setHovered] = useState(false)
	const portalRef = useRef<THREE.Group>(null)

	useFrame((state) => {
		if (portalRef.current) {
			portalRef.current.rotation.y += 0.005
			if (hovered) {
				portalRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.05)
			}
		}
	})

	return (
		<group
			ref={portalRef}
			position={position}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
		>
			{/* Portal Ring */}
			<Torus args={[2, 0.1, 16, 100]}>
				<meshStandardMaterial
					color={hovered ? "#8b5cf6" : "#a855f7"}
					emissive={hovered ? "#4c1d95" : "#000000"}
					roughness={0.1}
					metalness={0.8}
				/>
			</Torus>

			{/* Inner Portal Effect */}
			<Cylinder args={[1.8, 1.8, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]}>
				<meshStandardMaterial
					color="#1e1b4b"
					transparent
					opacity={0.3}
					side={THREE.DoubleSide}
				/>
			</Cylinder>

			{/* Portal Sparkles */}
			<Sparkles
				count={100}
				scale={4}
				size={1}
				speed={0.3}
				color={hovered ? "#fbbf24" : "#8b5cf6"}
			/>

			{/* Portal Text */}
			<Html
				position={[0, 0, 0]}
				center
				occlude
				transform
				sprite
			>
				<Link to="/wardrobe">
					<motion.div
						className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full text-lg font-bold cursor-pointer shadow-xl"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						Enter Wardrobe
					</motion.div>
				</Link>
			</Html>
		</group>
	)
}

// Main Scene Component
function MainScene() {
	const scroll = useScroll()

	useFrame((state) => {
		// Animate based on scroll
		const offset = scroll.offset
		state.camera.position.y = 2 + offset * 10
	})

	return (
		<>
			{/* Background Environment */}
			<Environment preset="city" />
			<Stars
				radius={100}
				depth={50}
				count={5000}
				factor={4}
				saturation={0}
				fade
				speed={1}
			/>

			{/* Lighting */}
			<ambientLight intensity={0.5} />
			<directionalLight position={[10, 10, 5]} intensity={1} castShadow />
			<pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={0.5} />

			{/* Central Avatar Mannequin */}
			<AvatarMannequin position={[0, 0, 0]} />

			{/* Floating Clothing Items */}
			<FloatingClothingItem
				position={[-3, 2, -2]}
				color="#ef4444"
				type="shirt"
			/>
			<FloatingClothingItem
				position={[3, 1.5, -1]}
				color="#3b82f6"
				type="pants"
			/>
			<FloatingClothingItem
				position={[-2, -1, 2]}
				color="#10b981"
				type="dress"
			/>
			<FloatingClothingItem
				position={[2.5, 0.5, 3]}
				color="#f59e0b"
				type="jacket"
			/>

			{/* Wardrobe Portal */}
			<WardrobePortal position={[0, -3, -5]} />

			{/* Interactive Floor */}
			<ContactShadows
				position={[0, -2, 0]}
				opacity={0.4}
				scale={20}
				blur={1}
				far={10}
			/>

			{/* Floating Title */}
			<Float
				speed={1}
				rotationIntensity={0.2}
				floatIntensity={0.3}
				position={[0, 4, -3]}
			>
				<Text
					fontSize={1.2}
					color="#8b5cf6"
					anchorX="center"
					anchorY="middle"
					font="/fonts/inter-bold.woff"
				>
					Welcome to Wardrobe AI
				</Text>
			</Float>
		</>
	)
}

// Loading Component
function Loader() {
	return (
		<Html center>
			<div className="flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
			</div>
		</Html>
	)
}

// Main Interactive Homepage Component
const InteractiveHomepage: React.FC = () => {
	return (
		<div className="w-full h-screen relative overflow-hidden">
			<Canvas
				camera={{ position: [0, 2, 8], fov: 60 }}
				shadows
				gl={{
					antialias: true,
					alpha: true,
					powerPreference: "high-performance"
				}}
			>
				<ScrollControls pages={3} damping={0.1}>
					<Suspense fallback={<Loader />}>
						<MainScene />
					</Suspense>

					{/* Scroll-based HTML content */}
					<Scroll html>
						<div className="w-full">
							{/* Hero Section */}
							<div className="h-screen flex flex-col justify-center items-center text-center px-4">
								<motion.div
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 1 }}
									className="space-y-6"
								>
									<h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
										Wardrobe AI
									</h1>
									<p className="text-xl md:text-2xl text-gray-600 max-w-3xl">
										Experience fashion in 3D. Create your avatar, build your virtual wardrobe, and discover your perfect style.
									</p>
								</motion.div>
							</div>

							{/* Features Section */}
							<div className="h-screen flex items-center justify-center px-4">
								<div className="grid md:grid-cols-3 gap-8 max-w-6xl">
									<motion.div
										className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
										whileHover={{ scale: 1.05 }}
									>
										<div className="text-4xl mb-4">🎭</div>
										<h3 className="text-2xl font-bold mb-4">3D Avatars</h3>
										<p className="text-gray-600">Create photorealistic 3D avatars and see how clothes fit your unique body.</p>
									</motion.div>

									<motion.div
										className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
										whileHover={{ scale: 1.05 }}
									>
										<div className="text-4xl mb-4">👕</div>
										<h3 className="text-2xl font-bold mb-4">Virtual Wardrobe</h3>
										<p className="text-gray-600">Organize your clothes in stunning 3D space with interactive features.</p>
									</motion.div>

									<motion.div
										className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
										whileHover={{ scale: 1.05 }}
									>
										<div className="text-4xl mb-4">🤖</div>
										<h3 className="text-2xl font-bold mb-4">AI Styling</h3>
										<p className="text-gray-600">Get personalized outfit recommendations powered by advanced AI.</p>
									</motion.div>
								</div>
							</div>

							{/* CTA Section */}
							<div className="h-screen flex items-center justify-center px-4">
								<motion.div
									className="text-center space-y-8"
									initial={{ opacity: 0 }}
									whileInView={{ opacity: 1 }}
									transition={{ duration: 1 }}
								>
									<h2 className="text-4xl md:text-6xl font-bold">Ready to Start?</h2>
									<div className="flex flex-col sm:flex-row gap-4 justify-center">
										<Link to="/register">
											<motion.button
												className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-full"
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												Create Avatar
											</motion.button>
										</Link>
										<Link to="/wardrobe">
											<motion.button
												className="px-8 py-4 border-2 border-purple-600 text-purple-600 text-xl font-semibold rounded-full"
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												Explore Wardrobe
											</motion.button>
										</Link>
									</div>
								</motion.div>
							</div>
						</div>
					</Scroll>
				</ScrollControls>

				<OrbitControls
					enablePan={false}
					enableZoom={false}
					enableRotate={true}
					autoRotate={true}
					autoRotateSpeed={0.5}
				/>
			</Canvas>
		</div>
	)
}

export default InteractiveHomepage
