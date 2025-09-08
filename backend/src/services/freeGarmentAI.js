import * as mobilenet from '@tensorflow-models/mobilenet'
import tf from '@tensorflow/tfjs-node'
import ColorThief from 'colorthief'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

// Import JIMP using createRequire for CommonJS compatibility
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Jimp = require('jimp')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * FREE AI Garment Analysis Service
 *
 * Uses completely free computer vision libraries:
 * - TensorFlow.js with MobileNet for object classification
 * - ColorThief for color extraction
 * - Sharp/Jimp for image processing
 * - Custom pattern recognition algorithms
 *
 * NO PAID APIs REQUIRED!
 */
export class FreeGarmentAI {
	constructor() {
		this.mobilenetModel = null
		this.isInitialized = false

		// Garment classification mappings
		this.garmentMappings = {
			// Clothing categories from MobileNet classes
			'jersey': { category: 'top', subcategory: 'shirt', style: 'casual' },
			'sweatshirt': { category: 'top', subcategory: 'sweatshirt', style: 'casual' },
			'cardigan': { category: 'top', subcategory: 'cardigan', style: 'smart_casual' },
			'suit': { category: 'top', subcategory: 'blazer', style: 'formal' },
			'jean': { category: 'bottom', subcategory: 'jeans', style: 'casual' },
			'miniskirt': { category: 'bottom', subcategory: 'skirt', style: 'casual' },
			'gown': { category: 'dress', subcategory: 'evening_dress', style: 'formal' },
			'bikini': { category: 'top', subcategory: 'bikini', style: 'beachwear' },
			'shoe': { category: 'shoes', subcategory: 'shoes', style: 'casual' },
			'sandal': { category: 'shoes', subcategory: 'sandals', style: 'casual' },
			'boot': { category: 'shoes', subcategory: 'boots', style: 'casual' },
			'sneaker': { category: 'shoes', subcategory: 'sneakers', style: 'sporty' },
			'bag': { category: 'accessory', subcategory: 'bag', style: 'everyday' },
			'purse': { category: 'accessory', subcategory: 'purse', style: 'everyday' },
			'scarf': { category: 'accessory', subcategory: 'scarf', style: 'versatile' },
			'hat': { category: 'accessory', subcategory: 'hat', style: 'casual' },
			'sunglasses': { category: 'accessory', subcategory: 'sunglasses', style: 'casual' }
		}

		// Color name mappings for better descriptions
		this.colorNames = {
			'#FF0000': 'Red', '#00FF00': 'Green', '#0000FF': 'Blue',
			'#FFFF00': 'Yellow', '#FF00FF': 'Magenta', '#00FFFF': 'Cyan',
			'#800000': 'Maroon', '#008000': 'Dark Green', '#000080': 'Navy',
			'#808000': 'Olive', '#800080': 'Purple', '#008080': 'Teal',
			'#C0C0C0': 'Silver', '#808080': 'Gray', '#000000': 'Black',
			'#FFFFFF': 'White', '#FFA500': 'Orange', '#A52A2A': 'Brown',
			'#FFC0CB': 'Pink', '#E6E6FA': 'Lavender', '#98FB98': 'Pale Green',
			'#F0E68C': 'Khaki', '#DDA0DD': 'Plum', '#B0C4DE': 'Light Steel Blue'
		}

		// Pattern recognition patterns
		this.patternKeywords = {
			stripe: ['stripe', 'striped', 'linear'],
			polka: ['polka', 'dot', 'spotted'],
			floral: ['floral', 'flower', 'botanical'],
			geometric: ['geometric', 'triangle', 'square', 'diamond'],
			animal: ['leopard', 'zebra', 'tiger', 'snake'],
			plaid: ['plaid', 'check', 'tartan', 'gingham'],
			abstract: ['abstract', 'artistic', 'modern']
		}
	}

