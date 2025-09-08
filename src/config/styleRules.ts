// Fashion AI Stylist Rules Configuration
// Task 8.1: Predefined Style Rules for Outfit Pairing

import {
	FormalityLevel,
	StyleRule
} from '../types/stylist'

/**
 * Comprehensive set of style rules for outfit pairing
 */
export const STYLE_RULES: StyleRule[] = [
	// COLOR HARMONY RULES
	{
		id: 'color-harmony-complementary',
		name: 'Complementary Color Harmony',
		description: 'Colors opposite on the color wheel create striking combinations',
		category: 'color-harmony',
		priority: 'high',
		conditions: [
			{
				field: 'color',
				operator: 'color-harmony',
				value: 'complementary',
				weight: 0.9
			}
		],
		compatibility: 0.85,
		recommendations: [
			{
				action: 'highly-recommend',
				reason: 'Complementary colors create dynamic visual interest',
				confidence: 0.9
			}
		],
		occasions: ['party', 'date-night', 'casual-outing'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'color-harmony-analogous',
		name: 'Analogous Color Harmony',
		description: 'Adjacent colors on the color wheel create harmonious looks',
		category: 'color-harmony',
		priority: 'medium',
		conditions: [
			{
				field: 'color',
				operator: 'color-harmony',
				value: 'analogous',
				weight: 0.8
			}
		],
		compatibility: 0.8,
		recommendations: [
			{
				action: 'recommend',
				reason: 'Analogous colors create pleasing, cohesive looks',
				confidence: 0.85
			}
		],
		occasions: ['work', 'business', 'everyday'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'color-harmony-monochromatic',
		name: 'Monochromatic Color Scheme',
		description: 'Different shades of the same color family create sophisticated looks',
		category: 'color-harmony',
		priority: 'medium',
		conditions: [
			{
				field: 'color',
				operator: 'color-harmony',
				value: 'monochromatic',
				weight: 0.75
			}
		],
		compatibility: 0.75,
		recommendations: [
			{
				action: 'recommend',
				reason: 'Monochromatic schemes are elegant and sophisticated',
				confidence: 0.8
			}
		],
		occasions: ['business', 'formal', 'work'],
		seasons: ['fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'neutral-base-rule',
		name: 'Neutral Base Pairing',
		description: 'Neutral colors pair well with almost everything',
		category: 'color-harmony',
		priority: 'high',
		conditions: [
			{
				field: 'color',
				operator: 'in',
				value: ['black', 'white', 'gray', 'beige', 'cream', 'brown'],
				weight: 0.9
			}
		],
		compatibility: 0.9,
		recommendations: [
			{
				action: 'highly-recommend',
				reason: 'Neutral colors are versatile and universally flattering',
				confidence: 0.95
			}
		],
		occasions: ['work', 'business', 'everyday', 'formal'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	// PATTERN MIXING RULES
	{
		id: 'pattern-mixing-scale',
		name: 'Different Scale Pattern Mixing',
		description: 'Mix patterns of different scales for visual balance',
		category: 'pattern-mixing',
		priority: 'medium',
		conditions: [
			{
				field: 'pattern',
				operator: 'pattern-compatible',
				value: 'different-scale',
				weight: 0.7
			}
		],
		compatibility: 0.7,
		recommendations: [
			{
				action: 'recommend',
				reason: 'Different pattern scales create interesting visual texture',
				confidence: 0.75
			}
		],
		occasions: ['casual-outing', 'party', 'vacation'],
		seasons: ['spring', 'summer'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'solid-with-pattern',
		name: 'Solid with Pattern',
		description: 'Pair solid colors with patterns for balanced looks',
		category: 'pattern-mixing',
		priority: 'high',
		conditions: [
			{
				field: 'pattern',
				operator: 'equals',
				value: 'solid',
				weight: 0.8
			}
		],
		compatibility: 0.85,
		recommendations: [
			{
				action: 'highly-recommend',
				reason: 'Solid colors balance patterned pieces perfectly',
				confidence: 0.9
			}
		],
		occasions: ['work', 'business', 'everyday', 'casual-outing'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	// FORMALITY MATCHING RULES
	{
		id: 'formality-coherence',
		name: 'Formality Level Coherence',
		description: 'Items should match in formality level',
		category: 'style-coherence',
		priority: 'critical',
		conditions: [
			{
				field: 'formality',
				operator: 'equals',
				value: 'same-level',
				weight: 1.0
			}
		],
		compatibility: 0.95,
		recommendations: [
			{
				action: 'highly-recommend',
				reason: 'Matching formality levels create cohesive outfits',
				confidence: 0.95
			}
		],
		occasions: ['work', 'business', 'formal', 'interview'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'avoid-formal-casual-mix',
		name: 'Avoid Formal-Casual Mix',
		description: 'Avoid mixing very formal with very casual pieces',
		category: 'style-coherence',
		priority: 'high',
		conditions: [
			{
				field: 'formality',
				operator: 'not-equals',
				value: 'extreme-mix',
				weight: 0.9
			}
		],
		compatibility: 0.2,
		recommendations: [
			{
				action: 'avoid',
				reason: 'Extreme formality differences create jarring combinations',
				confidence: 0.9
			}
		],
		occasions: ['work', 'business', 'formal'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	// SEASONAL APPROPRIATENESS RULES
	{
		id: 'summer-light-colors',
		name: 'Summer Light Colors',
		description: 'Light colors are ideal for summer weather',
		category: 'season-matching',
		priority: 'medium',
		conditions: [
			{
				field: 'color',
				operator: 'in',
				value: ['white', 'cream', 'beige', 'yellow', 'light-blue'],
				weight: 0.7
			}
		],
		compatibility: 0.8,
		recommendations: [
			{
				action: 'recommend',
				reason: 'Light colors reflect heat and look fresh in summer',
				confidence: 0.8
			}
		],
		occasions: ['vacation', 'beach', 'casual-outing'],
		seasons: ['summer'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'winter-dark-colors',
		name: 'Winter Dark Colors',
		description: 'Darker colors are appropriate for winter',
		category: 'season-matching',
		priority: 'medium',
		conditions: [
			{
				field: 'color',
				operator: 'in',
				value: ['black', 'navy', 'burgundy', 'forest-green', 'dark-gray'],
				weight: 0.7
			}
		],
		compatibility: 0.8,
		recommendations: [
			{
				action: 'recommend',
				reason: 'Dark colors are cozy and appropriate for winter',
				confidence: 0.8
			}
		],
		occasions: ['work', 'business', 'formal', 'everyday'],
		seasons: ['winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	// PROPORTION AND BALANCE RULES
	{
		id: 'top-bottom-balance',
		name: 'Top-Bottom Proportion Balance',
		description: 'Balance loose tops with fitted bottoms and vice versa',
		category: 'proportion-balance',
		priority: 'high',
		conditions: [
			{
				field: 'fit',
				operator: 'equals',
				value: 'balanced-proportions',
				weight: 0.85
			}
		],
		compatibility: 0.85,
		recommendations: [
			{
				action: 'highly-recommend',
				reason: 'Balanced proportions create flattering silhouettes',
				confidence: 0.9
			}
		],
		occasions: ['everyday', 'work', 'casual-outing'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'avoid-oversized-both',
		name: 'Avoid All Oversized',
		description: 'Avoid oversized pieces on both top and bottom',
		category: 'proportion-balance',
		priority: 'medium',
		conditions: [
			{
				field: 'fit',
				operator: 'not-equals',
				value: 'all-oversized',
				weight: 0.8
			}
		],
		compatibility: 0.3,
		recommendations: [
			{
				action: 'caution',
				reason: 'All oversized pieces can overwhelm the silhouette',
				confidence: 0.85
			}
		],
		occasions: ['everyday', 'casual-outing'],
		seasons: ['fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	// OCCASION APPROPRIATENESS RULES
	{
		id: 'business-professional',
		name: 'Business Professional Attire',
		description: 'Professional settings require conservative, polished looks',
		category: 'occasion-appropriateness',
		priority: 'critical',
		conditions: [
			{
				field: 'formality',
				operator: 'in',
				value: ['business', 'formal'],
				weight: 1.0
			},
			{
				field: 'styleKeywords',
				operator: 'contains',
				value: 'classic',
				weight: 0.8
			}
		],
		compatibility: 0.9,
		recommendations: [
			{
				action: 'highly-recommend',
				reason: 'Professional settings require polished, conservative attire',
				confidence: 0.95
			}
		],
		occasions: ['work', 'business', 'interview'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'party-statement-pieces',
		name: 'Party Statement Pieces',
		description: 'Party occasions allow for bold, statement pieces',
		category: 'occasion-appropriateness',
		priority: 'high',
		conditions: [
			{
				field: 'styleKeywords',
				operator: 'in',
				value: ['glam', 'trendy', 'edgy'],
				weight: 0.8
			}
		],
		compatibility: 0.8,
		recommendations: [
			{
				action: 'recommend',
				reason: 'Party settings welcome bold, statement pieces',
				confidence: 0.85
			}
		],
		occasions: ['party', 'date-night'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	// STYLE KEYWORD COMPATIBILITY RULES
	{
		id: 'minimalist-clean-lines',
		name: 'Minimalist Clean Lines',
		description: 'Minimalist style favors clean lines and simple silhouettes',
		category: 'style-coherence',
		priority: 'high',
		conditions: [
			{
				field: 'styleKeywords',
				operator: 'contains',
				value: 'minimalist',
				weight: 0.9
			}
		],
		compatibility: 0.85,
		recommendations: [
			{
				action: 'highly-recommend',
				reason: 'Clean lines complement minimalist aesthetic',
				confidence: 0.9
			}
		],
		occasions: ['work', 'business', 'everyday'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	{
		id: 'bohemian-flowing-textures',
		name: 'Bohemian Flowing Textures',
		description: 'Bohemian style embraces flowing fabrics and rich textures',
		category: 'style-coherence',
		priority: 'high',
		conditions: [
			{
				field: 'styleKeywords',
				operator: 'contains',
				value: 'bohemian',
				weight: 0.9
			}
		],
		compatibility: 0.8,
		recommendations: [
			{
				action: 'recommend',
				reason: 'Flowing textures enhance bohemian style',
				confidence: 0.85
			}
		],
		occasions: ['casual-outing', 'vacation', 'party'],
		seasons: ['spring', 'summer'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},

	// TREND COMPATIBILITY RULES
	{
		id: 'current-trend-boost',
		name: 'Current Trend Boost',
		description: 'Currently trending items get compatibility boost',
		category: 'trend-compatibility',
		priority: 'low',
		conditions: [
			{
				field: 'trendiness',
				operator: 'equals',
				value: 'trendy',
				weight: 0.6
			}
		],
		compatibility: 0.7,
		recommendations: [
			{
				action: 'recommend',
				reason: 'Trending pieces add contemporary appeal',
				confidence: 0.7
			}
		],
		occasions: ['casual-outing', 'party', 'date-night'],
		seasons: ['spring', 'summer', 'fall', 'winter'],
		isActive: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	}
]

/**
 * Color harmony definitions for style rules
 */
export const COLOR_HARMONY_RULES = {
	complementary: {
		'red': ['green'],
		'orange': ['blue'],
		'yellow': ['purple'],
		'blue': ['orange'],
		'green': ['red'],
		'purple': ['yellow']
	},

	analogous: {
		'red': ['orange', 'purple'],
		'orange': ['red', 'yellow'],
		'yellow': ['orange', 'green'],
		'green': ['yellow', 'blue'],
		'blue': ['green', 'purple'],
		'purple': ['blue', 'red']
	},

	triadic: {
		'red': ['blue', 'yellow'],
		'orange': ['green', 'purple'],
		'yellow': ['red', 'blue'],
		'green': ['orange', 'purple'],
		'blue': ['red', 'yellow'],
		'purple': ['orange', 'green']
	}
}

/**
 * Pattern compatibility matrix
 */
export const PATTERN_COMPATIBILITY = {
	'solid': ['stripes', 'polka-dots', 'floral', 'geometric', 'abstract', 'plaid', 'checkered'],
	'stripes': ['solid', 'polka-dots'],
	'polka-dots': ['solid', 'stripes'],
	'floral': ['solid'],
	'geometric': ['solid'],
	'abstract': ['solid'],
	'plaid': ['solid'],
	'checkered': ['solid']
}

/**
 * Formality level hierarchy
 */
export const FORMALITY_HIERARCHY: Record<FormalityLevel, number> = {
	'very-casual': 1,
	'casual': 2,
	'smart-casual': 3,
	'business': 4,
	'formal': 5,
	'black-tie': 6
}

/**
 * Season-appropriate colors
 */
export const SEASONAL_COLORS = {
	spring: ['pink', 'green', 'yellow', 'white', 'cream'],
	summer: ['white', 'cream', 'yellow', 'blue', 'pink'],
	fall: ['brown', 'orange', 'red', 'burgundy', 'olive'],
	winter: ['black', 'gray', 'navy', 'burgundy', 'white']
}

/**
 * Style keyword compatibility matrix
 */
export const STYLE_COMPATIBILITY = {
	'minimalist': ['modern', 'classic', 'chic'],
	'bohemian': ['artistic', 'vintage', 'romantic'],
	'vintage': ['classic', 'retro', 'romantic'],
	'modern': ['minimalist', 'chic', 'trendy'],
	'classic': ['minimalist', 'preppy', 'chic'],
	'trendy': ['modern', 'edgy', 'street-style'],
	'edgy': ['punk', 'grunge', 'street-style'],
	'romantic': ['bohemian', 'vintage', 'soft'],
	'sporty': ['athletic', 'casual', 'street-style'],
	'preppy': ['classic', 'clean', 'polished'],
	'grunge': ['edgy', 'vintage', 'rebellious'],
	'chic': ['modern', 'minimalist', 'sophisticated']
}

export default STYLE_RULES
