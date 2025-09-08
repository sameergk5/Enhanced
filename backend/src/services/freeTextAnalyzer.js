/**
 * FREE Text Analysis Service
 *
 * Provides natural language processing capabilities without paid APIs
 * Uses rule-based NLP, sentiment analysis, and keyword extraction
 *
 * NO PAID APIs REQUIRED!
 */

export class FreeTextAnalyzer {
	constructor() {
		// Style preference keywords
		this.styleKeywords = {
			casual: ['casual', 'relaxed', 'everyday', 'comfortable', 'laid-back', 'informal'],
			formal: ['formal', 'professional', 'business', 'elegant', 'sophisticated', 'dressy'],
			sporty: ['sporty', 'athletic', 'active', 'fitness', 'gym', 'workout', 'running'],
			bohemian: ['bohemian', 'boho', 'hippie', 'free-spirited', 'artistic', 'eclectic'],
			minimalist: ['minimalist', 'simple', 'clean', 'basic', 'understated', 'sleek'],
			vintage: ['vintage', 'retro', 'classic', 'timeless', 'antique', 'old-school'],
			edgy: ['edgy', 'punk', 'goth', 'alternative', 'rebellious', 'bold'],
			romantic: ['romantic', 'feminine', 'soft', 'delicate', 'flowing', 'pretty'],
			streetwear: ['streetwear', 'urban', 'hip-hop', 'trendy', 'cool', 'contemporary']
		}

		// Color preference keywords
		this.colorKeywords = {
			warm: ['warm', 'hot', 'bright', 'sunny', 'vibrant', 'energetic'],
			cool: ['cool', 'cold', 'calm', 'soothing', 'peaceful', 'serene'],
			neutral: ['neutral', 'natural', 'earthy', 'muted', 'subtle', 'soft'],
			bold: ['bold', 'bright', 'vibrant', 'eye-catching', 'striking', 'dramatic'],
			dark: ['dark', 'deep', 'rich', 'mysterious', 'moody', 'gothic'],
			light: ['light', 'pale', 'pastel', 'soft', 'gentle', 'airy']
		}

		// Occasion keywords
		this.occasionKeywords = {
			work: ['work', 'office', 'business', 'professional', 'meeting', 'corporate'],
			party: ['party', 'celebration', 'club', 'nightlife', 'dancing', 'festive'],
			casual: ['casual', 'everyday', 'weekend', 'shopping', 'errands', 'relaxed'],
			formal: ['formal', 'wedding', 'gala', 'ceremony', 'black-tie', 'elegant'],
			date: ['date', 'romantic', 'dinner', 'valentine', 'anniversary', 'special'],
			travel: ['travel', 'vacation', 'holiday', 'airport', 'sightseeing', 'adventure'],
			sports: ['sports', 'gym', 'fitness', 'exercise', 'workout', 'athletic']
		}

		// Season keywords
		this.seasonKeywords = {
			spring: ['spring', 'fresh', 'blooming', 'light', 'renewal', 'easter'],
			summer: ['summer', 'hot', 'sunny', 'beach', 'vacation', 'festival'],
			autumn: ['autumn', 'fall', 'cozy', 'warm', 'harvest', 'thanksgiving'],
			winter: ['winter', 'cold', 'snow', 'holiday', 'christmas', 'cozy']
		}

		// Body type keywords
		this.bodyTypeKeywords = {
			petite: ['petite', 'small', 'short', 'tiny', 'delicate'],
			tall: ['tall', 'long', 'lanky', 'statuesque', 'elongated'],
			curvy: ['curvy', 'hourglass', 'voluptuous', 'shapely', 'full-figured'],
			athletic: ['athletic', 'muscular', 'fit', 'toned', 'strong'],
			plus_size: ['plus', 'large', 'full', 'generous', 'ample']
		}

		// Sentiment words
		this.sentimentWords = {
			positive: ['love', 'like', 'enjoy', 'prefer', 'want', 'need', 'favorite', 'best', 'great', 'amazing', 'beautiful', 'gorgeous', 'perfect', 'excellent'],
			negative: ['hate', 'dislike', 'avoid', 'never', 'worst', 'terrible', 'ugly', 'awful', 'bad', 'horrible'],
			neutral: ['sometimes', 'maybe', 'okay', 'fine', 'alright', 'decent']
		}
	}