	/**
	 * Initialize the AI models
	 */
	async initialize() {
		if (this.isInitialized) return

		try {
			console.log('🤖 Initializing FREE AI models...')

			// Load MobileNet model (completely free!)
			this.mobilenetModel = await mobilenet.load()

			this.isInitialized = true
			console.log('✅ FREE AI models loaded successfully!')

		} catch (error) {
			console.error('❌ Error initializing AI models:', error)
			this.isInitialized = false
		}
	}

	/**
	 * Analyze a garment image using FREE AI
	 * @param {string} imagePath - Path to the image file
	 * @param {string} publicUrl - Public URL of the image
	 * @returns {Object} Comprehensive garment analysis
	 */
	async analyzeGarment(imagePath, publicUrl = null) {
		try {
			console.log(`🔍 Starting FREE AI analysis for: ${imagePath}`)

			// Initialize models if needed
			await this.initialize()

			// Run all analysis in parallel for speed
			const [
				classificationResult,
				colorAnalysis,
				patternAnalysis,
				textureAnalysis,
				dimensionAnalysis
			] = await Promise.all([
				this.classifyGarment(imagePath),
				this.extractColors(imagePath),
				this.analyzePattern(imagePath),
				this.analyzeTexture(imagePath),
				this.analyzeDimensions(imagePath)
			])

			// Combine all analysis results
			const analysis = this.combineAnalysis({
				classification: classificationResult,
				colors: colorAnalysis,
				pattern: patternAnalysis,
				texture: textureAnalysis,
				dimensions: dimensionAnalysis,
				imagePath,
				publicUrl
			})

			console.log(`✅ FREE AI analysis completed with ${analysis.confidence.toFixed(2)} confidence`)

			return analysis

		} catch (error) {
			console.error('❌ Error in FREE AI analysis:', error)
			return this.generateEnhancedFallback(imagePath, publicUrl)
		}
	}

	/**
	 * Classify garment using TensorFlow MobileNet
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Classification results
	 */
	async classifyGarment(imagePath) {
		try {
			if (!this.mobilenetModel) {
				throw new Error('MobileNet model not initialized')
			}

			// Load and preprocess image
			const imageBuffer = fs.readFileSync(imagePath)
			const image = tf.node.decodeImage(imageBuffer, 3)

			// Resize to MobileNet input size (224x224)
			const resized = tf.image.resizeBilinear(image, [224, 224])
			const normalized = resized.div(255.0)
			const batched = normalized.expandDims(0)

			// Get predictions
			const predictions = await this.mobilenetModel.classify(batched)

			// Clean up tensors
			image.dispose()
			resized.dispose()
			normalized.dispose()
			batched.dispose()

			// Map predictions to garment categories
			const garmentInfo = this.mapPredictionsToGarment(predictions)

			return {
				predictions,
				garmentInfo,
				confidence: predictions.length > 0 ? predictions[0].probability : 0.5
			}

		} catch (error) {
			console.error('Classification error:', error)
			return this.inferFromFilename(imagePath)
		}
	}

	/**
	 * Extract colors using ColorThief
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Color analysis
	 */
	async extractColors(imagePath) {
		try {
			// Get dominant color
			const dominantColor = await ColorThief.getColor(imagePath)

			// Get color palette
			const palette = await ColorThief.getPalette(imagePath, 8, 10)

			// Convert RGB to hex and get color names
			const primaryColorHex = this.rgbToHex(dominantColor)
			const primaryColorName = this.getColorName(primaryColorHex)

			const paletteColors = palette.map(rgb => ({
				hex: this.rgbToHex(rgb),
				name: this.getColorName(this.rgbToHex(rgb)),
				rgb: rgb
			}))

			// Analyze color harmony and temperature
			const colorAnalysis = this.analyzeColorProperties(dominantColor, palette)

			return {
				primaryColor: primaryColorName,
				primaryColorHex,
				palette: paletteColors,
				colorCount: palette.length,
				temperature: colorAnalysis.temperature,
				harmony: colorAnalysis.harmony,
				brightness: colorAnalysis.brightness,
				saturation: colorAnalysis.saturation,
				confidence: 0.9
			}

		} catch (error) {
			console.error('Color extraction error:', error)
			return this.fallbackColorAnalysis(imagePath)
		}
	}

