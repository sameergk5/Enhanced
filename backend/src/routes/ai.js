import Anthropic from '@anthropic-ai/sdk'
import express from 'express'
import { body, validationResult } from 'express-validator'
import OpenAI from 'openai'
import { FashionAIService } from '../services/fashionAI.js'
import { analyzeGarmentMetadata, batchProcessGarments } from '../services/garmentAI.js'

const router = express.Router()

// Initialize Fashion AI Service
const fashionAI = new FashionAIService()

// Initialize AI clients with development mode fallback
const isDevelopment = process.env.OPENAI_API_KEY === 'dev-mode' || process.env.NODE_ENV === 'development'

let openai = null
let anthropic = null

if (!isDevelopment && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dev-mode') {
	openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY
	})
} else {
	console.log('AI services running in development mode - using mock responses')
}

if (!isDevelopment && process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'dev-mode') {
	anthropic = new Anthropic({
		apiKey: process.env.CLAUDE_API_KEY
	})
}

// Style analysis endpoint
router.post('/analyze-style', [
	body('imageUrl').isURL(),
	body('description').optional().isLength({ max: 500 })
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { imageUrl, description } = req.body

		let analysis

		if (openai) {
			// Use OpenAI Vision API to analyze the clothing item
			const response = await openai.chat.completions.create({
				model: "gpt-4-vision-preview",
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: `Analyze this fashion item and provide:
1. Category (top, bottom, dress, shoes, accessory, outerwear)
2. Style (casual, formal, boho, minimalist, vintage, streetwear, etc.)
3. Color palette (main colors)
4. Pattern type (solid, striped, floral, geometric, etc.)
5. Occasion recommendations
6. Season suitability
7. Style tips and outfit suggestions

${description ? `Additional context: ${description}` : ''}

Respond in JSON format with these fields.`
							},
							{
								type: "image_url",
								image_url: {
									url: imageUrl
								}
							}
						]
					}
				],
				max_tokens: 1000
			})

			analysis = JSON.parse(response.choices[0].message.content)
		} else {
			// Development mode - return mock analysis
			analysis = {
				category: "top",
				style: "casual",
				colorPalette: ["blue", "white"],
				patternType: "solid",
				occasionRecommendations: ["everyday", "weekend"],
				seasonSuitability: ["spring", "summer"],
				styleTips: "This is a mock analysis for development mode. Perfect for casual outings!"
			}
		}

		res.json({
			success: true,
			analysis
		})
	} catch (error) {
		console.error('Style analysis error:', error)
		res.status(500).json({ error: 'Failed to analyze style' })
	}
})

// Outfit recommendations
router.post('/recommend-outfit', [
	body('occasion').notEmpty(),
	body('weather').optional(),
	body('style').optional()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { occasion, weather, style } = req.body
		const userId = req.user.id

		let recommendations

		if (anthropic) {
			// Get user's wardrobe (simplified for demo)
			// In production, you'd fetch from database and use embeddings
			const prompt = `Based on the following criteria, suggest 3 outfit combinations:
- Occasion: ${occasion}
- Weather: ${weather || 'mild'}
- Preferred style: ${style || 'any'}

For each outfit, provide:
1. Top, bottom, shoes, and accessories
2. Color coordination tips
3. Styling advice
4. Why it works for the occasion

Respond in JSON format with an array of outfit objects.`

			const response = await anthropic.messages.create({
				model: "claude-3-sonnet-20240229",
				max_tokens: 1500,
				messages: [
					{
						role: "user",
						content: prompt
					}
				]
			})

			recommendations = JSON.parse(response.content[0].text)
		} else {
			// Development mode - return mock recommendations
			recommendations = [
				{
					id: 1,
					top: "White button-up shirt",
					bottom: "Dark blue jeans",
					shoes: "Brown leather loafers",
					accessories: ["Brown leather belt", "Silver watch"],
					colorTips: "Classic blue and white combination with brown accents",
					stylingAdvice: "Roll up sleeves for a more casual look",
					whyItWorks: "Perfect smart-casual look for most occasions"
				},
				{
					id: 2,
					top: "Black turtleneck",
					bottom: "Grey trousers",
					shoes: "Black boots",
					accessories: ["Black leather jacket"],
					colorTips: "Monochromatic palette with subtle contrast",
					stylingAdvice: "Layer with jacket for added style",
					whyItWorks: "Versatile and effortlessly stylish"
				}
			]
		}

		res.json({
			success: true,
			recommendations,
			criteria: { occasion, weather, style }
		})
	} catch (error) {
		console.error('Outfit recommendation error:', error)
		res.status(500).json({ error: 'Failed to generate outfit recommendations' })
	}
})