	/**
	 * Analyze user preferences from text input
	 * @param {string} text - User input text
	 * @returns {Object} Analyzed preferences
	 */
	analyzePreferences(text) {
		if (!text || typeof text !== 'string') {
			return this.getDefaultPreferences()
		}

		const cleanText = text.toLowerCase().trim()
		const words = cleanText.split(/\s+/)

		return {
			styles: this.extractStyles(cleanText, words),
			colors: this.extractColorPreferences(cleanText, words),
			occasions: this.extractOccasions(cleanText, words),
			seasons: this.extractSeasons(cleanText, words),
			bodyType: this.extractBodyType(cleanText, words),
			sentiment: this.analyzeSentiment(cleanText, words),
			confidence: this.calculateConfidence(cleanText, words),
			extractedKeywords: this.extractKeyKeywords(cleanText, words),
			insights: this.generateInsights(cleanText, words)
		}
	}

	/**
	 * Extract style preferences
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {Array} Style preferences with scores
	 */
	extractStyles(text, words) {
		const styleScores = {}

		for (const [style, keywords] of Object.entries(this.styleKeywords)) {
			let score = 0

			for (const keyword of keywords) {
				const keywordCount = (text.match(new RegExp(keyword, 'gi')) || []).length
				score += keywordCount

				// Bonus for exact word matches
				if (words.includes(keyword)) {
					score += 0.5
				}
			}

			if (score > 0) {
				styleScores[style] = score
			}
		}

		// Convert to sorted array
		return Object.entries(styleScores)
			.sort(([, a], [, b]) => b - a)
			.map(([style, score]) => ({
				style,
				confidence: Math.min(score / 3, 1), // Normalize to 0-1
				mentions: Math.floor(score)
			}))
			.slice(0, 5) // Top 5 styles
	}

	/**
	 * Extract color preferences
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {Object} Color preferences
	 */
	extractColorPreferences(text, words) {
		const colorScores = {}
		const specificColors = []

		// Check for specific color mentions
		const colorNames = [
			'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
			'black', 'white', 'gray', 'grey', 'navy', 'maroon', 'gold', 'silver',
			'turquoise', 'coral', 'beige', 'khaki', 'olive', 'lavender', 'mint',
			'rose', 'cream', 'ivory', 'burgundy', 'teal', 'indigo', 'magenta'
		]

		for (const color of colorNames) {
			const mentions = (text.match(new RegExp(color, 'gi')) || []).length
			if (mentions > 0) {
				specificColors.push({
					color,
					mentions,
					sentiment: this.getColorSentiment(text, color)
				})
			}
		}

		// Check for color category preferences
		for (const [category, keywords] of Object.entries(this.colorKeywords)) {
			let score = 0

			for (const keyword of keywords) {
				const keywordCount = (text.match(new RegExp(keyword, 'gi')) || []).length
				score += keywordCount
			}

			if (score > 0) {
				colorScores[category] = score
			}
		}

		return {
			categories: Object.entries(colorScores)
				.sort(([, a], [, b]) => b - a)
				.map(([category, score]) => ({
					category,
					confidence: Math.min(score / 2, 1)
				})),
			specificColors: specificColors
				.sort((a, b) => b.mentions - a.mentions)
				.slice(0, 5)
		}
	}

	/**
	 * Extract occasion preferences
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {Array} Occasion preferences
	 */
	extractOccasions(text, words) {
		const occasionScores = {}

		for (const [occasion, keywords] of Object.entries(this.occasionKeywords)) {
			let score = 0

			for (const keyword of keywords) {
				const keywordCount = (text.match(new RegExp(keyword, 'gi')) || []).length
				score += keywordCount
			}

			if (score > 0) {
				occasionScores[occasion] = score
			}
		}

		return Object.entries(occasionScores)
			.sort(([, a], [, b]) => b - a)
			.map(([occasion, score]) => ({
				occasion,
				confidence: Math.min(score / 2, 1),
				mentions: score
			}))
			.slice(0, 5)
	}