	/**
	 * Analyze pattern using image processing
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Pattern analysis
	 */
	async analyzePattern(imagePath) {
		try {
			// Load image with Jimp for analysis
			const image = await Jimp.read(imagePath)

			// Convert to grayscale for pattern analysis
			const grayImage = image.clone().grayscale()

			// Analyze texture and patterns
			const textureMetrics = await this.calculateTextureMetrics(grayImage)
			const patternType = this.detectPatternType(textureMetrics, imagePath)

			return {
				pattern: patternType.type,
				confidence: patternType.confidence,
				complexity: textureMetrics.complexity,
				uniformity: textureMetrics.uniformity,
				direction: textureMetrics.dominantDirection,
				details: textureMetrics
			}

		} catch (error) {
			console.error('Pattern analysis error:', error)
			return {
				pattern: 'solid',
				confidence: 0.7,
				complexity: 'low',
				uniformity: 'high'
			}
		}
	}

	/**
	 * Analyze texture properties
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Texture analysis
	 */
	async analyzeTexture(imagePath) {
		try {
			const image = await Jimp.read(imagePath)

			// Calculate texture properties
			const textureProps = {
				roughness: await this.calculateRoughness(image),
				smoothness: await this.calculateSmoothness(image),
				fabric: await this.inferFabricType(image, imagePath)
			}

			return textureProps

		} catch (error) {
			console.error('Texture analysis error:', error)
			return {
				roughness: 'medium',
				smoothness: 'medium',
				fabric: 'cotton'
			}
		}
	}

	/**
	 * Analyze garment dimensions and fit
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Dimension analysis
	 */
	async analyzeDimensions(imagePath) {
		try {
			const { width, height } = await sharp(imagePath).metadata()

			// Analyze aspect ratio for garment type hints
			const aspectRatio = width / height
			const fitAnalysis = this.analyzeFit(aspectRatio)

			return {
				aspectRatio,
				fit: fitAnalysis.fit,
				silhouette: fitAnalysis.silhouette,
				length: fitAnalysis.length,
				confidence: 0.7
			}

		} catch (error) {
			console.error('Dimension analysis error:', error)
			return {
				fit: 'regular',
				silhouette: 'classic',
				length: 'regular'
			}
		}
	}

	/**
	 * Map MobileNet predictions to garment categories
	 * @param {Array} predictions - MobileNet predictions
	 * @returns {Object} Garment information
	 */
	mapPredictionsToGarment(predictions) {
		for (const prediction of predictions) {
			const className = prediction.className.toLowerCase()

			// Check for exact matches
			for (const [key, value] of Object.entries(this.garmentMappings)) {
				if (className.includes(key)) {
					return {
						...value,
						aiClass: prediction.className,
						probability: prediction.probability
					}
				}
			}
		}

		// Fallback based on top prediction
		if (predictions.length > 0) {
			return this.inferCategoryFromDescription(predictions[0].className)
		}

		return {
			category: 'top',
			subcategory: 'shirt',
			style: 'casual',
			aiClass: 'unknown',
			probability: 0.3
		}
	}