// Advanced AI-powered outfit recommendations (Task 8.4)
router.get('/v1/recommendations', [
	// Optional validation for query parameters
	body('item_id').optional().isString(),
	body('occasion').optional().isString(),
	body('weather').optional().isString(),
	body('skin_tone').optional().isIn(['cool', 'warm', 'neutral']),
	body('max_recommendations').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
	try {
		// Validate user authentication
		if (!req.user || !req.user.id) {
			return res.status(401).json({
				success: false,
				error: 'User authentication required'
			})
		}

		// Extract and validate query parameters
		const {
			item_id: itemId,
			user_id: userId = req.user.id,
			occasion = 'casual',
			weather = 'mild',
			skin_tone: skinTone = 'neutral',
			max_recommendations: maxRecommendations = 5
		} = req.query

		// Input validation
		const validOccasions = ['casual', 'formal', 'business_casual', 'smart_casual', 'work', 'date', 'party', 'weekend']
		const validWeather = ['hot', 'warm', 'mild', 'cool', 'cold', 'rainy', 'sunny']
		const validSkinTones = ['cool', 'warm', 'neutral']

		if (occasion && !validOccasions.includes(occasion)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid occasion. Must be one of: ' + validOccasions.join(', ')
			})
		}

		if (weather && !validWeather.includes(weather)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid weather. Must be one of: ' + validWeather.join(', ')
			})
		}

		if (skinTone && !validSkinTones.includes(skinTone)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid skin_tone. Must be one of: ' + validSkinTones.join(', ')
			})
		}

		const maxRecs = parseInt(maxRecommendations) || 5
		if (maxRecs < 1 || maxRecs > 10) {
			return res.status(400).json({
				success: false,
				error: 'max_recommendations must be between 1 and 10'
			})
		}

		console.log(`Generating outfit recommendations for user ${userId}`, {
			itemId,
			occasion,
			weather,
			skinTone,
			maxRecommendations: maxRecs
		})

		// Generate recommendations using Fashion AI service
		const result = await fashionAI.getOutfitRecommendations({
			userId,
			itemId,
			occasion,
			weather,
			skinTone,
			maxRecommendations: maxRecs
		})

		if (!result.success) {
			return res.status(400).json({
				success: false,
				error: result.error,
				details: result.details
			})
		}

		// Format response according to API specification
		const formattedRecommendations = result.recommendations.map(outfit => ({
			outfit_id: outfit.id,
			rank: outfit.rank,
			confidence_score: Math.round(outfit.score * 100) / 100,
			recommendation_level: outfit.recommendation,
			items: outfit.items.map(item => ({
				item_id: item.id,
				category: item.category,
				subcategory: item.subcategory,
				primary_color: item.primaryColor,
				style: item.style,
				image_url: item.imageUrl
			})),
			styling_analysis: {
				formality_score: outfit.breakdown?.formality || 0,
				color_harmony_score: outfit.breakdown?.colorHarmony || 0,
				style_coherence_score: outfit.breakdown?.styleCoherence || 0,
				pattern_compatibility_score: outfit.breakdown?.patternCompatibility || 0
			},
			styling_tips: this.generateStylingTips(outfit.items, result.context),
			color_coordination: this.generateColorCoordination(outfit.items, result.skinToneAnalysis)
		}))

		// Return successful response
		res.status(200).json({
			success: true,
			message: `Generated ${formattedRecommendations.length} outfit recommendations`,
			data: {
				recommendations: formattedRecommendations,
				request_context: {
					user_id: userId,
					item_id: itemId,
					occasion,
					weather,
					skin_tone: result.skinToneAnalysis.primaryTone,
					max_recommendations: maxRecs
				},
				user_analysis: {
					skin_tone: result.skinToneAnalysis.primaryTone,
					undertone: result.skinToneAnalysis.undertone,
					wardrobe_size: result.totalWardrobeItems,
					recommended_colors: result.skinToneAnalysis.colorRecommendations?.excellent?.slice(0, 5).map(c => c.name) || []
				},
				metadata: {
					generated_at: result.generatedAt,
					api_version: 'v1',
					algorithm_version: '1.0'
				}
			}
		})

	} catch (error) {
		console.error('V1 Recommendations API error:', error)
		res.status(500).json({
			success: false,
			error: 'Internal server error',
			details: process.env.NODE_ENV === 'development' ? error.message : 'Failed to generate recommendations'
		})
	}
})

