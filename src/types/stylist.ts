// Fashion AI Stylist Types and Schema
// Task 8.1: Define Garment Attributes and Style Rule Schema

/**
 * Extended garment attributes for AI fashion styling
 */
export interface GarmentAttributes {
	// Basic identification
	id: string
	name: string
	brand?: string

	// Category classification
	category: GarmentCategory
	subcategory: GarmentSubcategory
	type: GarmentType

	// Visual attributes
	color: ColorAttribute
	pattern: PatternType
	material: MaterialType
	texture: TextureType

	// Style attributes
	styleKeywords: StyleKeyword[]
	occasion: OccasionType[]
	formality: FormalityLevel
	season: SeasonType[]

	// Fit and silhouette
	fit: FitType
	silhouette: SilhouetteType
	length: LengthType

	// Fashion metadata
	trendiness: TrendinessLevel
	versatility: VersatilityScore
	colorCompatibility: ColorCompatibilityProfile

	// User preferences
	isFavorite?: boolean
	wearFrequency?: WearFrequency
	personalRating?: number // 1-5 stars

	// Technical data
	images: string[]
	thumbnailUrl?: string
	arMetadata?: any
	createdAt: string
	updatedAt: string
}

/**
 * Main garment categories
 */
export type GarmentCategory =
	| 'top'
	| 'bottom'
	| 'dress'
	| 'shoes'
	| 'accessory'
	| 'outerwear'
	| 'undergarment'
	| 'activewear'

/**
 * Detailed subcategories
 */
export type GarmentSubcategory =
	// Tops
	| 't-shirt' | 'blouse' | 'shirt' | 'tank-top' | 'crop-top' | 'sweater' | 'cardigan' | 'hoodie'
	// Bottoms
	| 'jeans' | 'trousers' | 'shorts' | 'skirt' | 'leggings' | 'joggers'
	// Dresses
	| 'casual-dress' | 'formal-dress' | 'maxi-dress' | 'mini-dress' | 'midi-dress'
	// Shoes
	| 'sneakers' | 'boots' | 'heels' | 'flats' | 'sandals' | 'dress-shoes'
	// Accessories
	| 'jewelry' | 'bag' | 'hat' | 'scarf' | 'belt' | 'watch' | 'sunglasses'
	// Outerwear
	| 'jacket' | 'coat' | 'blazer' | 'vest' | 'windbreaker'

/**
 * Specific garment types for detailed classification
 */
export type GarmentType =
	// T-shirts & Tops
	| 'basic-tee' | 'graphic-tee' | 'polo' | 'henley' | 'button-down' | 'off-shoulder'
	// Pants & Bottoms
	| 'skinny-jeans' | 'straight-jeans' | 'wide-leg-pants' | 'cargo-pants' | 'chinos'
	// Dresses
	| 'wrap-dress' | 'shift-dress' | 'a-line-dress' | 'bodycon-dress' | 'shirt-dress'
	// Shoes
	| 'running-shoes' | 'canvas-sneakers' | 'ankle-boots' | 'knee-boots' | 'loafers'

/**
 * Color attribute with detailed information
 */
export interface ColorAttribute {
	primary: string // Hex color code
	secondary?: string[] // Additional colors in multi-color items
	colorFamily: ColorFamily
	colorIntensity: ColorIntensity
	undertone: ColorUndertone
	neutralCompatible: boolean
}

export type ColorFamily =
	| 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'
	| 'brown' | 'black' | 'white' | 'gray' | 'beige' | 'cream'

export type ColorIntensity = 'pastel' | 'muted' | 'vibrant' | 'deep' | 'neon'

export type ColorUndertone = 'warm' | 'cool' | 'neutral'

/**
 * Pattern types
 */
export type PatternType =
	| 'solid' | 'stripes' | 'polka-dots' | 'floral' | 'geometric' | 'abstract'
	| 'plaid' | 'checkered' | 'animal-print' | 'paisley' | 'tie-dye'

