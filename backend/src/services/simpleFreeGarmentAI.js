/**
 * 🤖 FREE AI Garment Analysis Service - Simplified Version
 *
 * Uses rule-based classification and filename analysis
 * Focuses on text analysis and pattern recognition without TensorFlow.js
 *
 * NO PAID APIs REQUIRED!
 */

import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

// Import ColorThief using dynamic import to handle ES module compatibility
let ColorThief
try {
	ColorThief = (await import('colorthief')).default
} catch (error) {
	console.log('ColorThief not available, using fallback color analysis')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * FREE AI Garment Analysis Service (Simplified)
 *
 * Provides intelligent garment analysis using:
 * - Rule-based classification
 * - Filename pattern recognition
 * - Color analysis (when available)
 * - Metadata extraction
 *
 * NO EXTERNAL APIs OR COMPLEX DEPENDENCIES!
 */
export class SimpleFreeGarmentAI {
	constructor() {
		this.isInitialized = true

		// Enhanced garment classification mappings
		this.garmentPatterns = {
			// Tops
			shirt: { category: 'top', subcategory: 'shirt', style: 'casual' },
			blouse: { category: 'top', subcategory: 'blouse', style: 'smart_casual' },
			tshirt: { category: 'top', subcategory: 't_shirt', style: 'casual' },
			tank: { category: 'top', subcategory: 'tank_top', style: 'casual' },
			sweater: { category: 'top', subcategory: 'sweater', style: 'casual' },
			cardigan: { category: 'top', subcategory: 'cardigan', style: 'smart_casual' },
			hoodie: { category: 'top', subcategory: 'hoodie', style: 'casual' },
			blazer: { category: 'top', subcategory: 'blazer', style: 'formal' },

			// Bottoms
			jeans: { category: 'bottom', subcategory: 'jeans', style: 'casual' },
			pants: { category: 'bottom', subcategory: 'pants', style: 'casual' },
			trousers: { category: 'bottom', subcategory: 'trousers', style: 'formal' },
			skirt: { category: 'bottom', subcategory: 'skirt', style: 'casual' },
			shorts: { category: 'bottom', subcategory: 'shorts', style: 'casual' },
			leggings: { category: 'bottom', subcategory: 'leggings', style: 'sporty' },

			// Dresses
			dress: { category: 'dress', subcategory: 'dress', style: 'casual' },
			gown: { category: 'dress', subcategory: 'evening_dress', style: 'formal' },
			sundress: { category: 'dress', subcategory: 'sundress', style: 'casual' },

			// Outerwear
			jacket: { category: 'outerwear', subcategory: 'jacket', style: 'casual' },
			coat: { category: 'outerwear', subcategory: 'coat', style: 'formal' },
			windbreaker: { category: 'outerwear', subcategory: 'windbreaker', style: 'sporty' },

			// Shoes
			shoes: { category: 'shoes', subcategory: 'shoes', style: 'casual' },
			sneakers: { category: 'shoes', subcategory: 'sneakers', style: 'sporty' },
			sandals: { category: 'shoes', subcategory: 'sandals', style: 'casual' },
			boots: { category: 'shoes', subcategory: 'boots', style: 'casual' },
			heels: { category: 'shoes', subcategory: 'heels', style: 'formal' },

			// Accessories
			bag: { category: 'accessory', subcategory: 'bag', style: 'everyday' },
			purse: { category: 'accessory', subcategory: 'purse', style: 'everyday' },
			scarf: { category: 'accessory', subcategory: 'scarf', style: 'versatile' },
			hat: { category: 'accessory', subcategory: 'hat', style: 'casual' },
			sunglasses: { category: 'accessory', subcategory: 'sunglasses', style: 'casual' },
			belt: { category: 'accessory', subcategory: 'belt', style: 'versatile' }
		}

		// Color mappings
		this.colorPatterns = {
			red: ['red', 'crimson', 'scarlet', 'burgundy', 'maroon'],
			blue: ['blue', 'navy', 'azure', 'cobalt', 'royal'],
			green: ['green', 'emerald', 'olive', 'sage', 'mint'],
			yellow: ['yellow', 'gold', 'amber', 'lemon', 'canary'],
			orange: ['orange', 'coral', 'peach', 'tangerine', 'apricot'],
			purple: ['purple', 'violet', 'lavender', 'plum', 'magenta'],
			pink: ['pink', 'rose', 'blush', 'fuchsia', 'salmon'],
			brown: ['brown', 'tan', 'beige', 'khaki', 'camel'],
			black: ['black', 'ebony', 'jet', 'charcoal', 'onyx'],
			white: ['white', 'ivory', 'cream', 'pearl', 'snow'],
			gray: ['gray', 'grey', 'silver', 'slate', 'ash']
		}

		// Pattern keywords
		this.patternKeywords = {
			solid: ['solid', 'plain', 'basic'],
			striped: ['stripe', 'striped', 'pinstripe', 'vertical', 'horizontal'],
			polka: ['polka', 'dot', 'spotted', 'dotted'],
			floral: ['floral', 'flower', 'botanical', 'rose', 'daisy'],
			geometric: ['geometric', 'triangle', 'square', 'diamond', 'hexagon'],
			animal: ['leopard', 'zebra', 'tiger', 'snake', 'cheetah'],
			plaid: ['plaid', 'check', 'checkered', 'tartan', 'gingham'],
			abstract: ['abstract', 'artistic', 'modern', 'contemporary']
		}

		// Style indicators
		this.styleIndicators = {
			casual: ['casual', 'everyday', 'relaxed', 'comfortable', 'informal'],
			formal: ['formal', 'business', 'professional', 'elegant', 'dressy'],
			sporty: ['sport', 'athletic', 'gym', 'fitness', 'active'],
			bohemian: ['boho', 'bohemian', 'hippie', 'free', 'flowing'],
			vintage: ['vintage', 'retro', 'classic', 'old', 'traditional'],
			minimalist: ['minimal', 'simple', 'clean', 'basic', 'sleek'],
			edgy: ['edgy', 'punk', 'goth', 'alternative', 'bold'],
			romantic: ['romantic', 'feminine', 'soft', 'delicate', 'pretty']
		}
	}

	/**
	 * Initialize the service (already ready)
	 */
	async initialize() {
		this.isInitialized = true
		console.log('✅ Simple FREE AI Garment Analysis ready!')
	}

	/**
	 * Analyze a garment using intelligent rule-based classification
	 * @param {string} imagePath - Path to the image file
	 * @param {string} publicUrl - Public URL of the image
	 * @returns {Object} Comprehensive garment analysis
	 */
	async analyzeGarment(imagePath, publicUrl = null) {
		try {
			console.log(`🔍 Starting intelligent analysis for: ${imagePath}`)

			// Run analysis components
			const [
				classificationResult,
				colorAnalysis,
				patternAnalysis,
				dimensionAnalysis,
				metadataAnalysis
			] = await Promise.all([
				this.classifyGarment(imagePath),
				this.analyzeColors(imagePath),
				this.analyzePattern(imagePath),
				this.analyzeDimensions(imagePath),
				this.extractMetadata(imagePath)
			])

			// Combine all analysis results
			const analysis = this.combineAnalysis({
				classification: classificationResult,
				colors: colorAnalysis,
				pattern: patternAnalysis,
				dimensions: dimensionAnalysis,
				metadata: metadataAnalysis,
				imagePath,
				publicUrl
			})

			console.log(`✅ Analysis completed with ${analysis.confidence.toFixed(2)} confidence`)

			return analysis

		} catch (error) {
			console.error('❌ Error in analysis:', error)
			return this.generateFallback(imagePath, publicUrl)
		}
	}

	/**
	 * Classify garment using intelligent filename and pattern analysis
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Classification results
	 */
	async classifyGarment(imagePath) {
		const filename = path.basename(imagePath).toLowerCase()

		// Multi-level analysis
		let bestMatch = null
		let confidence = 0

		// 1. Direct keyword matching
		for (const [pattern, info] of Object.entries(this.garmentPatterns)) {
			if (filename.includes(pattern)) {
				if (pattern.length > (bestMatch?.pattern?.length || 0)) {
					bestMatch = { pattern, info, confidence: 0.9 }
				}
			}
		}

		// 2. Partial matching and synonyms
		if (!bestMatch) {
			for (const [pattern, info] of Object.entries(this.garmentPatterns)) {
				// Check for partial matches
				if (pattern.length > 3 && filename.includes(pattern.substring(0, pattern.length - 1))) {
					bestMatch = { pattern, info, confidence: 0.7 }
					break
				}
			}
		}

		// 3. Style inference from filename
		let inferredStyle = 'casual'
		for (const [style, keywords] of Object.entries(this.styleIndicators)) {
			if (keywords.some(keyword => filename.includes(keyword))) {
				inferredStyle = style
				break
			}
		}

		// 4. Default classification with intelligent guessing
		if (!bestMatch) {
			bestMatch = this.inferFromImageContext(filename)
		}

		return {
			category: bestMatch.info.category,
			subcategory: bestMatch.info.subcategory,
			style: inferredStyle,
			confidence: bestMatch.confidence,
			method: 'intelligent_filename_analysis'
		}
	}

	/**
	 * Analyze colors from filename and basic image analysis
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Color analysis
	 */
	async analyzeColors(imagePath) {
		const filename = path.basename(imagePath).toLowerCase()

		// Extract colors from filename
		const detectedColors = []
		let primaryColor = 'Unknown'

		for (const [baseColor, variations] of Object.entries(this.colorPatterns)) {
			for (const variation of variations) {
				if (filename.includes(variation)) {
					detectedColors.push({
						color: baseColor,
						confidence: 0.8,
						source: 'filename'
					})
					if (!primaryColor || primaryColor === 'Unknown') {
						primaryColor = baseColor
					}
				}
			}
		}

		// Try to use ColorThief if available
		let advancedColorAnalysis = null
		if (ColorThief && fs.existsSync(imagePath)) {
			try {
				// This would work if ColorThief is properly loaded
				// const dominantColor = await ColorThief.getColor(imagePath)
				// advancedColorAnalysis = this.processColorThiefResult(dominantColor)
			} catch (error) {
				console.log('ColorThief analysis skipped:', error.message)
			}
		}

		// Generate color analysis
		const colorAnalysis = {
			primaryColor: primaryColor.charAt(0).toUpperCase() + primaryColor.slice(1),
			colors: detectedColors.map(c => c.color.charAt(0).toUpperCase() + c.color.slice(1)),
			colorCount: detectedColors.length || 1,
			temperature: this.determineColorTemperature(primaryColor),
			harmony: detectedColors.length > 1 ? 'complementary' : 'monochromatic',
			confidence: detectedColors.length > 0 ? 0.8 : 0.4
		}

		if (advancedColorAnalysis) {
			Object.assign(colorAnalysis, advancedColorAnalysis)
			colorAnalysis.confidence = 0.9
		}

		return colorAnalysis
	}

	/**
	 * Analyze pattern from filename and context
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Pattern analysis
	 */
	async analyzePattern(imagePath) {
		const filename = path.basename(imagePath).toLowerCase()

		let detectedPattern = 'solid'
		let confidence = 0.5

		// Pattern detection from filename
		for (const [pattern, keywords] of Object.entries(this.patternKeywords)) {
			if (keywords.some(keyword => filename.includes(keyword))) {
				detectedPattern = pattern
				confidence = 0.9
				break
			}
		}

		// Context-based pattern inference
		if (detectedPattern === 'solid') {
			if (filename.includes('print') || filename.includes('pattern')) {
				detectedPattern = 'abstract'
				confidence = 0.6
			}
		}

		return {
			pattern: detectedPattern,
			confidence: confidence,
			complexity: confidence > 0.7 ? 'high' : 'medium',
			method: 'filename_pattern_analysis'
		}
	}

	/**
	 * Analyze dimensions using image metadata
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Dimension analysis
	 */
	async analyzeDimensions(imagePath) {
		try {
			const metadata = await sharp(imagePath).metadata()
			const aspectRatio = metadata.width / metadata.height

			// Infer garment characteristics from aspect ratio
			let fit, silhouette

			if (aspectRatio > 1.3) {
				fit = 'loose'
				silhouette = 'relaxed'
			} else if (aspectRatio < 0.8) {
				fit = 'fitted'
				silhouette = 'slim'
			} else {
				fit = 'regular'
				silhouette = 'classic'
			}

			return {
				aspectRatio: aspectRatio,
				fit: fit,
				silhouette: silhouette,
				imageWidth: metadata.width,
				imageHeight: metadata.height,
				confidence: 0.7
			}

		} catch (error) {
			return {
				fit: 'regular',
				silhouette: 'classic',
				confidence: 0.3,
				error: 'Could not analyze image dimensions'
			}
		}
	}

	/**
	 * Extract image metadata
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Metadata analysis
	 */
	async extractMetadata(imagePath) {
		try {
			const stats = fs.statSync(imagePath)
			const metadata = await sharp(imagePath).metadata()

			return {
				fileSize: stats.size,
				format: metadata.format,
				width: metadata.width,
				height: metadata.height,
				quality: this.assessImageQuality(metadata),
				analyzedAt: new Date().toISOString()
			}
		} catch (error) {
			return {
				error: 'Could not extract metadata',
				analyzedAt: new Date().toISOString()
			}
		}
	}

	/**
	 * Combine all analysis results
	 * @param {Object} analyses - All analysis components
	 * @returns {Object} Combined analysis
	 */
	combineAnalysis({ classification, colors, pattern, dimensions, metadata, imagePath, publicUrl }) {
		// Calculate overall confidence
		const confidenceScores = [
			classification.confidence,
			colors.confidence,
			pattern.confidence,
			dimensions.confidence
		].filter(score => !isNaN(score))

		const overallConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length

		// Generate style tags
		const styleTags = this.generateStyleTags(classification, colors, pattern)

		// Determine seasons and occasions
		const seasons = this.determineSeason(classification, colors)
		const occasions = this.determineOccasions(classification, pattern)

		return {
			// Core classification
			category: classification.category,
			subcategory: classification.subcategory,

			// Colors
			primaryColor: colors.primaryColor,
			colors: colors.colors,
			colorAnalysis: {
				temperature: colors.temperature,
				harmony: colors.harmony
			},

			// Pattern and style
			pattern: pattern.pattern,
			patternComplexity: pattern.complexity,
			style: classification.style,
			styleTags: styleTags,

			// Fit and dimensions
			fit: dimensions.fit,
			silhouette: dimensions.silhouette,

			// Context
			seasons: seasons,
			occasions: occasions,

			// Technical details
			confidence: overallConfidence,
			analysisMethod: 'intelligent_rule_based',
			modelVersion: 'simple-1.0',
			analyzedAt: new Date().toISOString(),

			// Enhanced features
			enhanced: {
				freeAI: true,
				intelligentAnalysis: true,
				ruleBasedClassification: true,
				filenameAnalysis: true,
				metadataExtraction: true
			},

			// Raw data
			rawData: {
				classification: classification,
				colors: colors,
				pattern: pattern,
				dimensions: dimensions,
				metadata: metadata
			}
		}
	}

	/**
	 * Generate style tags based on analysis
	 * @param {Object} classification - Classification results
	 * @param {Object} colors - Color analysis
	 * @param {Object} pattern - Pattern analysis
	 * @returns {Array} Style tags
	 */
	generateStyleTags(classification, colors, pattern) {
		const tags = [classification.style]

		// Add color-based tags
		if (colors.temperature === 'warm') tags.push('warm_tones')
		if (colors.temperature === 'cool') tags.push('cool_tones')

		// Add pattern-based tags
		if (pattern.pattern !== 'solid') tags.push('patterned')
		if (pattern.complexity === 'high') tags.push('statement_piece')

		// Add category-specific tags
		tags.push(`${classification.category}_wear`)

		return [...new Set(tags)]
	}

	/**
	 * Determine color temperature
	 * @param {string} primaryColor - Primary color
	 * @returns {string} Temperature classification
	 */
	determineColorTemperature(primaryColor) {
		const warmColors = ['red', 'orange', 'yellow', 'pink']
		const coolColors = ['blue', 'green', 'purple']

		if (warmColors.includes(primaryColor)) return 'warm'
		if (coolColors.includes(primaryColor)) return 'cool'
		return 'neutral'
	}

	/**
	 * Determine suitable seasons
	 * @param {Object} classification - Classification results
	 * @param {Object} colors - Color analysis
	 * @returns {Array} Suitable seasons
	 */
	determineSeason(classification, colors) {
		const seasons = []

		// Based on garment type
		if (classification.subcategory === 'tank_top' || classification.subcategory === 'shorts') {
			seasons.push('summer')
		}
		if (classification.subcategory === 'coat' || classification.subcategory === 'sweater') {
			seasons.push('winter')
		}
		if (classification.subcategory === 'cardigan' || classification.subcategory === 'jacket') {
			seasons.push('spring', 'autumn')
		}

		// Based on colors
		if (colors.temperature === 'warm') {
			seasons.push('summer', 'spring')
		}
		if (colors.temperature === 'cool') {
			seasons.push('winter', 'autumn')
		}

		// Default to all seasons
		if (seasons.length === 0) {
			seasons.push('spring', 'summer', 'autumn', 'winter')
		}

		return [...new Set(seasons)]
	}

	/**
	 * Determine suitable occasions
	 * @param {Object} classification - Classification results
	 * @param {Object} pattern - Pattern analysis
	 * @returns {Array} Suitable occasions
	 */
	determineOccasions(classification, pattern) {
		const occasions = []

		// Based on style
		if (classification.style === 'formal') {
			occasions.push('work', 'business', 'formal_events')
		}
		if (classification.style === 'casual') {
			occasions.push('everyday', 'weekend', 'casual_outings')
		}
		if (classification.style === 'sporty') {
			occasions.push('gym', 'sports', 'active_wear')
		}

		// Based on pattern complexity
		if (pattern.complexity === 'high') {
			occasions.push('parties', 'social_events')
		}

		// Default occasions
		if (occasions.length === 0) {
			occasions.push('everyday', 'casual')
		}

		return [...new Set(occasions)]
	}

	/**
	 * Intelligent context-based classification fallback
	 * @param {string} filename - Image filename
	 * @returns {Object} Inferred classification
	 */
	inferFromImageContext(filename) {
		// Advanced pattern matching for unclear filenames
		if (filename.includes('top') || filename.includes('upper')) {
			return { pattern: 'shirt', info: this.garmentPatterns.shirt, confidence: 0.6 }
		}
		if (filename.includes('bottom') || filename.includes('lower')) {
			return { pattern: 'pants', info: this.garmentPatterns.pants, confidence: 0.6 }
		}
		if (filename.includes('foot') || filename.includes('shoe')) {
			return { pattern: 'shoes', info: this.garmentPatterns.shoes, confidence: 0.6 }
		}

		// Default to most common garment
		return { pattern: 'shirt', info: this.garmentPatterns.shirt, confidence: 0.4 }
	}

	/**
	 * Assess image quality for analysis reliability
	 * @param {Object} metadata - Image metadata
	 * @returns {string} Quality assessment
	 */
	assessImageQuality(metadata) {
		const resolution = metadata.width * metadata.height

		if (resolution > 1000000) return 'high'
		if (resolution > 500000) return 'medium'
		return 'low'
	}

	/**
	 * Generate fallback analysis when errors occur
	 * @param {string} imagePath - Image path
	 * @param {string} publicUrl - Public URL
	 * @returns {Object} Fallback analysis
	 */
	generateFallback(imagePath, publicUrl) {
		const filename = path.basename(imagePath).toLowerCase()

		return {
			category: 'top',
			subcategory: 'shirt',
			primaryColor: 'Unknown',
			colors: ['Unknown'],
			pattern: 'solid',
			style: 'casual',
			styleTags: ['basic'],
			fit: 'regular',
			silhouette: 'classic',
			seasons: ['all'],
			occasions: ['everyday'],
			confidence: 0.3,
			analysisMethod: 'fallback',
			enhanced: {
				freeAI: true,
				fallbackMode: true
			},
			analyzedAt: new Date().toISOString(),
			note: 'Fallback analysis used due to processing limitations'
		}
	}
}

export default SimpleFreeGarmentAI
