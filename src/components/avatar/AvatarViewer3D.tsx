import { Environment, OrbitControls, PresentationControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

interface AvatarModel3DProps {
	avatarUrl: string
	className?: string
	autoRotate?: boolean
	enableControls?: boolean
	onLoadStart?: () => void
	onLoadComplete?: () => void
	onLoadError?: (error: Error) => void
}

// Avatar Model Component
function AvatarModel({
	url,
	onLoadStart,
	onLoadComplete,
	onLoadError
}: {
	url: string
	onLoadStart?: () => void
	onLoadComplete?: () => void
	onLoadError?: (error: Error) => void
}) {
	const groupRef = useRef<Group>(null)
	const [gltf, setGltf] = useState<any>(null)

	useEffect(() => {
		if (onLoadStart) onLoadStart()

		const loader = new GLTFLoader()
		loader.load(
			url,
			(loadedGltf: any) => {
				setGltf(loadedGltf)
				if (onLoadComplete) onLoadComplete()
			},
			undefined,
			(error: unknown) => {
				console.error('Error loading avatar:', error)
				if (onLoadError) onLoadError(error instanceof Error ? error : new Error('Avatar load error'))
			}
		)
	}, [url, onLoadStart, onLoadComplete, onLoadError])

	useFrame(() => {
		if (groupRef.current) {
			// Optional subtle animations can be added here
		}
	})

	if (!gltf) {
		return null
	}

	return (
		<group ref={groupRef}>
			<primitive object={gltf.scene} scale={1} />
		</group>
	)
}

// Loading Component
function AvatarLoader() {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="text-center">
				<Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
				<p className="text-sm text-gray-600">Loading avatar...</p>
			</div>
		</div>
	)
}

// Error Component
function AvatarError({ error, onRetry }: { error: string; onRetry?: () => void }) {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="text-center p-4">
				<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
					<span className="text-red-500 text-2xl">⚠️</span>
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load avatar</h3>
				<p className="text-sm text-gray-600 mb-4">{error}</p>
				{onRetry && (
					<button
						onClick={onRetry}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
					>
						<RotateCcw className="w-4 h-4 inline mr-2" />
						Retry
					</button>
				)}
			</div>
		</div>
	)
}

// Main Avatar Viewer Component
export default function AvatarViewer3D({
	avatarUrl,
	className = '',
	autoRotate = false,
	enableControls = true,
	onLoadStart,
	onLoadComplete,
	onLoadError
}: AvatarModel3DProps) {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [zoom, setZoom] = useState(1)

	const handleLoadStart = () => {
		setLoading(true)
		setError(null)
		if (onLoadStart) onLoadStart()
	}

	const handleLoadComplete = () => {
		setLoading(false)
		if (onLoadComplete) onLoadComplete()
	}

	const handleLoadError = (err: Error) => {
		setLoading(false)
		setError(err.message)
		if (onLoadError) onLoadError(err)
	}

	const handleRetry = () => {
		setError(null)
		handleLoadStart()
	}

	const handleZoomIn = () => {
		setZoom(prev => Math.min(prev + 0.2, 3))
	}

	const handleZoomOut = () => {
		setZoom(prev => Math.max(prev - 0.2, 0.5))
	}

	const handleResetView = () => {
		setZoom(1)
	}

	if (error) {
		return (
			<div className={`relative ${className}`}>
				<AvatarError error={error} onRetry={handleRetry} />
			</div>
		)
	}

	return (
		<div className={`relative ${className}`}>
			{/* 3D Canvas */}
			<Canvas
				camera={{ position: [0, 0, 3], fov: 50 }}
				className="w-full h-full"
				dpr={[1, 2]}
			>
				<ambientLight intensity={0.5} />
				<directionalLight
					position={[10, 10, 5]}
					intensity={1}
					castShadow
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
				/>
				<pointLight position={[-10, -10, -10]} intensity={0.5} />

				<Suspense fallback={null}>
					<AvatarModel
						url={avatarUrl}
						onLoadStart={handleLoadStart}
						onLoadComplete={handleLoadComplete}
						onLoadError={handleLoadError}
					/>

					{/* Environment for realistic lighting */}
					<Environment preset="studio" />
				</Suspense>

				{/* Controls */}
				{enableControls && (
					<PresentationControls
						enabled={true}
						global={false}
						cursor={true}
						snap={false}
						speed={1}
						zoom={zoom}
						rotation={[0, 0, 0]}
						polar={[-Math.PI / 3, Math.PI / 3]}
						azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
					>
						<OrbitControls
							enablePan={false}
							enableZoom={true}
							enableRotate={true}
							autoRotate={autoRotate}
							autoRotateSpeed={2}
							minPolarAngle={Math.PI / 6}
							maxPolarAngle={Math.PI - Math.PI / 6}
						/>
					</PresentationControls>
				)}
			</Canvas>

			{/* Loading Overlay */}
			{loading && (
				<div className="absolute inset-0 bg-white bg-opacity-90 z-10">
					<AvatarLoader />
				</div>
			)}

			{/* Control Panel */}
			{enableControls && !loading && !error && (
				<div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
					<button
						onClick={handleZoomIn}
						className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
						title="Zoom In"
					>
						<ZoomIn className="w-4 h-4" />
					</button>
					<button
						onClick={handleZoomOut}
						className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
						title="Zoom Out"
					>
						<ZoomOut className="w-4 h-4" />
					</button>
					<button
						onClick={handleResetView}
						className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
						title="Reset View"
					>
						<RotateCcw className="w-4 h-4" />
					</button>
				</div>
			)}

			{/* Avatar Info Overlay */}
			{!loading && !error && (
				<div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm z-20">
					<p>Click and drag to rotate</p>
					<p>Scroll to zoom</p>
				</div>
			)}
		</div>
	)
}
