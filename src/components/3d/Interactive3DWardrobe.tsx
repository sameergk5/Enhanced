import { animated, useSpring } from '@react-spring/three'
import {
	ContactShadows,
	Cylinder,
	Environment,
	Html,
	MeshReflectorMaterial,
	OrbitControls,
	Plane,
	Ring,
	RoundedBox,
	Sparkles,
	Text,
	Torus,
	useCursor
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// Types for wardrobe items
interface WardrobeItem {
	id: string
	name: string
	type: 'shirt' | 'pants' | 'dress' | 'jacket' | 'shoes' | 'accessories'
	color: string
	position: [number, number, number]
	rotation?: [number, number, number]
	scale?: number
	imageUrl?: string
	isSelected: boolean
}

// Interactive Clothing Item Component
function ClothingItem({
	item,
	onClick,
	onHover
}: {
	item: WardrobeItem
	onClick: (item: WardrobeItem) => void
	onHover: (item: WardrobeItem | null) => void
}) {
	const meshRef = useRef<THREE.Mesh>(null)
	const [hovered, setHovered] = useState(false)

	useCursor(hovered)

	const { scale, position } = useSpring({
		scale: hovered ? 1.2 : (item.isSelected ? 1.1 : 1),
		position: hovered ? [item.position[0], item.position[1] + 0.2, item.position[2]] : item.position,
		config: { mass: 1, tension: 280, friction: 60 }
	})

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
			if (item.isSelected) {
				meshRef.current.rotation.y += 0.02
			}
		}
	})

	const getGeometry = () => {
		switch (item.type) {
			case 'shirt':
				return <boxGeometry args={[0.8, 1, 0.1]} />
			case 'pants':
				return <cylinderGeometry args={[0.3, 0.4, 1.2, 8]} />
			case 'dress':
				return <coneGeometry args={[0.6, 1.5, 8]} />
			case 'jacket':
				return <boxGeometry args={[0.9, 1.1, 0.15]} />
			case 'shoes':
				return <boxGeometry args={[0.5, 0.3, 0.8]} />
			case 'accessories':
				return <sphereGeometry args={[0.3, 16, 16]} />
			default:
				return <boxGeometry args={[0.8, 1, 0.1]} />
		}
	}

	return (
		<animated.group
			position={position as any}
			scale={scale as any}
		>
			<mesh
				ref={meshRef}
				onClick={() => onClick(item)}
				onPointerOver={(e) => {
					e.stopPropagation()
					setHovered(true)
					onHover(item)
				}}
				onPointerOut={() => {
					setHovered(false)
					onHover(null)
				}}
				rotation={item.rotation || [0, 0, 0]}
			>
				{getGeometry()}
				<meshStandardMaterial
					color={item.color}
					roughness={0.2}
					metalness={hovered ? 0.3 : 0.1}
					transparent
					opacity={item.isSelected ? 1 : 0.8}
					emissive={item.isSelected ? new THREE.Color(item.color).multiplyScalar(0.1) : new THREE.Color(0x000000)}
				/>
			</mesh>

			{/* Selection Ring */}
			{item.isSelected && (
				<Ring args={[1.2, 1.4, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
					<meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
				</Ring>
			)}

			{/* Hover Sparkles */}
			{hovered && (
				<Sparkles
					count={20}
					scale={2}
					size={1}
					speed={0.4}
					color={item.color}
				/>
			)}

			{/* Item Label */}
			{hovered && (
				<Html
					position={[0, 1.5, 0]}
					center
					occlude
					transform
					sprite
				>
					<div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm font-medium">
						{item.name}
					</div>
				</Html>
			)}
		</animated.group>
	)
}

// Wardrobe Cabinet Component
function WardrobeStructure() {
	return (
		<group>
			{/* Back Wall */}
			<Plane args={[20, 15]} position={[0, 0, -5]} rotation={[0, 0, 0]}>
				<meshStandardMaterial
					color="#f8f9fa"
					roughness={0.8}
					metalness={0.1}
				/>
			</Plane>

			{/* Side Walls */}
			<Plane args={[10, 15]} position={[-10, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
				<meshStandardMaterial color="#e9ecef" />
			</Plane>
			<Plane args={[10, 15]} position={[10, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
				<meshStandardMaterial color="#e9ecef" />
			</Plane>

			{/* Shelves */}
			{[-2, 2, 6].map((y, i) => (
				<RoundedBox
					key={i}
					args={[18, 0.2, 8]}
					position={[0, y, -1]}
					radius={0.05}
					smoothness={4}
				>
					<meshStandardMaterial color="#dee2e6" />
				</RoundedBox>
			))}

			{/* Hanging Rods */}
			{[0, 4].map((y, i) => (
				<Cylinder
					key={i}
					args={[0.05, 0.05, 16]}
					position={[0, y, 2]}
					rotation={[0, 0, Math.PI / 2]}
				>
					<meshStandardMaterial color="#6c757d" metalness={0.8} roughness={0.2} />
				</Cylinder>
			))}

			{/* Mirror */}
			<Plane args={[3, 6]} position={[8, 2, 2]} rotation={[0, -Math.PI / 6, 0]}>
				<MeshReflectorMaterial
					blur={[300, 100]}
					resolution={512}
					mirror={0.5}
					color="#ffffff"
					metalness={0.5}
					roughness={0.1}
					reflectorOffset={0}
				/>
			</Plane>
		</group>
	)
}

// Category Filter Component
function CategoryFilter({
	categories,
	selectedCategory,
	onCategoryChange
}: {
	categories: string[]
	selectedCategory: string
	onCategoryChange: (category: string) => void
}) {
	return (
		<div className="absolute top-4 left-4 z-10">
			<div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
				<h3 className="text-lg font-semibold mb-3">Categories</h3>
				<div className="space-y-2">
					{categories.map((category) => (
						<motion.button
							key={category}
							className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category
								? 'bg-purple-600 text-white'
								: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
								}`}
							onClick={() => onCategoryChange(category)}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							{category.charAt(0).toUpperCase() + category.slice(1)}
						</motion.button>
					))}
				</div>
			</div>
		</div>
	)
}

// Item Details Panel
function ItemDetailsPanel({
	item,
	onClose
}: {
	item: WardrobeItem | null
	onClose: () => void
}) {
	if (!item) return null

	return (
		<AnimatePresence>
			<motion.div
				className="absolute top-4 right-4 z-10"
				initial={{ opacity: 0, x: 300 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: 300 }}
				transition={{ type: 'spring', damping: 25, stiffness: 300 }}
			>
				<div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl max-w-sm">
					<div className="flex justify-between items-start mb-4">
						<h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
						<button
							onClick={onClose}
							className="text-gray-500 hover:text-gray-700 text-xl font-bold"
						>
							×
						</button>
					</div>

					<div className="space-y-3">
						<div className="flex items-center space-x-2">
							<div
								className="w-6 h-6 rounded-full border-2 border-gray-300"
								style={{ backgroundColor: item.color }}
							/>
							<span className="text-gray-600">Color</span>
						</div>

						<div>
							<span className="text-gray-600">Type: </span>
							<span className="font-medium text-gray-800 capitalize">{item.type}</span>
						</div>

						<div className="pt-4 space-y-2">
							<motion.button
								className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								Try On Avatar
							</motion.button>

							<motion.button
								className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								Add to Outfit
							</motion.button>
						</div>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	)
}

// Portal Entrance Effect (appears when user enters from portal)
function PortalEntrance() {
	const portalRef = useRef<THREE.Group>(null)

	useFrame((state) => {
		if (portalRef.current) {
			portalRef.current.rotation.y += 0.01
			const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
			portalRef.current.scale.setScalar(scale)
		}
	})

	return (
		<group ref={portalRef} position={[0, 5, -4]}>
			{/* Portal Ring */}
			<Torus args={[2, 0.1, 16, 100]}>
				<meshStandardMaterial
					color="#8b5cf6"
					emissive="#4c1d95"
					emissiveIntensity={0.5}
					roughness={0.1}
					metalness={0.8}
				/>
			</Torus>

			{/* Portal Center */}
			<mesh rotation={[0, 0, 0]}>
				<cylinderGeometry args={[1.8, 1.8, 0.1, 32]} />
				<meshStandardMaterial
					color="#1e1b4b"
					transparent
					opacity={0.3}
					side={THREE.DoubleSide}
				/>
			</mesh>

			{/* Portal Sparkles */}
			<Sparkles
				count={100}
				scale={4}
				size={1}
				speed={0.3}
				color="#8b5cf6"
			/>

			{/* Portal Text */}
			<Text
				position={[0, -3, 0]}
				fontSize={0.5}
				color="#8b5cf6"
				anchorX="center"
				anchorY="middle"
			>
				Portal Connection Active
			</Text>
		</group>
	)
}

// Main 3D Wardrobe Scene
function WardrobeScene({
	items,
	selectedCategory,
	onItemClick,
	onItemHover
}: {
	items: WardrobeItem[]
	selectedCategory: string
	onItemClick: (item: WardrobeItem) => void
	onItemHover: (item: WardrobeItem | null) => void
}) {
	const filteredItems = useMemo(() => {
		return selectedCategory === 'all'
			? items
			: items.filter(item => item.type === selectedCategory)
	}, [items, selectedCategory])

	return (
		<>
			{/* Environment and Lighting */}
			<Environment preset="apartment" />
			<ambientLight intensity={0.6} />
			<directionalLight position={[10, 10, 5]} intensity={1} castShadow />
			<pointLight position={[-5, 5, 5]} color="#8b5cf6" intensity={0.3} />

			{/* Portal Entrance Effect */}
			<PortalEntrance />

			{/* Wardrobe Structure */}
			<WardrobeStructure />

			{/* Clothing Items */}
			{filteredItems.map((item) => (
				<ClothingItem
					key={item.id}
					item={item}
					onClick={onItemClick}
					onHover={onItemHover}
				/>
			))}

			{/* Floor Reflection */}
			<ContactShadows
				position={[0, -7, 0]}
				opacity={0.3}
				scale={30}
				blur={2}
				far={20}
			/>

			{/* Ambient Sparkles */}
			<Sparkles
				count={200}
				scale={15}
				size={0.5}
				speed={0.1}
				color="#e0e7ff"
			/>
		</>
	)
}

// Loading Component
function WardrobeLoader() {
	return (
		<Html center>
			<div className="flex flex-col items-center space-y-4">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
				<p className="text-purple-600 font-medium">Loading your wardrobe...</p>
			</div>
		</Html>
	)
}

// Main Interactive 3D Wardrobe Component
const Interactive3DWardrobe: React.FC = () => {
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
	const [hoveredItem, setHoveredItem] = useState<WardrobeItem | null>(null)
	const [selectedItemForDetails, setSelectedItemForDetails] = useState<WardrobeItem | null>(null)

	// Sample wardrobe items (replace with real data)
	const wardrobeItems: WardrobeItem[] = useMemo(() => [
		{ id: '1', name: 'Red Sweater', type: 'shirt' as const, color: '#ef4444', position: [-6, 4.5, 2] as [number, number, number], isSelected: false },
		{ id: '2', name: 'Blue Jeans', type: 'pants' as const, color: '#3b82f6', position: [-3, -1, 2] as [number, number, number], isSelected: false },
		{ id: '3', name: 'Green Dress', type: 'dress' as const, color: '#10b981', position: [0, 2.5, 2] as [number, number, number], isSelected: false },
		{ id: '4', name: 'Yellow Jacket', type: 'jacket' as const, color: '#f59e0b', position: [3, 4.5, 2] as [number, number, number], isSelected: false },
		{ id: '5', name: 'Black Shoes', type: 'shoes' as const, color: '#1f2937', position: [6, -6, 2] as [number, number, number], isSelected: false },
		{ id: '6', name: 'Pink Shirt', type: 'shirt' as const, color: '#ec4899', position: [-6, 2.5, 2] as [number, number, number], isSelected: false },
		{ id: '7', name: 'Navy Pants', type: 'pants' as const, color: '#1e3a8a', position: [0, -1, 2] as [number, number, number], isSelected: false },
		{ id: '8', name: 'Purple Accessories', type: 'accessories' as const, color: '#8b5cf6', position: [6, 6.5, 2] as [number, number, number], isSelected: false },
	].map(item => ({ ...item, isSelected: selectedItems.has(item.id) })), [selectedItems])

	const categories = ['all', 'shirt', 'pants', 'dress', 'jacket', 'shoes', 'accessories']

	const handleItemClick = useCallback((item: WardrobeItem) => {
		setSelectedItems(prev => {
			const newSet = new Set(prev)
			if (newSet.has(item.id)) {
				newSet.delete(item.id)
			} else {
				newSet.add(item.id)
			}
			return newSet
		})
		setSelectedItemForDetails(item)
	}, [])

	const handleItemHover = useCallback((item: WardrobeItem | null) => {
		setHoveredItem(item)
	}, [])

	return (
		<div className="w-full h-screen relative bg-gradient-to-b from-gray-50 to-gray-100">
			{/* Category Filter */}
			<CategoryFilter
				categories={categories}
				selectedCategory={selectedCategory}
				onCategoryChange={setSelectedCategory}
			/>

			{/* Item Details Panel */}
			<ItemDetailsPanel
				item={selectedItemForDetails}
				onClose={() => setSelectedItemForDetails(null)}
			/>

			{/* Stats Panel */}
			<div className="absolute bottom-4 left-4 z-10">
				<div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
					<h4 className="font-semibold text-gray-800 mb-2">Wardrobe Stats</h4>
					<div className="space-y-1 text-sm text-gray-600">
						<p>Total Items: {wardrobeItems.length}</p>
						<p>Selected: {selectedItems.size}</p>
						{hoveredItem && <p>Viewing: {hoveredItem.name}</p>}
					</div>
				</div>
			</div>

			{/* 3D Canvas */}
			<Canvas
				camera={{ position: [0, 3, 15], fov: 60 }}
				shadows
				gl={{
					antialias: true,
					alpha: true,
					powerPreference: "high-performance"
				}}
			>
				<Suspense fallback={<WardrobeLoader />}>
					<WardrobeScene
						items={wardrobeItems}
						selectedCategory={selectedCategory}
						onItemClick={handleItemClick}
						onItemHover={handleItemHover}
					/>
				</Suspense>

				<OrbitControls
					enablePan={true}
					enableZoom={true}
					enableRotate={true}
					maxPolarAngle={Math.PI / 2}
					minDistance={8}
					maxDistance={25}
				/>
			</Canvas>

			{/* Floating Action Button */}
			<motion.button
				className="absolute bottom-4 right-4 z-10 bg-purple-600 text-white p-4 rounded-full shadow-lg"
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				onClick={() => setSelectedItems(new Set())}
			>
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
			</motion.button>
		</div>
	)
}

export default Interactive3DWardrobe