/**
 * Material types
 */
export type MaterialType =
	| 'cotton' | 'polyester' | 'denim' | 'silk' | 'wool' | 'linen' | 'leather'
	| 'cashmere' | 'velvet' | 'chiffon' | 'satin' | 'jersey' | 'mesh'

/**
 * Texture types
 */
export type TextureType =
	| 'smooth' | 'rough' | 'soft' | 'crisp' | 'stretchy' | 'structured'
	| 'flowing' | 'stiff' | 'fuzzy' | 'ribbed' | 'quilted'

/**
 * Style keywords for outfit pairing
 */
export type StyleKeyword =
	| 'minimalist' | 'bohemian' | 'vintage' | 'modern' | 'classic' | 'trendy'
	| 'edgy' | 'romantic' | 'sporty' | 'preppy' | 'grunge' | 'chic'
	| 'retro' | 'artistic' | 'punk' | 'glam' | 'street-style'

/**
 * Occasion types
 */
export type OccasionType =
	| 'everyday' | 'work' | 'business' | 'formal' | 'party' | 'date-night'
	| 'casual-outing' | 'vacation' | 'gym' | 'beach' | 'wedding' | 'interview'

/**
 * Formality levels
 */
export type FormalityLevel = 'very-casual' | 'casual' | 'smart-casual' | 'business' | 'formal' | 'black-tie'

/**
 * Season types
 */
export type SeasonType = 'spring' | 'summer' | 'fall' | 'winter' | 'all-season'

/**
 * Fit types
 */
export type FitType =
	| 'loose' | 'relaxed' | 'regular' | 'slim' | 'skinny' | 'oversized'
	| 'fitted' | 'tailored' | 'baggy' | 'cropped'

/**
 * Silhouette types
 */
export type SilhouetteType =
	| 'straight' | 'a-line' | 'fit-and-flare' | 'bodycon' | 'boxy'
	| 'flowing' | 'structured' | 'wrap' | 'empire-waist'

/**
 * Length types
 */
export type LengthType =
	| 'cropped' | 'regular' | 'long' | 'extra-long' | 'mini' | 'midi' | 'maxi'
	| 'ankle-length' | 'knee-length' | 'above-knee' | 'floor-length'

/**
 * Trendiness levels
 */
export type TrendinessLevel = 'timeless' | 'classic' | 'contemporary' | 'trendy' | 'avant-garde'

/**
 * Versatility scoring (1-10)
 */
export type VersatilityScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * Wear frequency tracking
 */
export type WearFrequency = 'never' | 'rarely' | 'occasionally' | 'regularly' | 'frequently'

/**
 * Color compatibility profile for skin tone matching
 */
export interface ColorCompatibilityProfile {
	warmToneScore: number // 0-1
	coolToneScore: number // 0-1
	neutralToneScore: number // 0-1
	contrastLevel: 'low' | 'medium' | 'high'
	seasonalPalette: SeasonalColorPalette[]
}

/**
 * Seasonal color palettes
 */
export type SeasonalColorPalette = 'spring' | 'summer' | 'autumn' | 'winter'

/**
 * Style rule for outfit pairing
 */
export interface StyleRule {
	id: string
	name: string
	description: string
	category: StyleRuleCategory
	priority: RulePriority

	// Rule conditions
	conditions: StyleRuleCondition[]

	// Rule outcomes
	compatibility: CompatibilityScore
	recommendations: StyleRecommendation[]

	// Contextual factors
	occasions: OccasionType[]
	seasons: SeasonType[]
	bodyTypes?: BodyType[]

	// Metadata
	isActive: boolean
	createdAt: string
	updatedAt: string
}

/**
 * Style rule categories
 */
export type StyleRuleCategory =
	| 'color-harmony' | 'pattern-mixing' | 'proportion-balance' | 'style-coherence'
	| 'occasion-appropriateness' | 'season-matching' | 'trend-compatibility'

/**
 * Rule priority levels
 */