	/**
	 * Extract season preferences
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {Array} Season preferences
	 */
	extractSeasons(text, words) {
		const seasonScores = {}

		for (const [season, keywords] of Object.entries(this.seasonKeywords)) {
			let score = 0

			for (const keyword of keywords) {
				const keywordCount = (text.match(new RegExp(keyword, 'gi')) || []).length
				score += keywordCount
			}

			if (score > 0) {
				seasonScores[season] = score
			}
		}

		return Object.entries(seasonScores)
			.sort(([, a], [, b]) => b - a)
			.map(([season, score]) => ({
				season,
				confidence: Math.min(score / 2, 1)
			}))
	}

	/**
	 * Extract body type hints
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {Array} Body type suggestions
	 */
	extractBodyType(text, words) {
		const bodyTypeScores = {}

		for (const [type, keywords] of Object.entries(this.bodyTypeKeywords)) {
			let score = 0

			for (const keyword of keywords) {
				const keywordCount = (text.match(new RegExp(keyword, 'gi')) || []).length
				score += keywordCount
			}

			if (score > 0) {
				bodyTypeScores[type] = score
			}
		}

		return Object.entries(bodyTypeScores)
			.sort(([, a], [, b]) => b - a)
			.map(([type, score]) => ({
				type,
				confidence: Math.min(score / 2, 1)
			}))
	}

	/**
	 * Analyze sentiment of the text
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {Object} Sentiment analysis
	 */
	analyzeSentiment(text, words) {
		let positiveScore = 0
		let negativeScore = 0
		let neutralScore = 0

		for (const word of words) {
			if (this.sentimentWords.positive.includes(word)) {
				positiveScore++
			} else if (this.sentimentWords.negative.includes(word)) {
				negativeScore++
			} else if (this.sentimentWords.neutral.includes(word)) {
				neutralScore++
			}
		}

		const totalSentiment = positiveScore + negativeScore + neutralScore

		if (totalSentiment === 0) {
			return { overall: 'neutral', confidence: 0.5, scores: { positive: 0, negative: 0, neutral: 1 } }
		}

		const scores = {
			positive: positiveScore / totalSentiment,
			negative: negativeScore / totalSentiment,
			neutral: neutralScore / totalSentiment
		}

		const overall = positiveScore > negativeScore ? 'positive' :
			negativeScore > positiveScore ? 'negative' : 'neutral'

		return {
			overall,
			confidence: Math.max(...Object.values(scores)),
			scores,
			details: {
				positiveWords: positiveScore,
				negativeWords: negativeScore,
				neutralWords: neutralScore
			}
		}
	}

