import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, useScroll, useTransform } from 'framer-motion';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Loading component
const LoadingScreen = () => (
	<div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center z-50">
		<div className="text-center">
			<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
			<p className="text-white text-xl">Loading WardrobeAI...</p>
		</div>
	</div>
);

// Avatar Component with 3D animation
const Avatar = () => {
	const meshRef = useRef<THREE.Mesh>(null);
	const sphereRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
			meshRef.current.rotation.y += 0.01;
		}
		if (sphereRef.current) {
			sphereRef.current.rotation.x += 0.005;
			sphereRef.current.rotation.z += 0.008;
		}
	});

	return (
		<group position={[0, 0, 0]}>
			<mesh ref={meshRef} position={[0, 0, 0]}>
				<capsuleGeometry args={[0.5, 1.5, 4, 8]} />
				<meshStandardMaterial color="#8b5cf6" metalness={0.7} roughness={0.3} />
			</mesh>
			<mesh ref={sphereRef} position={[0, 1, 0]}>
				<sphereGeometry args={[0.3, 32, 32]} />
				<meshStandardMaterial color="#a855f7" metalness={0.5} roughness={0.4} />
			</mesh>
		</group>
	);
};

// StarField Component
const StarField = () => {
	const points = useRef<THREE.Points>(null);

	const starPositions = React.useMemo(() => {
		const positions = new Float32Array(1000 * 3);
		for (let i = 0; i < 1000; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 100;
			positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
		}
		return positions;
	}, []);

	useFrame(() => {
		if (points.current) {
			points.current.rotation.x += 0.0005;
			points.current.rotation.y += 0.0005;
		}
	});

	return (
		<points ref={points}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={starPositions.length / 3}
					array={starPositions}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial size={0.1} color="#ffffff" sizeAttenuation={true} />
		</points>
	);
};

// Portal Ring Component
const PortalRing = () => {
	const ringRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (ringRef.current) {
			ringRef.current.rotation.z += 0.02;
			const material = ringRef.current.material as THREE.MeshStandardMaterial;
			if (material && 'opacity' in material) {
				material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
			}
		}
	});

	return (
		<mesh ref={ringRef} position={[0, 0, -5]}>
			<torusGeometry args={[3, 0.1, 16, 100]} />
			<meshStandardMaterial
				color="#60a5fa"
				transparent
				opacity={0.5}
				emissive="#1e40af"
				emissiveIntensity={0.2}
			/>
		</mesh>
	);
};

// Interactive 3D Homepage
const InteractiveHomepage = () => {
	const { camera } = useThree();

	useEffect(() => {
		if (camera) {
			camera.position.set(0, 2, 8);
		}
	}, [camera]);

	return (
		<>
			<PerspectiveCamera makeDefault position={[0, 2, 8]} fov={75} />
			<OrbitControls
				enablePan={false}
				enableZoom={false}
				maxPolarAngle={Math.PI / 2}
				minPolarAngle={Math.PI / 3}
			/>
			<ambientLight intensity={0.5} />
			<pointLight position={[10, 10, 10]} intensity={1} />
			<directionalLight position={[-10, -10, -5]} intensity={0.5} />

			<StarField />
			<Avatar />
			<PortalRing />

			<Environment preset="night" />
		</>
	);
};

// Main Landing Component
const Landing: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [portalActive, setPortalActive] = useState(false);

	const { scrollYProgress } = useScroll();
	const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
	const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 2000);
		return () => clearTimeout(timer);
	}, []);

	const handlePortalActivation = () => {
		setPortalActive(true);
		setTimeout(() => {
			// Navigate to main app or trigger portal effect
			console.log('Portal activated!');
		}, 1000);
	};

	if (isLoading) {
		return <LoadingScreen />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
			{/* 3D Canvas Background */}
			<div className="absolute inset-0 z-0">
				<Canvas>
					<Suspense fallback={null}>
						<InteractiveHomepage />
					</Suspense>
				</Canvas>
			</div>

			{/* Content Overlay */}
			<motion.div
				style={{ opacity, scale }}
				className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4"
			>
				<motion.h1
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.5 }}
					className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
				>
					WardrobeAI
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.8 }}
					className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl"
				>
					Experience the future of fashion with AI-powered styling and virtual try-ons
				</motion.p>

				<motion.button
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, delay: 1.2 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handlePortalActivation}
					className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 ${portalActive
							? 'bg-green-500 text-white'
							: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
						}`}
				>
					{portalActive ? 'Portal Activated!' : 'Enter Portal'}
				</motion.button>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 1.5 }}
					className="mt-12 flex space-x-8"
				>
					<div className="text-center">
						<div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
							<span className="text-2xl">👗</span>
						</div>
						<p className="text-gray-400">AI Styling</p>
					</div>
					<div className="text-center">
						<div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
							<span className="text-2xl">🤖</span>
						</div>
						<p className="text-gray-400">Virtual Try-On</p>
					</div>
					<div className="text-center">
						<div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
							<span className="text-2xl">✨</span>
						</div>
						<p className="text-gray-400">3D Experience</p>
					</div>
				</motion.div>
			</motion.div>

			{/* Scroll Indicator */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1, delay: 2 }}
				className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
			>
				<div className="flex flex-col items-center text-gray-400">
					<span className="text-sm mb-2">Scroll to explore</span>
					<motion.div
						animate={{ y: [0, 10, 0] }}
						transition={{ duration: 2, repeat: Infinity }}
						className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
					>
						<div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
};

export default Landing;
