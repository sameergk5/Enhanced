import { Environment, Float, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from 'three'

// Morphing Geometry Component
function MorphingGeometry() {
	const meshRef = useRef<THREE.Mesh>(null)
	const materialRef = useRef<THREE.MeshStandardMaterial>(null)

	useFrame((state) => {
		if (meshRef.current && materialRef.current) {
			const time = state.clock.elapsedTime

			// Morphing animation
			meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.3
			meshRef.current.rotation.y = time * 0.2
			meshRef.current.rotation.z = Math.cos(time * 0.3) * 0.1

			// Color morphing
			const hue = (time * 0.1) % 1
			materialRef.current.color.setHSL(hue, 0.7, 0.6)
			materialRef.current.emissive.setHSL(hue, 0.5, 0.1)
		}
	})

	return (
		<Float speed={2} rotationIntensity={1} floatIntensity={2}>
			<mesh ref={meshRef}>
				<dodecahedronGeometry args={[1, 0]} />
				<meshStandardMaterial
					ref={materialRef}
					color="#ff6b6b"
					emissive="#ff6b6b"
					emissiveIntensity={0.2}
					roughness={0.1}
					metalness={0.9}
				/>
			</mesh>
		</Float>
	)
}

// Crystal Formation Component
function CrystalFormation() {
	const crystals = [
		{ position: [0, 0, 0], scale: 1, rotation: [0, 0, 0] },
		{ position: [2, 1, -1], scale: 0.7, rotation: [0.5, 0, 0.3] },
		{ position: [-1.5, -0.5, 1], scale: 0.5, rotation: [-0.3, 0.8, 0] },
		{ position: [0.8, -1.2, -0.5], scale: 0.6, rotation: [0.2, -0.5, 0.7] },
		{ position: [-0.5, 1.5, 0.8], scale: 0.4, rotation: [-0.7, 0.3, -0.2] }
	]

	return (
		<group>
			{crystals.map((crystal, index) => (
				<Float
					key={index}
					speed={1 + index * 0.2}
					rotationIntensity={0.5}
					floatIntensity={1}
				>
					<mesh
						position={crystal.position as [number, number, number]}
						rotation={crystal.rotation as [number, number, number]}
						scale={crystal.scale}
					>
						<octahedronGeometry args={[0.5, 0]} />
						<meshStandardMaterial
							color={`hsl(${index * 60}, 70%, 60%)`}
							emissive={`hsl(${index * 60}, 70%, 20%)`}
							transparent
							opacity={0.8}
							roughness={0.1}
							metalness={0.8}
						/>
					</mesh>
				</Float>
			))}
		</group>
	)
}

// Advanced Portal Ring with Particles
function AdvancedPortalRing({ radius = 2, position = [0, 0, 0] }) {
	const ringRef = useRef<THREE.Mesh>(null)
	const particlesRef = useRef<THREE.Points>(null)

	// Create particle positions around the ring
	const particleCount = 100
	const particlePositions = React.useMemo(() => {
		const positions = new Float32Array(particleCount * 3)
		for (let i = 0; i < particleCount; i++) {
			const angle = (i / particleCount) * Math.PI * 2
			const x = Math.cos(angle) * radius
			const y = Math.sin(angle) * radius
			const z = (Math.random() - 0.5) * 0.2

			positions[i * 3] = x
			positions[i * 3 + 1] = y
			positions[i * 3 + 2] = z
		}
		return positions
	}, [radius])

	useFrame((state) => {
		const time = state.clock.elapsedTime

		if (ringRef.current) {
			ringRef.current.rotation.z = time * 0.5
		}

		if (particlesRef.current) {
			particlesRef.current.rotation.z = -time * 0.3
			const positions = particlesRef.current.geometry.attributes.position.array as Float32Array

			for (let i = 0; i < particleCount; i++) {
				const i3 = i * 3
				positions[i3 + 2] = Math.sin(time * 2 + i * 0.1) * 0.3
			}

			particlesRef.current.geometry.attributes.position.needsUpdate = true
		}
	})

	return (
		<group position={position as [number, number, number]}>
			{/* Main ring */}
			<mesh ref={ringRef}>
				<torusGeometry args={[radius, 0.05, 16, 100]} />
				<meshStandardMaterial
					color="#06b6d4"
					emissive="#06b6d4"
					emissiveIntensity={0.5}
					transparent
					opacity={0.8}
				/>
			</mesh>

			{/* Particle ring */}
			<points ref={particlesRef}>
				<bufferGeometry>
					<bufferAttribute
						attach="attributes-position"
						count={particleCount}
						array={particlePositions}
						itemSize={3}
					/>
				</bufferGeometry>
				<pointsMaterial
					size={0.03}
					color="#ffffff"
					transparent
					opacity={0.8}
					sizeAttenuation={true}
				/>
			</points>
		</group>
	)
}

// Fashion Mannequin Component
function FashionMannequin() {
	const groupRef = useRef<THREE.Group>(null)

	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
		}
	})

	return (
		<group ref={groupRef}>
			{/* Body */}
			<mesh position={[0, 0, 0]}>
				<capsuleGeometry args={[0.3, 1.2, 4, 8]} />
				<meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} />
			</mesh>

			{/* Head */}
			<mesh position={[0, 0.9, 0]}>
				<sphereGeometry args={[0.2, 16, 16]} />
				<meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} />
			</mesh>

			{/* Arms */}
			<mesh position={[0.4, 0.3, 0]} rotation={[0, 0, 0.3]}>
				<capsuleGeometry args={[0.08, 0.6, 4, 8]} />
				<meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} />
			</mesh>

			<mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, -0.3]}>
				<capsuleGeometry args={[0.08, 0.6, 4, 8]} />
				<meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} />
			</mesh>

			{/* Legs */}
			<mesh position={[0.15, -0.9, 0]}>
				<capsuleGeometry args={[0.1, 0.8, 4, 8]} />
				<meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} />
			</mesh>

			<mesh position={[-0.15, -0.9, 0]}>
				<capsuleGeometry args={[0.1, 0.8, 4, 8]} />
				<meshStandardMaterial color="#f8f9fa" roughness={0.3} metalness={0.1} />
			</mesh>

			{/* Fashion Accessories */}
			<Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.3}>
				<mesh position={[0.6, 0.5, 0]}>
					<torusGeometry args={[0.15, 0.05, 8, 16]} />
					<meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
				</mesh>
			</Float>
		</group>
	)
}

// 3D Scene Showcase Component
interface Advanced3DSceneProps {
	variant?: 'morphing' | 'crystal' | 'portal' | 'mannequin'
}

const Advanced3DScene: React.FC<Advanced3DSceneProps> = ({ variant = 'morphing' }) => {
	const renderScene = () => {
		switch (variant) {
			case 'crystal':
				return <CrystalFormation />
			case 'portal':
				return <AdvancedPortalRing radius={2} position={[0, 0, 0]} />
			case 'mannequin':
				return <FashionMannequin />
			default:
				return <MorphingGeometry />
		}
	}

	return (
		<div className="w-full h-64 relative">
			<Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
				<Environment preset="sunset" />
				<ambientLight intensity={0.4} />
				<pointLight position={[10, 10, 10]} intensity={1} />
				<pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ecdc4" />

				{renderScene()}

				<OrbitControls
					enablePan={false}
					enableZoom={false}
					autoRotate
					autoRotateSpeed={2}
				/>
			</Canvas>
		</div>
	)
}

export default Advanced3DScene
export { AdvancedPortalRing, CrystalFormation, FashionMannequin, MorphingGeometry }
