// User types
export interface User {
	id: string
	email: string
	username: string
	displayName: string
	avatar?: string
	bio?: string
	isPrivate: boolean
	isVerified: boolean
	createdAt: string
	profile?: UserProfile
	styleProfile?: StyleProfile
}

export interface UserProfile {
	id: string
	userId: string
	firstName?: string
	lastName?: string
	dateOfBirth?: string
	gender?: string
	location?: string
	website?: string
	phone?: string
	height?: number
	weight?: number
	chestBust?: number
	waist?: number
	hips?: number
	shoulderWidth?: number
	currency: string
	language: string
	timezone: string
}

export interface StyleProfile {
	id: string
	userId: string
	preferredStyles: string[]
	preferredColors: string[]
	brandPrefs: string[]
	priceRange: {
		min: number
		max: number
	}
	styleVector?: number[]
	colorPalette?: string[]
	occupation?: string
	lifestyle: string[]
	occasions: string[]
}

// Avatar types
export interface Avatar3D {
	id: string
	userId: string
	name: string
	description?: string
	modelUrl: string
	thumbnailUrl: string
	hunyuanId?: string
	meshData?: any
	bodyType: string
	skinTone: string
	hairStyle: string
	hairColor: string
	eyeColor: string
	isDefault: boolean
	isPublic: boolean
	createdAt: string
	updatedAt: string
}

// Wardrobe types
export interface Garment {
	id: string
	userId: string
	name: string
	description?: string
	category: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'outerwear'
	subcategory?: string
	brand?: string
	images: string[]
	color: string
	pattern?: string
	size?: string
	material?: string
	care?: string
	purchasePrice?: number
	purchaseDate?: string
	retailUrl?: string
	model3dUrl?: string
	arMetadata?: any
	wearCount: number
	lastWorn?: string
	tags: string[]
	createdAt: string
	updatedAt: string
}

export interface Outfit {
	id: string
	userId: string
	name: string
	description?: string
	occasion: string[]
	season: string[]
	weather: string[]
	imageUrl?: string
	wearCount: number
	lastWorn?: string
	isPublic: boolean
	isTemplate: boolean
	items: OutfitItem[]
	createdAt: string
	updatedAt: string
}

export interface OutfitItem {
	id: string
	outfitId: string
	garmentId: string
	garment: Garment
	position?: any
}

// Social types
export interface Post {
	id: string
	userId: string
	user: {
		id: string
		username: string
		displayName: string
		avatar?: string
		isVerified: boolean
	}
	content?: string
	imageUrls: string[]
	outfitId?: string
	outfit?: Outfit
	tags: string[]
	isPublic: boolean
	createdAt: string
	updatedAt: string
	_count: {
		likes: number
		comments: number
	}
	isLiked?: boolean
}

export interface Comment {
	id: string
	userId: string
	user: {
		id: string
		username: string
		displayName: string
		avatar?: string
	}
	postId: string
	content: string
	createdAt: string
	updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
	success: boolean
	data?: T
	message?: string
	error?: string
}

export interface PaginatedResponse<T> {
	data: T[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

// AI types
export interface StyleAnalysis {
	category: string
	style: string[]
	colors: string[]
	pattern: string
	occasions: string[]
	seasons: string[]
	tips: string[]
}

export interface OutfitRecommendation {
	id: string
	name: string
	description: string
	items: {
		category: string
		description: string
		color: string
		style: string
	}[]
	occasion: string
	confidence: number
	reasons: string[]
}

export interface ColorPalette {
	baseColor: string
	colors: {
		hex: string
		name: string
		role: 'primary' | 'accent' | 'neutral' | 'complement'
		usage: string
	}[]
	combinations: string[][]
}

// Form types
export interface LoginForm {
	emailOrUsername: string
	password: string
}

export interface RegisterForm {
	email: string
	username: string
	password: string
	confirmPassword: string
	displayName: string
}

export interface GarmentForm {
	name: string
	category: string
	subcategory?: string
	brand?: string
	color: string
	pattern?: string
	size?: string
	material?: string
	description?: string
	purchasePrice?: number
	retailUrl?: string
	tags: string[]
	images: File[]
}

export interface OutfitForm {
	name: string
	description?: string
	garmentIds: string[]
	occasion: string[]
	season: string[]
	weather: string[]
}