	/**
	 * Infer garment info from filename patterns
	 * @param {string} imagePath - Path to image
	 * @returns {Object} Inferred garment info
	 */
	inferFromFilename(imagePath) {
		const filename = path.basename(imagePath).toLowerCase()

		const patterns = {
			shirt: { category: 'top', subcategory: 'shirt', style: 'casual' },
			blouse: { category: 'top', subcategory: 'blouse', style: 'smart_casual' },
			tshirt: { category: 'top', subcategory: 't_shirt', style: 'casual' },
			dress: { category: 'dress', subcategory: 'dress', style: 'casual' },
			jeans: { category: 'bottom', subcategory: 'jeans', style: 'casual' },
			pants: { category: 'bottom', subcategory: 'pants', style: 'casual' },
			skirt: { category: 'bottom', subcategory: 'skirt', style: 'casual' },
			shoes: { category: 'shoes', subcategory: 'shoes', style: 'casual' },
			jacket: { category: 'outerwear', subcategory: 'jacket', style: 'casual' },
			coat: { category: 'outerwear', subcategory: 'coat', style: 'formal' },
			hat: { category: 'accessory', subcategory: 'hat', style: 'casual' },
			bag: { category: 'accessory', subcategory: 'bag', style: 'everyday' }
		}

		for (const [pattern, info] of Object.entries(patterns)) {
			if (filename.includes(pattern)) {
				return {
					predictions: [{ className: pattern, probability: 0.8 }],
					garmentInfo: { ...info, aiClass: pattern, probability: 0.8 },
					confidence: 0.8
				}
			}
		}

		return {
			predictions: [{ className: 'clothing', probability: 0.5 }],
			garmentInfo: {
				category: 'top',
				subcategory: 'shirt',
				style: 'casual',
				aiClass: 'unknown',
				probability: 0.5
			},
			confidence: 0.5
		}
	}

	/**
	 * Calculate texture metrics for pattern detection
	 * @param {Object} grayImage - Jimp grayscale image
	 * @returns {Object} Texture metrics
	 */
	async calculateTextureMetrics(grayImage) {
		const width = grayImage.getWidth()
		const height = grayImage.getHeight()

		let totalVariance = 0
		let edgeCount = 0
		let horizontalVariance = 0
		let verticalVariance = 0

		// Sample pixels for analysis (every 10th pixel for performance)
		const sampleStep = 10
		let sampleCount = 0

		for (let y = sampleStep; y < height - sampleStep; y += sampleStep) {
			for (let x = sampleStep; x < width - sampleStep; x += sampleStep) {
				const center = Jimp.intToRGBA(grayImage.getPixelColor(x, y)).r
				const right = Jimp.intToRGBA(grayImage.getPixelColor(x + sampleStep, y)).r
				const bottom = Jimp.intToRGBA(grayImage.getPixelColor(x, y + sampleStep)).r

				const hDiff = Math.abs(center - right)
				const vDiff = Math.abs(center - bottom)

				horizontalVariance += hDiff
				verticalVariance += vDiff
				totalVariance += hDiff + vDiff

				if (hDiff > 30 || vDiff > 30) {
					edgeCount++
				}

				sampleCount++
			}
		}

		const avgVariance = totalVariance / (sampleCount * 2)
		const avgHVariance = horizontalVariance / sampleCount
		const avgVVariance = verticalVariance / sampleCount
		const edgeDensity = edgeCount / sampleCount

		return {
			complexity: avgVariance > 40 ? 'high' : avgVariance > 20 ? 'medium' : 'low',
			uniformity: avgVariance < 15 ? 'high' : avgVariance < 30 ? 'medium' : 'low',
			edgeDensity,
			dominantDirection: Math.abs(avgHVariance - avgVVariance) > 10
				? (avgHVariance > avgVVariance ? 'horizontal' : 'vertical')
				: 'uniform',
			variance: avgVariance
		}
	}

