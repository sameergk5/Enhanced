export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	preferences?: UserPreferences;
}

export interface UserPreferences {
	styleTypes: string[];
	favoriteColors: string[];
	sizingInfo: SizingInfo;
	notifications: NotificationSettings;
}

export interface SizingInfo {
	shirt: string;
	pants: string;
	shoes: string;
	dress: string;
}

export interface NotificationSettings {
	pushEnabled: boolean;
	emailEnabled: boolean;
	smsEnabled: boolean;
	recommendationsEnabled: boolean;
}

export interface WardrobeItem {
	id: string;
	name: string;
	brand: string;
	category: string;
	color: string;
	size: string;
	imageUrl?: string;
	tags: string[];
	lastWorn?: string;
	price?: number;
	purchaseDate?: string;
}

export interface Outfit {
	id: string;
	name: string;
	items: WardrobeItem[];
	imageUrl?: string;
	tags: string[];
	occasions: string[];
	createdAt: string;
	lastWorn?: string;
}

export interface Avatar {
	id: string;
	height: number;
	measurements: BodyMeasurements;
	skinTone: string;
	hairColor: string;
	hairStyle: string;
	bodyType: string;
}

export interface BodyMeasurements {
	chest: number;
	waist: number;
	hips: number;
	shoulders: number;
	inseam: number;
}

export interface SocialPost {
	id: string;
	userId: string;
	username: string;
	userAvatar: string;
	content: string;
	imageUrl?: string;
	likes: number;
	comments: number;
	timestamp: string;
	isLiked: boolean;
	outfit?: Outfit;
}

export interface StyleRecommendation {
	id: string;
	outfit: Outfit;
	confidence: number;
	reason: string;
	occasion: string;
	weather?: string;
}

export interface APIResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
}
