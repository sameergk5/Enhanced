// 3D Clothing Rendering and Layering Engine
import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { OutfitCombination, OutfitItem } from './virtualTryOn'

export interface RenderingOptions {
	quality: 'low' | 'medium' | 'high'
	enableShadows: boolean
	enablePostProcessing: boolean
	outputFormat: 'webp' | 'png' | 'jpg'
	resolution: { width: number; height: number }
}

export interface ClothingMesh {
	id: string
	garmentId: string
	mesh: THREE.Mesh
	material: THREE.Material
	layer: number
	blendMode?: string
	isVisible: boolean
	animationMixer?: THREE.AnimationMixer
}

export interface AvatarRenderData {
	avatarMesh: THREE.Group
	clothingMeshes: ClothingMesh[]
	skeleton: THREE.Skeleton | null
	pose: string
	boundingBox: THREE.Box3
}

export interface RenderResult {
	imageUrl: string
	renderTime: number
	meshCount: number
	triangleCount: number
	success: boolean
	error?: string
}

class ClothingRenderingEngine {
	private scene!: THREE.Scene
	private camera!: THREE.PerspectiveCamera
	private renderer!: THREE.WebGLRenderer
	private loader!: GLTFLoader
	private dracoLoader!: DRACOLoader
	private canvas!: HTMLCanvasElement

	// Lighting setup
	private ambientLight!: THREE.AmbientLight
	private directionalLight!: THREE.DirectionalLight
	private fillLight!: THREE.DirectionalLight

	// Post-processing
	private renderTarget!: THREE.WebGLRenderTarget

	constructor() {
		this.initializeRenderer()
		this.setupScene()
		this.setupLighting()
		this.setupLoaders()
	}