	/**
	 * Detect pattern type based on texture metrics
	 * @param {Object} metrics - Texture metrics
	 * @param {string} imagePath - Image path for filename hints
	 * @returns {Object} Pattern detection result
	 */
	detectPatternType(metrics, imagePath) {
		const filename = path.basename(imagePath).toLowerCase()

		// Check filename for pattern hints
		for (const [pattern, keywords] of Object.entries(this.patternKeywords)) {
			if (keywords.some(keyword => filename.includes(keyword))) {
				return {
					type: pattern,
					confidence: 0.8,
					source: 'filename'
				}
			}
		}

		// Analyze based on texture metrics
		if (metrics.uniformity === 'high' && metrics.complexity === 'low') {
			return {
				type: 'solid',
				confidence: 0.9,
				source: 'texture_analysis'
			}
		}

		if (metrics.dominantDirection === 'horizontal' && metrics.edgeDensity > 0.3) {
			return {
				type: 'stripe',
				confidence: 0.7,
				source: 'texture_analysis'
			}
		}

		if (metrics.dominantDirection === 'vertical' && metrics.edgeDensity > 0.3) {
			return {
				type: 'stripe',
				confidence: 0.7,
				source: 'texture_analysis'
			}
		}

		if (metrics.complexity === 'high' && metrics.uniformity === 'low') {
			return {
				type: 'floral',
				confidence: 0.6,
				source: 'texture_analysis'
			}
		}

		if (metrics.edgeDensity > 0.5) {
			return {
				type: 'geometric',
				confidence: 0.6,
				source: 'texture_analysis'
			}
		}

		return {
			type: 'solid',
			confidence: 0.5,
			source: 'default'
		}
	}

	/**
	 * Convert RGB array to hex color
	 * @param {Array} rgb - RGB color array [r, g, b]
	 * @returns {string} Hex color string
	 */
	rgbToHex(rgb) {
		const [r, g, b] = rgb
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
	}

	/**
	 * Get color name from hex value
	 * @param {string} hex - Hex color string
	 * @returns {string} Color name
	 */
	getColorName(hex) {
		// Find closest color name
		let closestColor = 'Unknown'
		let minDistance = Infinity

		for (const [colorHex, colorName] of Object.entries(this.colorNames)) {
			const distance = this.colorDistance(hex, colorHex)
			if (distance < minDistance) {
				minDistance = distance
				closestColor = colorName
			}
		}

		return closestColor
	}

	/**
	 * Calculate color distance between two hex colors
	 * @param {string} hex1 - First hex color
	 * @param {string} hex2 - Second hex color
	 * @returns {number} Color distance
	 */
	colorDistance(hex1, hex2) {
		const rgb1 = this.hexToRgb(hex1)
		const rgb2 = this.hexToRgb(hex2)

		return Math.sqrt(
			Math.pow(rgb1.r - rgb2.r, 2) +
			Math.pow(rgb1.g - rgb2.g, 2) +
			Math.pow(rgb1.b - rgb2.b, 2)
		)
	}