export type RulePriority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Style rule conditions
 */
export interface StyleRuleCondition {
	field: keyof GarmentAttributes
	operator: ConditionOperator
	value: any
	weight: number // 0-1, importance of this condition
}

export type ConditionOperator =
	| 'equals' | 'not-equals' | 'contains' | 'not-contains'
	| 'in' | 'not-in' | 'greater-than' | 'less-than'
	| 'color-harmony' | 'color-contrast' | 'pattern-compatible'

/**
 * Compatibility scoring
 */
export type CompatibilityScore = number // 0-1

/**
 * Style recommendations
 */
export interface StyleRecommendation {
	action: RecommendationAction
	reason: string
	confidence: number // 0-1
	alternatives?: string[] // Alternative garment IDs
}

export type RecommendationAction =
	| 'highly-recommend' | 'recommend' | 'neutral' | 'caution' | 'avoid'

/**
 * Body type considerations
 */
export type BodyType =
	| 'apple' | 'pear' | 'hourglass' | 'rectangle' | 'inverted-triangle'
	| 'oval' | 'diamond' | 'athletic'

/**
 * Skin tone analysis
 */
export interface SkinToneProfile {
	undertone: SkinUndertone
	depth: SkinDepth
	clarity: SkinClarity
	contrast: ContrastLevel
	seasonalType: SeasonalColorPalette

	// Compatible color palettes
	bestColors: string[] // Hex codes
	goodColors: string[] // Hex codes
	avoidColors: string[] // Hex codes

	// Analysis metadata
	confidence: number // 0-1
	analysisMethod: 'manual' | 'ai-detected' | 'photo-analysis'
	lastUpdated: string
}

export type SkinUndertone = 'warm' | 'cool' | 'neutral' | 'olive'
export type SkinDepth = 'very-light' | 'light' | 'medium-light' | 'medium' | 'medium-deep' | 'deep' | 'very-deep'
export type SkinClarity = 'clear' | 'soft' | 'muted'
export type ContrastLevel = 'low' | 'medium' | 'high'

/**
 * Outfit pairing context
 */
export interface OutfitContext {
	occasion: OccasionType
	season: SeasonType
	weather?: WeatherCondition
	timeOfDay: TimeOfDay
	location?: LocationType
	mood?: MoodType
	bodyType?: BodyType
	personalStyle?: StyleKeyword[]
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'hot' | 'cold' | 'mild'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'
export type LocationType = 'office' | 'restaurant' | 'outdoor' | 'home' | 'event-venue' | 'gym' | 'beach'
export type MoodType = 'confident' | 'comfortable' | 'playful' | 'professional' | 'romantic' | 'edgy'

/**
 * Fashion AI styling preferences
 */
export interface StylingPreferences {
	colorPalette: ColorFamily[]
	avoidColors: ColorFamily[]
	preferredStyles: StyleKeyword[]
	avoidStyles: StyleKeyword[]
	formalityPreference: FormalityLevel[]
	fitPreferences: FitType[]

	// Advanced preferences
	riskTolerance: 'conservative' | 'moderate' | 'adventurous'
	trendAdoption: 'classic' | 'selective' | 'early-adopter'
	comfortPriority: number // 1-10
	sustainabilityFocus: boolean
	brandPreferences: string[]
	budgetConsciousness: 'low' | 'medium' | 'high'
}

/**
 * AI recommendation result
 */
export interface StyleRecommendationResult {
	garmentId: string
	garment: GarmentAttributes
	compatibilityScore: number
	reasoning: RecommendationReasoning
	styleNotes: string[]
	alternatives: AlternativeRecommendation[]
	confidence: number
}

export interface RecommendationReasoning {
	colorHarmony: number
	styleCoherence: number
	occasionFit: number
	personalMatch: number
	trendRelevance: number
	versatility: number
}

export interface AlternativeRecommendation {
	garmentId: string
	reason: string
	score: number
}

export default {}