// Helper method to generate styling tips
router.generateStylingTips = function (items, context) {
	const tips = []

	// Add occasion-specific tips
	if (context.occasion === 'formal') {
		tips.push('Ensure all items are wrinkle-free and well-fitted')
		tips.push('Consider adding a statement accessory for sophistication')
	} else if (context.occasion === 'casual') {
		tips.push('Feel free to mix textures for visual interest')
		tips.push('Roll up sleeves or cuffs for a relaxed look')
	}

	// Add weather-specific tips
	if (context.weather === 'cold') {
		tips.push('Layer pieces for warmth and style versatility')
	} else if (context.weather === 'hot') {
		tips.push('Choose breathable fabrics and lighter colors')
	}

	// Add color tips
	const hasPatterns = items.some(item => item.pattern && item.pattern !== 'solid')
	if (hasPatterns) {
		tips.push('Keep accessories minimal to let patterns stand out')
	} else {
		tips.push('Add visual interest with textured accessories')
	}

	return tips.slice(0, 3) // Return top 3 tips
}

// Helper method to generate color coordination advice
router.generateColorCoordination = function (items, skinToneAnalysis) {
	const colors = items.map(item => item.primaryColor).filter(Boolean)
	const coordination = {
		primary_palette: colors,
		skin_tone_compatibility: 'high', // Could be calculated based on analysis
		harmony_type: 'complementary' // Could be detected from color analysis
	}

	const advice = []
	if (skinToneAnalysis.primaryTone === 'cool') {
		advice.push('These cool tones complement your skin undertone beautifully')
	} else if (skinToneAnalysis.primaryTone === 'warm') {
		advice.push('These warm colors enhance your natural glow')
	} else {
		advice.push('This balanced palette works perfectly with your neutral undertone')
	}

	coordination.styling_advice = advice
	return coordination
}

// Color palette generation
router.post('/color-palette', [
	body('baseColor').notEmpty(),
	body('style').optional(),
	body('season').optional()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { baseColor, style, season } = req.body

		let palette

		if (openai) {
			const prompt = `Generate a fashion color palette based on:
- Base color: ${baseColor}
- Style: ${style || 'versatile'}
- Season: ${season || 'any'}

Provide:
1. 5 complementary colors that work well with the base color
2. Color codes (hex values)
3. How to use each color (primary, accent, neutral, etc.)
4. Outfit combination suggestions

Respond in JSON format.`

			const response = await openai.chat.completions.create({
				model: "gpt-4",
				messages: [
					{
						role: "user",
						content: prompt
					}
				],
				max_tokens: 800
			})

			palette = JSON.parse(response.choices[0].message.content)
		} else {
			// Development mode - return mock palette
			palette = {
				colors: [
					{ name: "Primary", hex: "#2E86C1", usage: "Main color for base pieces" },
					{ name: "Accent", hex: "#F39C12", usage: "Statement pieces and accessories" },
					{ name: "Neutral", hex: "#BDC3C7", usage: "Supporting pieces and layering" },
					{ name: "Complement", hex: "#E74C3C", usage: "Bold accents and shoes" },
					{ name: "Light", hex: "#ECF0F1", usage: "Light tops and summer pieces" }
				],
				suggestions: [
					"Use primary color for pants or skirts",
					"Add accent color through accessories",
					"Neutrals work great for layering pieces"
				]
			}
		}

		res.json({
			success: true,
			palette,
			baseColor
		})
	} catch (error) {
		console.error('Color palette error:', error)
		res.status(500).json({ error: 'Failed to generate color palette' })
	}
})