	/**
	 * Calculate overall confidence in the analysis
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {number} Confidence score 0-1
	 */
	calculateConfidence(text, words) {
		let confidence = 0

		// Length factor
		const lengthScore = Math.min(words.length / 20, 1) * 0.3

		// Keyword density
		const totalKeywords = Object.values(this.styleKeywords)
			.concat(Object.values(this.colorKeywords))
			.concat(Object.values(this.occasionKeywords))
			.flat()

		const foundKeywords = words.filter(word =>
			totalKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))
		).length

		const keywordScore = Math.min(foundKeywords / 5, 1) * 0.5

		// Specificity factor
		const specificityScore = text.split('.').length > 1 ? 0.2 : 0.1

		confidence = lengthScore + keywordScore + specificityScore

		return Math.min(confidence, 1)
	}

	/**
	 * Extract key keywords from text
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {Array} Key keywords found
	 */
	extractKeyKeywords(text, words) {
		const allKeywords = [
			...Object.values(this.styleKeywords).flat(),
			...Object.values(this.colorKeywords).flat(),
			...Object.values(this.occasionKeywords).flat(),
			...Object.values(this.seasonKeywords).flat()
		]

		const foundKeywords = []

		for (const word of words) {
			if (allKeywords.includes(word) && !foundKeywords.includes(word)) {
				foundKeywords.push(word)
			}
		}

		return foundKeywords.slice(0, 10) // Top 10 keywords
	}

	/**
	 * Generate insights from the analysis
	 * @param {string} text - Clean text
	 * @param {Array} words - Word array
	 * @returns {Array} Generated insights
	 */
	generateInsights(text, words) {
		const insights = []

		// Style insights
		if (text.includes('casual') && text.includes('comfortable')) {
			insights.push({
				type: 'style',
				insight: 'User prefers comfortable, casual clothing for everyday wear',
				confidence: 0.8
			})
		}

		if (text.includes('work') || text.includes('professional')) {
			insights.push({
				type: 'occasion',
				insight: 'User needs professional attire for work environment',
				confidence: 0.9
			})
		}

		if (text.includes('color') && (text.includes('bright') || text.includes('bold'))) {
			insights.push({
				type: 'color',
				insight: 'User enjoys vibrant, eye-catching colors',
				confidence: 0.7
			})
		}

		if (text.includes('simple') || text.includes('minimal')) {
			insights.push({
				type: 'style',
				insight: 'User prefers minimalist, clean aesthetic',
				confidence: 0.8
			})
		}

		return insights
	}

	/**
	 * Get color sentiment from context
	 * @param {string} text - Full text
	 * @param {string} color - Specific color
	 * @returns {string} Sentiment towards the color
	 */
	getColorSentiment(text, color) {
		const colorContext = text.toLowerCase()
		const colorIndex = colorContext.indexOf(color)

		if (colorIndex === -1) return 'neutral'

		// Check words around the color mention
		const beforeText = colorContext.substring(Math.max(0, colorIndex - 20), colorIndex)
		const afterText = colorContext.substring(colorIndex, Math.min(colorContext.length, colorIndex + 20))
		const context = beforeText + afterText

		const positiveWords = ['love', 'like', 'beautiful', 'gorgeous', 'favorite', 'perfect']
		const negativeWords = ['hate', 'dislike', 'ugly', 'awful', 'terrible', 'avoid']

		for (const word of positiveWords) {
			if (context.includes(word)) return 'positive'
		}

		for (const word of negativeWords) {
			if (context.includes(word)) return 'negative'
		}

		return 'neutral'
	}

	/**
	 * Get default preferences when no text provided
	 * @returns {Object} Default preferences
	 */
	getDefaultPreferences() {
		return {
			styles: [
				{ style: 'casual', confidence: 0.7, mentions: 1 }
			],
			colors: {
				categories: [
					{ category: 'neutral', confidence: 0.6 }
				],
				specificColors: []
			},
			occasions: [
				{ occasion: 'casual', confidence: 0.7, mentions: 1 }
			],
			seasons: [
				{ season: 'spring', confidence: 0.5 },
				{ season: 'summer', confidence: 0.5 },
				{ season: 'autumn', confidence: 0.5 },
				{ season: 'winter', confidence: 0.5 }
			],
			bodyType: [],
			sentiment: {
				overall: 'neutral',
				confidence: 0.5,
				scores: { positive: 0.3, negative: 0.2, neutral: 0.5 }
			},
			confidence: 0.3,
			extractedKeywords: [],
			insights: [
				{
					type: 'general',
					insight: 'No specific preferences provided, using default casual recommendations',
					confidence: 0.5
				}
			]
		}
	}

	/**
	 * Generate outfit recommendations based on preferences
	 * @param {Object} preferences - Analyzed preferences
	 * @param {Array} wardrobe - Available wardrobe items
	 * @returns {Array} Outfit recommendations
	 */
	generateOutfitRecommendations(preferences, wardrobe = []) {
		const recommendations = []

		// Generate recommendations based on top style preferences
		const topStyles = preferences.styles.slice(0, 3)

		for (const stylePreference of topStyles) {
			const recommendation = {
				style: stylePreference.style,
				confidence: stylePreference.confidence,
				reasoning: this.generateRecommendationReasoning(stylePreference, preferences),
				suggestedItems: this.suggestItemsForStyle(stylePreference.style, preferences),
				colorSuggestions: this.suggestColorsForStyle(stylePreference.style, preferences.colors),
				occasions: this.getOccasionsForStyle(stylePreference.style)
			}

			recommendations.push(recommendation)
		}

		return recommendations
	}

	/**
	 * Generate reasoning for recommendations
	 * @param {Object} stylePreference - Style preference
	 * @param {Object} preferences - All preferences
	 * @returns {string} Reasoning text
	 */
	generateRecommendationReasoning(stylePreference, preferences) {
		const style = stylePreference.style
		const sentiment = preferences.sentiment.overall

		let reasoning = `Based on your ${sentiment} sentiment towards ${style} style`

		if (preferences.colors.specificColors.length > 0) {
			const topColor = preferences.colors.specificColors[0].color
			reasoning += ` and your preference for ${topColor} colors`
		}

		if (preferences.occasions.length > 0) {
			const topOccasion = preferences.occasions[0].occasion
			reasoning += `, this style works well for ${topOccasion} occasions`
		}

		return reasoning + '.'
	}

	/**
	 * Suggest items for a specific style
	 * @param {string} style - Style name
	 * @param {Object} preferences - User preferences
	 * @returns {Array} Suggested items
	 */
	suggestItemsForStyle(style, preferences) {
		const styleItems = {
			casual: ['t-shirt', 'jeans', 'sneakers', 'cardigan', 'denim jacket'],
			formal: ['blazer', 'dress shirt', 'trousers', 'dress shoes', 'tie'],
			sporty: ['athletic top', 'leggings', 'sneakers', 'sports bra', 'track jacket'],
			bohemian: ['flowing dress', 'peasant blouse', 'wide-leg pants', 'sandals', 'layered jewelry'],
			minimalist: ['basic tee', 'straight-leg pants', 'simple dress', 'clean sneakers', 'structured bag']
		}

		return styleItems[style] || styleItems.casual
	}

	/**
	 * Suggest colors for a style
	 * @param {string} style - Style name
	 * @param {Object} colorPreferences - Color preferences
	 * @returns {Array} Suggested colors
	 */
	suggestColorsForStyle(style, colorPreferences) {
		const styleColors = {
			casual: ['blue', 'gray', 'white', 'navy', 'khaki'],
			formal: ['black', 'navy', 'white', 'gray', 'burgundy'],
			sporty: ['black', 'gray', 'bright colors', 'neon', 'white'],
			bohemian: ['earth tones', 'warm colors', 'jewel tones', 'burgundy', 'gold'],
			minimalist: ['black', 'white', 'gray', 'beige', 'navy']
		}

		let suggestedColors = styleColors[style] || styleColors.casual

		// Incorporate user's specific color preferences
		if (colorPreferences.specificColors.length > 0) {
			const userColors = colorPreferences.specificColors.map(c => c.color)
			suggestedColors = [...new Set([...userColors, ...suggestedColors])]
		}

		return suggestedColors.slice(0, 5)
	}

	/**
	 * Get suitable occasions for a style
	 * @param {string} style - Style name
	 * @returns {Array} Suitable occasions
	 */
	getOccasionsForStyle(style) {
		const styleOccasions = {
			casual: ['everyday', 'weekend', 'shopping', 'casual outings'],
			formal: ['work', 'business meetings', 'formal events', 'interviews'],
			sporty: ['gym', 'sports', 'exercise', 'active lifestyle'],
			bohemian: ['festivals', 'art events', 'casual dates', 'creative work'],
			minimalist: ['work', 'everyday', 'modern events', 'urban lifestyle']
		}

		return styleOccasions[style] || styleOccasions.casual
	}
}

export default FreeTextAnalyzer