	/**
	 * Convert hex to RGB
	 * @param {string} hex - Hex color string
	 * @returns {Object} RGB object
	 */
	hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null
	}

	/**
	 * Analyze color properties
	 * @param {Array} dominantColor - RGB array
	 * @param {Array} palette - Array of RGB arrays
	 * @returns {Object} Color analysis
	 */
	analyzeColorProperties(dominantColor, palette) {
		const [r, g, b] = dominantColor

		// Calculate brightness
		const brightness = (r * 299 + g * 587 + b * 114) / 1000

		// Calculate saturation
		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		const saturation = max === 0 ? 0 : (max - min) / max

		// Determine color temperature
		const temperature = r > b ? 'warm' : r < b ? 'cool' : 'neutral'

		// Analyze color harmony
		const harmony = this.analyzeColorHarmony(palette)

		return {
			brightness: brightness > 150 ? 'bright' : brightness > 75 ? 'medium' : 'dark',
			saturation: saturation > 0.7 ? 'high' : saturation > 0.3 ? 'medium' : 'low',
			temperature,
			harmony
		}
	}

	/**
	 * Analyze color harmony in palette
	 * @param {Array} palette - Array of RGB arrays
	 * @returns {string} Harmony type
	 */
	analyzeColorHarmony(palette) {
		if (palette.length < 2) return 'monochromatic'

		// Calculate hue differences
		const hues = palette.map(rgb => this.rgbToHue(rgb))
		const hueVariance = this.calculateVariance(hues)

		if (hueVariance < 30) return 'monochromatic'
		if (hueVariance < 60) return 'analogous'
		if (hueVariance > 150) return 'complementary'
		return 'triadic'
	}

	/**
	 * Convert RGB to hue
	 * @param {Array} rgb - RGB array
	 * @returns {number} Hue value (0-360)
	 */
	rgbToHue([r, g, b]) {
		r /= 255
		g /= 255
		b /= 255

		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		const diff = max - min

		if (diff === 0) return 0

		let hue
		switch (max) {
			case r: hue = (g - b) / diff + (g < b ? 6 : 0); break
			case g: hue = (b - r) / diff + 2; break
			case b: hue = (r - g) / diff + 4; break
		}

		return Math.round(hue * 60)
	}

	/**
	 * Calculate variance of an array
	 * @param {Array} values - Array of numbers
	 * @returns {number} Variance
	 */
	calculateVariance(values) {
		const mean = values.reduce((a, b) => a + b, 0) / values.length
		const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
		return Math.sqrt(variance)
	}

	/**
	 * Combine all analysis results
	 * @param {Object} analyses - All analysis results
	 * @returns {Object} Combined analysis
	 */
	combineAnalysis({ classification, colors, pattern, texture, dimensions, imagePath, publicUrl }) {
		const garmentInfo = classification.garmentInfo

		// Calculate overall confidence
		const confidenceScores = [
			classification.confidence,
			colors.confidence,
			pattern.confidence,
			dimensions.confidence
		]
		const overallConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length

		// Generate style tags
		const styleTags = this.generateStyleTags(garmentInfo, colors, pattern, texture)

		// Determine season suitability
		const seasons = this.determineSeason(garmentInfo, colors, texture)

		// Determine occasions
		const occasions = this.determineOccasions(garmentInfo, colors, pattern)

		return {
			// Core classification
			category: garmentInfo.category,
			subcategory: garmentInfo.subcategory,

			// Colors
			primaryColor: colors.primaryColor,
			colors: colors.palette.map(c => c.name),
			colorAnalysis: {
				temperature: colors.temperature,
				harmony: colors.harmony,
				brightness: colors.brightness,
				saturation: colors.saturation
			},

			// Pattern and texture
			pattern: pattern.pattern,
			patternComplexity: pattern.complexity,
			texture: texture.fabric,

			// Style and fit
			style: garmentInfo.style,
			styleTags,
			fit: dimensions.fit,
			silhouette: dimensions.silhouette,

			// Context
			seasons,
			occasions,

			// Technical details
			confidence: overallConfidence,
			analysisMethod: 'free_ai',
			modelVersion: '1.0',
			analyzedAt: new Date().toISOString(),

			// Raw data for debugging
			rawData: {
				classification: classification.predictions,
				colorPalette: colors.palette,
				patternMetrics: pattern.details,
				dimensions: dimensions
			}
		}
	}

	/**
	 * Generate style tags based on analysis
	 * @param {Object} garmentInfo - Garment classification
	 * @param {Object} colors - Color analysis
	 * @param {Object} pattern - Pattern analysis
	 * @param {Object} texture - Texture analysis
	 * @returns {Array} Style tags
	 */
	generateStyleTags(garmentInfo, colors, pattern, texture) {
		const tags = [garmentInfo.style]

		// Add color-based tags
		if (colors.temperature === 'warm') tags.push('warm_tones')
		if (colors.temperature === 'cool') tags.push('cool_tones')
		if (colors.brightness === 'bright') tags.push('vibrant')
		if (colors.brightness === 'dark') tags.push('dark')

		// Add pattern-based tags
		if (pattern.pattern !== 'solid') tags.push('patterned')
		if (pattern.complexity === 'high') tags.push('bold_pattern')

		// Add category-specific tags
		if (garmentInfo.category === 'top') tags.push('top_wear')
		if (garmentInfo.category === 'bottom') tags.push('bottom_wear')
		if (garmentInfo.category === 'dress') tags.push('one_piece')

		return [...new Set(tags)] // Remove duplicates
	}

	/**
	 * Determine season suitability
	 * @param {Object} garmentInfo - Garment classification
	 * @param {Object} colors - Color analysis
	 * @param {Object} texture - Texture analysis
	 * @returns {Array} Suitable seasons
	 */
	determineSeason(garmentInfo, colors, texture) {
		const seasons = []

		// Based on garment type
		if (garmentInfo.subcategory === 'tank_top' || garmentInfo.subcategory === 'shorts') {
			seasons.push('summer')
		}
		if (garmentInfo.subcategory === 'coat' || garmentInfo.subcategory === 'boots') {
			seasons.push('winter')
		}
		if (garmentInfo.subcategory === 'cardigan' || garmentInfo.subcategory === 'jacket') {
			seasons.push('spring', 'autumn')
		}

		// Based on colors
		if (colors.brightness === 'bright' && colors.temperature === 'warm') {
			seasons.push('summer')
		}
		if (colors.brightness === 'dark' && colors.temperature === 'cool') {
			seasons.push('winter')
		}

		// Default to all seasons if nothing specific
		if (seasons.length === 0) {
			seasons.push('spring', 'summer', 'autumn', 'winter')
		}

		return [...new Set(seasons)]
	}

	/**
	 * Determine suitable occasions
	 * @param {Object} garmentInfo - Garment classification
	 * @param {Object} colors - Color analysis
	 * @param {Object} pattern - Pattern analysis
	 * @returns {Array} Suitable occasions
	 */
	determineOccasions(garmentInfo, colors, pattern) {
		const occasions = []

		// Based on style
		if (garmentInfo.style === 'formal') {
			occasions.push('work', 'business', 'formal_events')
		}
		if (garmentInfo.style === 'casual') {
			occasions.push('everyday', 'weekend', 'casual_outings')
		}
		if (garmentInfo.style === 'sporty') {
			occasions.push('gym', 'sports', 'active_wear')
		}

		// Based on colors and patterns
		if (colors.brightness === 'bright' || pattern.pattern !== 'solid') {
			occasions.push('parties', 'social_events')
		}

		// Default occasions
		if (occasions.length === 0) {
			occasions.push('everyday', 'casual')
		}

		return [...new Set(occasions)]
	}

	/**
	 * Generate enhanced fallback when AI fails
	 * @param {string} imagePath - Image path
	 * @param {string} publicUrl - Public URL
	 * @returns {Object} Fallback analysis
	 */
	generateEnhancedFallback(imagePath, publicUrl) {
		const filename = path.basename(imagePath).toLowerCase()
		const fallback = this.inferFromFilename(imagePath)

		return {
			category: fallback.garmentInfo.category,
			subcategory: fallback.garmentInfo.subcategory,
			primaryColor: 'Unknown',
			colors: ['Unknown'],
			pattern: 'solid',
			style: fallback.garmentInfo.style,
			styleTags: ['basic'],
			seasons: ['all'],
			occasions: ['everyday'],
			confidence: 0.3,
			analysisMethod: 'fallback',
			error: 'AI analysis failed, using filename inference',
			analyzedAt: new Date().toISOString()
		}
	}

	/**
	 * Fallback color analysis using basic techniques
	 * @param {string} imagePath - Image path
	 * @returns {Object} Basic color analysis
	 */
	fallbackColorAnalysis(imagePath) {
		const filename = path.basename(imagePath).toLowerCase()

		// Basic color inference from filename
		const colorMap = {
			red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow',
			black: 'Black', white: 'White', gray: 'Gray', pink: 'Pink',
			purple: 'Purple', orange: 'Orange', brown: 'Brown'
		}

		for (const [color, name] of Object.entries(colorMap)) {
			if (filename.includes(color)) {
				return {
					primaryColor: name,
					palette: [{ name, hex: '#808080', rgb: [128, 128, 128] }],
					temperature: 'neutral',
					confidence: 0.6
				}
			}
		}

		return {
			primaryColor: 'Unknown',
			palette: [{ name: 'Unknown', hex: '#808080', rgb: [128, 128, 128] }],
			temperature: 'neutral',
			confidence: 0.3
		}
	}

	/**
	 * Calculate image roughness
	 * @param {Object} image - Jimp image
	 * @returns {string} Roughness level
	 */
	async calculateRoughness(image) {
		// Simple edge detection for roughness
		const width = image.getWidth()
		const height = image.getHeight()
		let edgeCount = 0
		const sampleSize = Math.min(width, height, 100)

		for (let i = 0; i < sampleSize; i++) {
			const x = Math.floor(Math.random() * (width - 1))
			const y = Math.floor(Math.random() * (height - 1))

			const current = Jimp.intToRGBA(image.getPixelColor(x, y))
			const next = Jimp.intToRGBA(image.getPixelColor(x + 1, y))

			const diff = Math.abs(current.r - next.r) + Math.abs(current.g - next.g) + Math.abs(current.b - next.b)
			if (diff > 50) edgeCount++
		}

		const roughness = edgeCount / sampleSize
		return roughness > 0.3 ? 'high' : roughness > 0.15 ? 'medium' : 'low'
	}

	/**
	 * Calculate image smoothness
	 * @param {Object} image - Jimp image
	 * @returns {string} Smoothness level
	 */
	async calculateSmoothness(image) {
		const roughness = await this.calculateRoughness(image)
		return roughness === 'low' ? 'high' : roughness === 'high' ? 'low' : 'medium'
	}

	/**
	 * Infer fabric type from image analysis
	 * @param {Object} image - Jimp image
	 * @param {string} imagePath - Image path
	 * @returns {string} Fabric type
	 */
	async inferFabricType(image, imagePath) {
		const filename = path.basename(imagePath).toLowerCase()
		const roughness = await this.calculateRoughness(image)

		// Basic fabric inference
		if (filename.includes('denim') || filename.includes('jean')) return 'denim'
		if (filename.includes('silk')) return 'silk'
		if (filename.includes('cotton')) return 'cotton'
		if (filename.includes('wool')) return 'wool'
		if (filename.includes('leather')) return 'leather'

		// Based on texture
		if (roughness === 'high') return 'denim'
		if (roughness === 'low') return 'silk'
		return 'cotton'
	}

	/**
	 * Analyze fit based on aspect ratio
	 * @param {number} aspectRatio - Image aspect ratio
	 * @returns {Object} Fit analysis
	 */
	analyzeFit(aspectRatio) {
		let fit, silhouette, length

		if (aspectRatio > 1.5) {
			fit = 'loose'
			silhouette = 'relaxed'
			length = 'long'
		} else if (aspectRatio < 0.7) {
			fit = 'fitted'
			silhouette = 'slim'
			length = 'short'
		} else {
			fit = 'regular'
			silhouette = 'classic'
			length = 'regular'
		}

		return { fit, silhouette, length }
	}

	/**
	 * Infer category from AI description
	 * @param {string} description - AI classification description
	 * @returns {Object} Category information
	 */
	inferCategoryFromDescription(description) {
		const desc = description.toLowerCase()

		if (desc.includes('shirt') || desc.includes('top') || desc.includes('blouse')) {
			return { category: 'top', subcategory: 'shirt', style: 'casual' }
		}
		if (desc.includes('dress') || desc.includes('gown')) {
			return { category: 'dress', subcategory: 'dress', style: 'formal' }
		}
		if (desc.includes('pants') || desc.includes('trouser') || desc.includes('jean')) {
			return { category: 'bottom', subcategory: 'pants', style: 'casual' }
		}
		if (desc.includes('shoe') || desc.includes('boot') || desc.includes('sneaker')) {
			return { category: 'shoes', subcategory: 'shoes', style: 'casual' }
		}

		return { category: 'top', subcategory: 'shirt', style: 'casual' }
	}
}

export default FreeGarmentAI
