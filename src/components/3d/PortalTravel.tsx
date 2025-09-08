import {
	ContactShadows,
	Environment,
	Float,
	Html,
	OrbitControls,
	Sparkles,
	Torus,
	Trail
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import React, { Suspense, useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'

interface PortalTravelProps {
	onTravelComplete?: () => void
	isActive?: boolean
}

// Traveling Avatar Component
function TravelingAvatar({
	isActive,
	onComplete
}: {
	isActive: boolean
	onComplete: () => void
}) {
	const avatarRef = useRef<THREE.Group>(null)
	const [progress, setProgress] = useState(0)
	const { camera } = useThree()

	useFrame((state, delta) => {
		if (!isActive || !avatarRef.current) return

		// Smooth progress animation
		const targetProgress = isActive ? 1 : 0
		const newProgress = THREE.MathUtils.lerp(progress, targetProgress, delta * 2)
		setProgress(newProgress)

		// Avatar movement through portal
		const t = newProgress
		const curve = new THREE.CatmullRomCurve3([
			new THREE.Vector3(0, 0, 8),     // Start position (in front of portal)
			new THREE.Vector3(0, 2, 4),     // Rise up
			new THREE.Vector3(0, 3, 0),     // Through portal center
			new THREE.Vector3(0, 2, -4),    // Continue through
			new THREE.Vector3(0, 0, -8),    // End position (behind portal)
		])

		const position = curve.getPoint(t)
		avatarRef.current.position.copy(position)

		// Avatar rotation during travel
		avatarRef.current.rotation.y = t * Math.PI * 4 // Multiple spins
		avatarRef.current.rotation.x = Math.sin(t * Math.PI * 2) * 0.3

		// Avatar scale animation
		const scale = 1 + Math.sin(t * Math.PI) * 0.5
		avatarRef.current.scale.setScalar(scale)

		// Camera follow effect
		const cameraTarget = new THREE.Vector3()
		cameraTarget.lerpVectors(
			new THREE.Vector3(0, 0, 10),
			new THREE.Vector3(0, 0, -10),
			t
		)
		camera.lookAt(cameraTarget)

		// Complete travel when avatar reaches the end
		if (t >= 0.98) {
			onComplete()
		}
	})

	return (
		<group ref={avatarRef}>
			{/* Avatar Body with Trail Effect */}
			<Trail
				width={0.5}
				length={8}
				color="purple"
				attenuation={(t) => t * t}
			>
				<Float speed={2} rotationIntensity={1} floatIntensity={2}>
					{/* Main Avatar Body */}
					<mesh>
						<capsuleGeometry args={[0.3, 1, 4, 8]} />
						<meshStandardMaterial
							color="#e0e0e0"
							roughness={0.1}
							metalness={0.8}
							emissive="#4c1d95"
							emissiveIntensity={0.3}
						/>
					</mesh>

					{/* Avatar Head */}
					<mesh position={[0, 0.8, 0]}>
						<sphereGeometry args={[0.25, 16, 16]} />
						<meshStandardMaterial
							color="#f0f0f0"
							roughness={0.1}
							metalness={0.5}
						/>
					</mesh>

					{/* Magical Aura */}
					<Sparkles
						count={50}
						scale={2}
						size={2}
						speed={2}
						color="#8b5cf6"
					/>
				</Float>
			</Trail>
		</group>
	)
}

// Enhanced Portal with Particle Effects
function EnhancedPortal({
	onActivate,
	isActive
}: {
	onActivate: () => void
	isActive: boolean
}) {
	const portalRef = useRef<THREE.Group>(null)
	const [hovered, setHovered] = useState(false)

	useFrame((state) => {
		if (portalRef.current) {
			// Portal rotation
			portalRef.current.rotation.y += isActive ? 0.02 : 0.005

			// Portal pulsing effect
			const scale = isActive
				? 1.5 + Math.sin(state.clock.elapsedTime * 8) * 0.3
				: 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
			portalRef.current.scale.setScalar(scale)
		}
	})

	return (
		<group
			ref={portalRef}
			position={[0, 0, 0]}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
			onClick={onActivate}
		>
			{/* Outer Portal Ring */}
			<Torus args={[3, 0.2, 16, 100]}>
				<meshStandardMaterial
					color={isActive ? "#fbbf24" : hovered ? "#8b5cf6" : "#a855f7"}
					emissive={isActive ? "#f59e0b" : hovered ? "#4c1d95" : "#000000"}
					emissiveIntensity={isActive ? 0.8 : 0.3}
					roughness={0.1}
					metalness={0.9}
				/>
			</Torus>

			{/* Inner Portal Ring */}
			<Torus args={[2.2, 0.1, 16, 100]}>
				<meshStandardMaterial
					color={isActive ? "#ef4444" : "#ec4899"}
					emissive={isActive ? "#dc2626" : "#be185d"}
					emissiveIntensity={isActive ? 0.6 : 0.2}
					roughness={0.1}
					metalness={0.8}
				/>
			</Torus>

			{/* Portal Center Vortex */}
			<mesh rotation={[0, 0, 0]}>
				<cylinderGeometry args={[2, 2, 0.1, 32]} />
				<meshStandardMaterial
					color="#1e1b4b"
					transparent
					opacity={isActive ? 0.8 : 0.3}
					side={THREE.DoubleSide}
				/>
			</mesh>

			{/* Portal Energy Field */}
			<Sparkles
				count={isActive ? 300 : 100}
				scale={6}
				size={isActive ? 3 : 1}
				speed={isActive ? 2 : 0.3}
				color={isActive ? "#fbbf24" : "#8b5cf6"}
			/>

			{/* Portal Text */}
			<Html
				position={[0, -4, 0]}
				center
				occlude
				transform
				sprite
			>
				<motion.div
					className={`
						${isActive
							? 'bg-gradient-to-r from-yellow-500 to-red-500'
							: 'bg-gradient-to-r from-purple-600 to-pink-600'
						}
						text-white px-8 py-4 rounded-full text-xl font-bold cursor-pointer shadow-2xl
					`}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					animate={isActive ? {
						scale: [1, 1.2, 1],
						rotate: [0, 360]
					} : {}}
					transition={{
						duration: isActive ? 2 : 0.3,
						repeat: isActive ? Infinity : 0
					}}
				>
					{isActive ? '🌟 Traveling...' : '✨ Enter Wardrobe Portal'}
				</motion.div>
			</Html>
		</group>
	)
}

// Main Portal Travel Component
export const PortalTravel: React.FC<PortalTravelProps> = ({
	onTravelComplete,
	isActive = false
}) => {
	const [travelState, setTravelState] = useState<'idle' | 'traveling' | 'complete'>('idle')
	const navigate = useNavigate()

	const handlePortalActivation = useCallback(() => {
		if (travelState === 'idle') {
			setTravelState('traveling')
		}
	}, [travelState])

	const handleTravelComplete = useCallback(() => {
		setTravelState('complete')
		setTimeout(() => {
			onTravelComplete?.()
			navigate('/wardrobe')
		}, 1000)
	}, [navigate, onTravelComplete])

	return (
		<div className="w-full h-screen">
			<Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
				<Suspense fallback={null}>
					{/* Lighting Setup */}
					<ambientLight intensity={0.4} />
					<pointLight position={[10, 10, 10]} intensity={1} />
					<pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

					{/* Environment */}
					<Environment preset="night" />

					{/* Portal */}
					<EnhancedPortal
						onActivate={handlePortalActivation}
						isActive={travelState === 'traveling'}
					/>

					{/* Traveling Avatar */}
					<AnimatePresence>
						{travelState === 'traveling' && (
							<TravelingAvatar
								isActive={true}
								onComplete={handleTravelComplete}
							/>
						)}
					</AnimatePresence>

					{/* Background Effects */}
					<Sparkles
						count={500}
						scale={50}
						size={1}
						speed={0.1}
						color="#4c1d95"
					/>

					{/* Camera Controls */}
					<OrbitControls
						enablePan={false}
						enableZoom={false}
						enableRotate={travelState === 'idle'}
						minPolarAngle={Math.PI / 3}
						maxPolarAngle={Math.PI / 1.5}
					/>

					{/* Ground */}
					<ContactShadows
						opacity={0.4}
						scale={20}
						blur={1}
						far={10}
						resolution={256}
						color="#000000"
					/>
				</Suspense>
			</Canvas>

			{/* UI Overlay */}
			<AnimatePresence>
				{travelState === 'complete' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-black/80 flex items-center justify-center"
					>
						<motion.div
							initial={{ scale: 0.5 }}
							animate={{ scale: 1 }}
							className="text-center text-white"
						>
							<h2 className="text-4xl font-bold mb-4">Welcome to Your Wardrobe!</h2>
							<p className="text-xl">Entering the virtual space...</p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default PortalTravel