// Trend analysis
router.get('/trends', async (req, res) => {
	try {
		const { category, season } = req.query

		let trends

		if (anthropic) {
			const prompt = `Provide current fashion trends for:
- Category: ${category || 'all fashion'}
- Season: ${season || 'current season'}

Include:
1. Top 5 trending styles
2. Popular colors this season
3. Key pieces to invest in
4. Styling tips
5. How to incorporate trends affordably

Respond in JSON format.`

			const response = await anthropic.messages.create({
				model: "claude-3-sonnet-20240229",
				max_tokens: 1200,
				messages: [
					{
						role: "user",
						content: prompt
					}
				]
			})

			trends = JSON.parse(response.content[0].text)
		} else {
			// Development mode - return mock trends
			trends = {
				trendingStyles: [
					"Oversized blazers",
					"Wide-leg trousers",
					"Statement sleeves",
					"Monochromatic looks",
					"Sustainable fabrics"
				],
				popularColors: ["Sage green", "Warm terracotta", "Classic navy", "Soft lavender"],
				keyPieces: ["Structured blazer", "High-waisted jeans", "Statement sneakers"],
				stylingTips: [
					"Mix textures for visual interest",
					"Invest in quality basics",
					"Add personality with accessories"
				],
				affordableTips: [
					"Shop your closet first",
					"Focus on versatile pieces",
					"Look for sustainable secondhand options"
				]
			}
		}

		res.json({
			success: true,
			trends,
			lastUpdated: new Date().toISOString()
		})
	} catch (error) {
		console.error('Trend analysis error:', error)
		res.status(500).json({ error: 'Failed to get trend analysis' })
	}
})

// Garment metadata analysis endpoint (Task 3.3)
router.post('/analyze-garment', [
	body('imageUrl').isURL(),
	body('imagePath').optional().isString()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { imageUrl, imagePath } = req.body

		console.log('Starting garment analysis for:', imageUrl)

		// Use the dedicated garment AI service
		const analysis = await analyzeGarmentMetadata(imagePath || imageUrl, imageUrl)

		res.json({
			success: true,
			analysis,
			imageUrl,
			analyzedAt: new Date().toISOString()
		})
	} catch (error) {
		console.error('Garment analysis error:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to analyze garment',
			details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
		})
	}
})

// Batch process garments for AI analysis (Task 3.3)
router.post('/batch-analyze', [
	body('garmentIds').isArray({ min: 1 }),
	body('garmentIds.*').isString()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { garmentIds } = req.body

		if (garmentIds.length > 20) {
			return res.status(400).json({
				error: 'Batch size too large',
				details: 'Maximum 20 garments per batch'
			})
		}

		console.log(`Starting batch analysis for ${garmentIds.length} garments`)

		// Process garments in batch
		const results = await batchProcessGarments(garmentIds)

		const successCount = results.filter(r => r.success).length
		const failureCount = results.length - successCount

		res.json({
			success: true,
			message: `Batch analysis completed: ${successCount} succeeded, ${failureCount} failed`,
			results,
			summary: {
				total: results.length,
				succeeded: successCount,
				failed: failureCount,
				processedAt: new Date().toISOString()
			}
		})
	} catch (error) {
		console.error('Batch analysis error:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to process batch analysis',
			details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
		})
	}
})

export default router