	/**
	 * Initialize the WebGL renderer
	 */
	private initializeRenderer(): void {
		// Create offscreen canvas for server-side rendering or headless mode
		this.canvas = document.createElement('canvas')
		this.canvas.width = 1024
		this.canvas.height = 1024

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true
		})

		this.renderer.setSize(1024, 1024)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.renderer.outputColorSpace = THREE.SRGBColorSpace
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping
		this.renderer.toneMappingExposure = 1.0

		// Create render target for post-processing
		this.renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			colorSpace: THREE.SRGBColorSpace
		})
	}

	/**
	 * Setup the 3D scene
	 */
	private setupScene(): void {
		this.scene = new THREE.Scene()
		this.scene.background = new THREE.Color(0xf5f5f5)

		// Setup camera
		this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
		this.camera.position.set(0, 1.6, 3)
		this.camera.lookAt(0, 1, 0)
	}

	/**
	 * Setup scene lighting for clothing visualization
	 */
	private setupLighting(): void {
		// Ambient light for overall illumination
		this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
		this.scene.add(this.ambientLight)

		// Main directional light (key light)
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
		this.directionalLight.position.set(5, 10, 5)
		this.directionalLight.castShadow = true
		this.directionalLight.shadow.mapSize.width = 2048
		this.directionalLight.shadow.mapSize.height = 2048
		this.directionalLight.shadow.camera.near = 0.5
		this.directionalLight.shadow.camera.far = 50
		this.directionalLight.shadow.camera.left = -10
		this.directionalLight.shadow.camera.right = 10
		this.directionalLight.shadow.camera.top = 10
		this.directionalLight.shadow.camera.bottom = -10
		this.scene.add(this.directionalLight)

		// Fill light for softening shadows
		this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
		this.fillLight.position.set(-5, 5, -5)
		this.scene.add(this.fillLight)

		// Rim light for definition
		const rimLight = new THREE.DirectionalLight(0xffffff, 0.2)
		rimLight.position.set(0, 5, -10)
		this.scene.add(rimLight)
	}

	/**
	 * Setup 3D model loaders
	 */
	private setupLoaders(): void {
		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('/draco/')

		this.loader = new GLTFLoader()
		this.loader.setDRACOLoader(this.dracoLoader)
	}

	/**
	 * Load avatar model from URL
	 */
	async loadAvatar(avatarUrl: string): Promise<THREE.Group> {
		return new Promise((resolve, reject) => {
			this.loader.load(
				avatarUrl,
				(gltf) => {
					const avatar = gltf.scene

					// Setup avatar materials for clothing compatibility
					avatar.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							child.castShadow = true
							child.receiveShadow = true

							// Ensure materials are compatible with clothing shaders
							if (child.material instanceof THREE.MeshStandardMaterial) {
								child.material.envMapIntensity = 0.5
							}
						}
					})

					// Scale and position avatar
					const box = new THREE.Box3().setFromObject(avatar)
					const center = box.getCenter(new THREE.Vector3())

					avatar.position.x = -center.x
					avatar.position.y = -box.min.y
					avatar.position.z = -center.z

					resolve(avatar)
				},
				(progress) => {
					console.log('Avatar loading progress:', progress)
				},
				(error) => {
					console.error('Failed to load avatar:', error)
					reject(error)
				}
			)
		})
	}

	/**
	 * Load clothing item model from garment data
	 */
	async loadClothingItem(garment: any): Promise<ClothingMesh | null> {
		try {
			// For now, we'll create a mock clothing mesh
			// In production, this would load from the garment's 3D model URL
			const geometry = this.createMockClothingGeometry(garment.category)
			const material = this.createClothingMaterial(garment)

			const mesh = new THREE.Mesh(geometry, material)
			mesh.name = garment.name
			mesh.castShadow = true
			mesh.receiveShadow = true

			return {
				id: `clothing_${garment.id}`,
				garmentId: garment.id,
				mesh,
				material,
				layer: this.getLayerForCategory(garment.category),
				isVisible: true
			}
		} catch (error) {
			console.error('Failed to load clothing item:', error)
			return null
		}
	}

	/**
	 * Create mock geometry for different clothing categories
	 */
	private createMockClothingGeometry(category: string): THREE.BufferGeometry {
		switch (category) {
			case 'top':
			case 'dress':
				return new THREE.CylinderGeometry(0.4, 0.5, 1.2, 16)
			case 'bottom':
				return new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16)
			case 'shoes':
				return new THREE.BoxGeometry(0.3, 0.15, 0.6)
			case 'outerwear':
				return new THREE.CylinderGeometry(0.45, 0.55, 1.3, 16)
			default:
				return new THREE.BoxGeometry(0.2, 0.2, 0.2)
		}
	}

	/**
	 * Create clothing material based on garment properties
	 */
	private createClothingMaterial(garment: any): THREE.Material {
		const color = this.parseColor(garment.color) || 0x888888

		const material = new THREE.MeshStandardMaterial({
			color: color,
			roughness: 0.7,
			metalness: 0.1,
			envMapIntensity: 0.5,
		})

		// Add texture if available
		if (garment.images && garment.images.length > 0) {
			const textureLoader = new THREE.TextureLoader()
			material.map = textureLoader.load(garment.images[0])
			material.map.colorSpace = THREE.SRGBColorSpace
		}

		// Apply material properties based on garment type
		switch (garment.material?.toLowerCase()) {
			case 'denim':
				material.roughness = 0.9
				material.metalness = 0.0
				break
			case 'silk':
				material.roughness = 0.2
				material.metalness = 0.0
				break
			case 'leather':
				material.roughness = 0.4
				material.metalness = 0.0
				break
			case 'cotton':
				material.roughness = 0.8
				material.metalness = 0.0
				break
		}

		return material
	}

	/**
	 * Parse color string to THREE.js color
	 */
	private parseColor(colorString: string): number | null {
		if (!colorString) return null

		const colorMap: Record<string, number> = {
			'red': 0xff0000,
			'blue': 0x0000ff,
			'green': 0x00ff00,
			'black': 0x000000,
			'white': 0xffffff,
			'gray': 0x808080,
			'grey': 0x808080,
			'yellow': 0xffff00,
			'orange': 0xffa500,
			'purple': 0x800080,
			'pink': 0xffc0cb,
			'brown': 0xa52a2a,
			'navy': 0x000080,
			'beige': 0xf5f5dc,
		}

		const lowerColor = colorString.toLowerCase()
		if (colorMap[lowerColor]) {
			return colorMap[lowerColor]
		}

		// Try to parse as hex color
		if (colorString.startsWith('#')) {
			return parseInt(colorString.substring(1), 16)
		}

		return null
	}

	/**
	 * Get layer order for clothing category
	 */
	private getLayerForCategory(category: string): number {
		const layerMap: Record<string, number> = {
			'shoes': 0,
			'bottom': 1,
			'dress': 2,
			'top': 3,
			'accessory': 4,
			'outerwear': 5
		}
		return layerMap[category] || 2
	}

	/**
	 * Apply clothing items to avatar with proper layering
	 */
	async applyClothingToAvatar(
		avatar: THREE.Group,
		outfit: OutfitCombination
	): Promise<AvatarRenderData> {
		// Clear existing clothing
		this.clearClothing()

		const clothingMeshes: ClothingMesh[] = []

		// Load and apply each clothing item
		for (const item of outfit.items) {
			const clothingMesh = await this.loadClothingItem(item.garment)
			if (clothingMesh) {
				// Position clothing on avatar
				this.positionClothingOnAvatar(clothingMesh, avatar, item)

				// Add to scene with proper layering
				clothingMesh.mesh.renderOrder = clothingMesh.layer
				this.scene.add(clothingMesh.mesh)
				clothingMeshes.push(clothingMesh)
			}
		}

		// Sort by layer for proper rendering order
		clothingMeshes.sort((a, b) => a.layer - b.layer)

		return {
			avatarMesh: avatar,
			clothingMeshes,
			skeleton: this.findSkeleton(avatar),
			pose: 'default',
			boundingBox: new THREE.Box3().setFromObject(avatar)
		}
	}

	/**
	 * Position clothing item on avatar
	 */
	private positionClothingOnAvatar(
		clothingMesh: ClothingMesh,
		_avatar: THREE.Group,
		item: OutfitItem
	): void {
		const mesh = clothingMesh.mesh

		// Basic positioning based on category
		switch (item.position) {
			case 'top':
				mesh.position.set(0, 1.3, 0)
				break
			case 'bottom':
				mesh.position.set(0, 0.6, 0)
				break
			case 'feet':
				mesh.position.set(0, 0.1, 0)
				break
			case 'outerwear':
				mesh.position.set(0, 1.35, 0)
				mesh.scale.setScalar(1.05) // Slightly larger for outer layer
				break
			case 'accessories':
				mesh.position.set(0, 1.7, 0)
				break
		}

		// Add slight variation to prevent z-fighting
		mesh.position.z += clothingMesh.layer * 0.001
	}

	/**
	 * Find skeleton in avatar for animation support
	 */
	private findSkeleton(avatar: THREE.Group): THREE.Skeleton | null {
		let skeleton: THREE.Skeleton | null = null

		avatar.traverse((child) => {
			if (child instanceof THREE.SkinnedMesh && child.skeleton) {
				skeleton = child.skeleton
			}
		})

		return skeleton
	}

	/**
	 * Clear all clothing from scene
	 */
	private clearClothing(): void {
		const clothingObjects = this.scene.children.filter(
			child => child.name.startsWith('clothing_')
		)

		clothingObjects.forEach(obj => {
			this.scene.remove(obj)
			if (obj instanceof THREE.Mesh) {
				obj.geometry.dispose()
				if (Array.isArray(obj.material)) {
					obj.material.forEach(mat => mat.dispose())
				} else {
					obj.material.dispose()
				}
			}
		})
	}

	/**
	 * Render the scene and return image data
	 */
	async renderScene(
		renderData: AvatarRenderData,
		options: Partial<RenderingOptions> = {}
	): Promise<RenderResult> {
		const startTime = performance.now()

		try {
			// Apply rendering options
			const opts: RenderingOptions = {
				quality: 'medium',
				enableShadows: true,
				enablePostProcessing: false,
				outputFormat: 'webp',
				resolution: { width: 1024, height: 1024 },
				...options
			}

			// Update renderer settings
			this.renderer.setSize(opts.resolution.width, opts.resolution.height)
			this.renderer.shadowMap.enabled = opts.enableShadows

			// Add avatar to scene if not already there
			if (!this.scene.children.includes(renderData.avatarMesh)) {
				this.scene.add(renderData.avatarMesh)
			}

			// Update camera for better framing
			this.frameAvatar(renderData.boundingBox)

			// Render the scene
			this.renderer.render(this.scene, this.camera)

			// Get image data
			const imageUrl = this.canvas.toDataURL(`image/${opts.outputFormat}`, 0.9)

			const renderTime = performance.now() - startTime

			return {
				imageUrl,
				renderTime,
				meshCount: this.scene.children.length,
				triangleCount: this.getTriangleCount(),
				success: true
			}
		} catch (error) {
			return {
				imageUrl: '',
				renderTime: performance.now() - startTime,
				meshCount: 0,
				triangleCount: 0,
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			}
		}
	}

	/**
	 * Frame the avatar in the camera view
	 */
	private frameAvatar(boundingBox: THREE.Box3): void {
		const center = boundingBox.getCenter(new THREE.Vector3())
		const size = boundingBox.getSize(new THREE.Vector3())

		const maxDim = Math.max(size.x, size.y, size.z)
		const distance = maxDim / (2 * Math.tan(this.camera.fov * Math.PI / 360))

		this.camera.position.set(0, center.y + size.y * 0.1, distance * 1.5)
		this.camera.lookAt(center)
	}

	/**
	 * Get total triangle count in scene
	 */
	private getTriangleCount(): number {
		let triangles = 0

		this.scene.traverse((obj) => {
			if (obj instanceof THREE.Mesh) {
				const geometry = obj.geometry
				if (geometry.index) {
					triangles += geometry.index.count / 3
				} else {
					triangles += geometry.attributes.position.count / 3
				}
			}
		})

		return Math.floor(triangles)
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this.renderer.dispose()
		this.renderTarget.dispose()
		this.dracoLoader.dispose()

		this.scene.traverse((obj) => {
			if (obj instanceof THREE.Mesh) {
				obj.geometry.dispose()
				if (Array.isArray(obj.material)) {
					obj.material.forEach(mat => mat.dispose())
				} else {
					obj.material.dispose()
				}
			}
		})
	}
}

// Create and export singleton instance
export const clothingRenderingEngine = new ClothingRenderingEngine()
export default clothingRenderingEngine
