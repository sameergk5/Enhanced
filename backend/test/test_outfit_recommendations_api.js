import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import app from '../src/server.js'

const prisma = new PrismaClient()

describe('Fashion AI Outfit Recommendations API (Task 8.4)', () => {
	let testUser
	let testGarments = []
	let authToken

	beforeEach(async () => {
		// Create test user
		testUser = await prisma.user.create({
			data: {
				email: 'test.fashion@example.com',
				name: 'Fashion Test User',
				skinTone: 'cool',
				stylePreferences: ['casual', 'smart_casual']
			}
		})

		// Create comprehensive test wardrobe
		const wardrobeData = [
			{
				userId: testUser.id,
				category: 'top',
				subcategory: 'shirt',
				primaryColor: 'blue',
				secondaryColors: ['white'],
				style: 'casual',
				pattern: 'solid',
				material: 'cotton',
				brand: 'TestBrand',
				formality: 3,
				season: 'all',
				imageUrl: 'https://example.com/blue-shirt.jpg'
			},
			{
				userId: testUser.id,
				category: 'bottom',
				subcategory: 'jeans',
				primaryColor: 'navy',
				style: 'casual',
				pattern: 'solid',
				material: 'denim',
				brand: 'TestBrand',
				formality: 2,
				season: 'all',
				imageUrl: 'https://example.com/navy-jeans.jpg'
			},
			{
				userId: testUser.id,
				category: 'top',
				subcategory: 'blouse',
				primaryColor: 'white',
				style: 'formal',
				pattern: 'solid',
				material: 'silk',
				brand: 'TestBrand',
				formality: 5,
				season: 'all',
				imageUrl: 'https://example.com/white-blouse.jpg'
			},
			{
				userId: testUser.id,
				category: 'bottom',
				subcategory: 'trousers',
				primaryColor: 'black',
				style: 'formal',
				pattern: 'solid',
				material: 'wool',
				brand: 'TestBrand',
				formality: 5,
				season: 'all',
				imageUrl: 'https://example.com/black-trousers.jpg'
			},
			{
				userId: testUser.id,
				category: 'shoes',
				subcategory: 'sneakers',
				primaryColor: 'white',
				style: 'casual',
				pattern: 'solid',
				material: 'leather',
				brand: 'TestBrand',
				formality: 2,
				season: 'all',
				imageUrl: 'https://example.com/white-sneakers.jpg'
			},
			{
				userId: testUser.id,
				category: 'shoes',
				subcategory: 'oxford',
				primaryColor: 'brown',
				style: 'formal',
				pattern: 'solid',
				material: 'leather',
				brand: 'TestBrand',
				formality: 5,
				season: 'all',
				imageUrl: 'https://example.com/brown-oxford.jpg'
			}
		]

		for (const garmentData of wardrobeData) {
			const garment = await prisma.garment.create({ data: garmentData })
			testGarments.push(garment)
		}

		// Mock authentication token (in real app, this would be JWT)
		authToken = 'mock-auth-token'
	})

	afterEach(async () => {
		// Clean up test data
		await prisma.garment.deleteMany({
			where: { userId: testUser.id }
		})
		await prisma.user.delete({
			where: { id: testUser.id }
		})
	})

	describe('GET /v1/recommendations', () => {
		it('should return outfit recommendations for casual occasion', async () => {
			const response = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'casual',
					weather: 'mild',
					skin_tone: 'cool',
					max_recommendations: 3
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			expect(response.body.success).toBe(true)
			expect(response.body.data).toBeDefined()
			expect(response.body.data.recommendations).toBeInstanceOf(Array)
			expect(response.body.data.recommendations.length).toBeGreaterThan(0)
			expect(response.body.data.recommendations.length).toBeLessThanOrEqual(3)

			// Verify recommendation structure
			const recommendation = response.body.data.recommendations[0]
			expect(recommendation).toHaveProperty('outfit_id')
			expect(recommendation).toHaveProperty('rank')
			expect(recommendation).toHaveProperty('confidence_score')
			expect(recommendation).toHaveProperty('recommendation_level')
			expect(recommendation).toHaveProperty('items')
			expect(recommendation).toHaveProperty('styling_analysis')
			expect(recommendation).toHaveProperty('styling_tips')
			expect(recommendation).toHaveProperty('color_coordination')

			// Verify items structure
			expect(recommendation.items).toBeInstanceOf(Array)
			expect(recommendation.items.length).toBeGreaterThan(0)

			const item = recommendation.items[0]
			expect(item).toHaveProperty('item_id')
			expect(item).toHaveProperty('category')
			expect(item).toHaveProperty('primary_color')
			expect(item).toHaveProperty('style')

			// Verify styling analysis
			expect(recommendation.styling_analysis).toHaveProperty('formality_score')
			expect(recommendation.styling_analysis).toHaveProperty('color_harmony_score')
			expect(recommendation.styling_analysis).toHaveProperty('style_coherence_score')
			expect(recommendation.styling_analysis).toHaveProperty('pattern_compatibility_score')

			// Verify user analysis
			expect(response.body.data.user_analysis).toBeDefined()
			expect(response.body.data.user_analysis.skin_tone).toBe('cool')
			expect(response.body.data.user_analysis.wardrobe_size).toBe(testGarments.length)
		})

		it('should return outfit recommendations for formal occasion', async () => {
			const response = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'formal',
					weather: 'mild',
					skin_tone: 'cool',
					max_recommendations: 2
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			expect(response.body.success).toBe(true)
			expect(response.body.data.recommendations.length).toBeLessThanOrEqual(2)

			// Verify that formal recommendations have higher formality scores
			const recommendation = response.body.data.recommendations[0]
			expect(recommendation.styling_analysis.formality_score).toBeGreaterThan(0.5)
		})

		it('should filter recommendations by specific item_id', async () => {
			const blueShirt = testGarments.find(g => g.primaryColor === 'blue' && g.category === 'top')

			const response = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					item_id: blueShirt.id,
					occasion: 'casual',
					max_recommendations: 5
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			expect(response.body.success).toBe(true)

			// All recommendations should include the specified item
			for (const recommendation of response.body.data.recommendations) {
				const includesItem = recommendation.items.some(item => item.item_id === blueShirt.id)
				expect(includesItem).toBe(true)
			}
		})

		it('should validate input parameters', async () => {
			// Test invalid occasion
			await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'invalid_occasion'
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400)

			// Test invalid skin tone
			await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					skin_tone: 'invalid_tone'
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400)

			// Test invalid max_recommendations
			await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					max_recommendations: 15
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400)
		})

		it('should require authentication', async () => {
			await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'casual'
				})
				.expect(401)
		})

		it('should handle empty wardrobe gracefully', async () => {
			// Create user with no garments
			const emptyUser = await prisma.user.create({
				data: {
					email: 'empty.wardrobe@example.com',
					name: 'Empty Wardrobe User'
				}
			})

			const response = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: emptyUser.id,
					occasion: 'casual'
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(400)

			expect(response.body.success).toBe(false)
			expect(response.body.error).toContain('No wardrobe items found')

			// Clean up
			await prisma.user.delete({ where: { id: emptyUser.id } })
		})

		it('should return recommendations sorted by confidence score', async () => {
			const response = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'casual',
					max_recommendations: 3
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			const recommendations = response.body.data.recommendations

			// Verify recommendations are sorted by rank
			for (let i = 0; i < recommendations.length - 1; i++) {
				expect(recommendations[i].rank).toBeLessThan(recommendations[i + 1].rank)
				expect(recommendations[i].confidence_score).toBeGreaterThanOrEqual(recommendations[i + 1].confidence_score)
			}
		})

		it('should include comprehensive styling analysis', async () => {
			const response = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'smart_casual',
					weather: 'cool',
					skin_tone: 'cool'
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			const recommendation = response.body.data.recommendations[0]

			// Verify styling analysis scores are in valid range
			expect(recommendation.styling_analysis.formality_score).toBeGreaterThanOrEqual(0)
			expect(recommendation.styling_analysis.formality_score).toBeLessThanOrEqual(1)
			expect(recommendation.styling_analysis.color_harmony_score).toBeGreaterThanOrEqual(0)
			expect(recommendation.styling_analysis.color_harmony_score).toBeLessThanOrEqual(1)
			expect(recommendation.styling_analysis.style_coherence_score).toBeGreaterThanOrEqual(0)
			expect(recommendation.styling_analysis.style_coherence_score).toBeLessThanOrEqual(1)
			expect(recommendation.styling_analysis.pattern_compatibility_score).toBeGreaterThanOrEqual(0)
			expect(recommendation.styling_analysis.pattern_compatibility_score).toBeLessThanOrEqual(1)

			// Verify styling tips are provided
			expect(recommendation.styling_tips).toBeInstanceOf(Array)
			expect(recommendation.styling_tips.length).toBeGreaterThan(0)

			// Verify color coordination advice
			expect(recommendation.color_coordination).toBeDefined()
			expect(recommendation.color_coordination.primary_palette).toBeInstanceOf(Array)
			expect(recommendation.color_coordination.styling_advice).toBeInstanceOf(Array)
		})

		it('should adapt recommendations based on weather', async () => {
			// Test cold weather recommendations
			const coldResponse = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'casual',
					weather: 'cold',
					max_recommendations: 2
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			const coldRecommendation = coldResponse.body.data.recommendations[0]
			expect(coldRecommendation.styling_tips.some(tip =>
				tip.toLowerCase().includes('layer')
			)).toBe(true)

			// Test hot weather recommendations
			const hotResponse = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'casual',
					weather: 'hot',
					max_recommendations: 2
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			const hotRecommendation = hotResponse.body.data.recommendations[0]
			expect(hotRecommendation.styling_tips.some(tip =>
				tip.toLowerCase().includes('breathable') || tip.toLowerCase().includes('light')
			)).toBe(true)
		})
	})

	describe('Fashion AI Service Integration', () => {
		it('should properly analyze skin tone compatibility', async () => {
			const response = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'casual',
					skin_tone: 'cool'
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			const userAnalysis = response.body.data.user_analysis
			expect(userAnalysis.skin_tone).toBe('cool')
			expect(userAnalysis.recommended_colors).toBeInstanceOf(Array)
			expect(userAnalysis.recommended_colors.length).toBeGreaterThan(0)

			// Cool skin tones should get cool color recommendations
			const coolColors = ['Royal Blue', 'Emerald Green', 'True Red', 'Pure White', 'Black']
			const hasAppropriateCoolColor = userAnalysis.recommended_colors.some(color =>
				coolColors.includes(color)
			)
			expect(hasAppropriateCoolColor).toBe(true)
		})

		it('should generate contextually appropriate recommendations', async () => {
			const response = await request(app)
				.get('/api/ai/v1/recommendations')
				.query({
					user_id: testUser.id,
					occasion: 'business_casual',
					weather: 'mild'
				})
				.set('Authorization', `Bearer ${authToken}`)
				.expect(200)

			const context = response.body.data.request_context
			expect(context.occasion).toBe('business_casual')
			expect(context.weather).toBe('mild')

			// Recommendations should include appropriate formality for business casual
			const recommendations = response.body.data.recommendations
			for (const rec of recommendations) {
				expect(rec.styling_analysis.formality_score).toBeGreaterThan(0.4)
				expect(rec.styling_analysis.formality_score).toBeLessThan(0.9)
			}
		})
	})
})

export default describe
