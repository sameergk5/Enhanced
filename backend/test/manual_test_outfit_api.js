#!/usr/bin/env node

/**
 * Manual Test Script for Fashion AI Outfit Recommendations API (Task 8.4)
 *
 * This script tests the /v1/recommendations endpoint with various scenarios
 * to ensure it properly integrates the color matching and item pairing logic.
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'
const API_ENDPOINT = `${API_BASE_URL}/api/ai/v1/recommendations`

// Test scenarios
const testScenarios = [
	{
		name: 'Casual Weekend Outfit',
		params: {
			occasion: 'casual',
			weather: 'mild',
			skin_tone: 'cool',
			max_recommendations: 3
		},
		expectedResults: {
			minRecommendations: 1,
			maxFormalityScore: 0.7,
			minColorHarmonyScore: 0.4
		}
	},
	{
		name: 'Business Meeting Outfit',
		params: {
			occasion: 'formal',
			weather: 'mild',
			skin_tone: 'warm',
			max_recommendations: 2
		},
		expectedResults: {
			minRecommendations: 1,
			minFormalityScore: 0.6,
			minColorHarmonyScore: 0.5
		}
	},
	{
		name: 'Date Night Smart Casual',
		params: {
			occasion: 'smart_casual',
			weather: 'cool',
			skin_tone: 'neutral',
			max_recommendations: 4
		},
		expectedResults: {
			minRecommendations: 1,
			minFormalityScore: 0.4,
			maxFormalityScore: 0.8
		}
	}
]

/**
 * Create test user with comprehensive wardrobe
 */
async function createTestUser() {
	try {
		// Create test user
		const testUser = await prisma.user.create({
			data: {
				email: `test.api.${Date.now()}@example.com`,
				name: 'API Test User',
				skinTone: 'cool',
				stylePreferences: ['casual', 'smart_casual', 'formal']
			}
		})

		console.log(`✅ Created test user: ${testUser.id}`)

		// Create comprehensive test wardrobe
		const wardrobeItems = [
			// Tops
			{
				userId: testUser.id,
				category: 'top',
				subcategory: 'button_shirt',
				primaryColor: 'blue',
				secondaryColors: ['white'],
				style: 'smart_casual',
				pattern: 'solid',
				material: 'cotton',
				brand: 'TestBrand',
				formality: 4,
				season: 'all',
				imageUrl: 'https://example.com/blue-shirt.jpg'
			},
			{
				userId: testUser.id,
				category: 'top',
				subcategory: 't_shirt',
				primaryColor: 'white',
				style: 'casual',
				pattern: 'solid',
				material: 'cotton',
				brand: 'TestBrand',
				formality: 2,
				season: 'summer',
				imageUrl: 'https://example.com/white-tshirt.jpg'
			},
			{
				userId: testUser.id,
				category: 'top',
				subcategory: 'blouse',
				primaryColor: 'black',
				style: 'formal',
				pattern: 'solid',
				material: 'silk',
				brand: 'TestBrand',
				formality: 5,
				season: 'all',
				imageUrl: 'https://example.com/black-blouse.jpg'
			},
			// Bottoms
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
				category: 'bottom',
				subcategory: 'trousers',
				primaryColor: 'charcoal',
				style: 'formal',
				pattern: 'solid',
				material: 'wool',
				brand: 'TestBrand',
				formality: 5,
				season: 'winter',
				imageUrl: 'https://example.com/charcoal-trousers.jpg'
			},
			{
				userId: testUser.id,
				category: 'bottom',
				subcategory: 'chinos',
				primaryColor: 'beige',
				style: 'smart_casual',
				pattern: 'solid',
				material: 'cotton',
				brand: 'TestBrand',
				formality: 3,
				season: 'all',
				imageUrl: 'https://example.com/beige-chinos.jpg'
			},
			// Shoes
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

		const createdGarments = []
		for (const garmentData of wardrobeItems) {
			const garment = await prisma.garment.create({ data: garmentData })
			createdGarments.push(garment)
		}

		console.log(`✅ Created ${createdGarments.length} test garments`)

		return { user: testUser, garments: createdGarments }

	} catch (error) {
		console.error('❌ Error creating test user:', error)
		throw error
	}
}

/**
 * Test API endpoint with given parameters
 */
async function testAPIEndpoint(userId, scenario) {
	try {
		console.log(`\n🧪 Testing: ${scenario.name}`)
		console.log(`Parameters:`, scenario.params)

		const params = {
			user_id: userId,
			...scenario.params
		}

		const response = await axios.get(API_ENDPOINT, {
			params,
			headers: {
				'Authorization': 'Bearer mock-token' // Mock auth for testing
			}
		})

		if (response.status === 200 && response.data.success) {
			console.log(`✅ API call successful`)

			const data = response.data.data
			const recommendations = data.recommendations

			console.log(`📊 Generated ${recommendations.length} recommendations`)

			// Validate response structure
			if (recommendations.length >= scenario.expectedResults.minRecommendations) {
				console.log(`✅ Minimum recommendations met`)
			} else {
				console.log(`❌ Expected at least ${scenario.expectedResults.minRecommendations} recommendations, got ${recommendations.length}`)
			}

			// Analyze first recommendation in detail
			if (recommendations.length > 0) {
				const firstRec = recommendations[0]
				console.log(`\n📋 First Recommendation Analysis:`)
				console.log(`   Outfit ID: ${firstRec.outfit_id}`)
				console.log(`   Confidence Score: ${firstRec.confidence_score}`)
				console.log(`   Recommendation Level: ${firstRec.recommendation_level}`)
				console.log(`   Items Count: ${firstRec.items.length}`)

				// Log items
				console.log(`   Items:`)
				firstRec.items.forEach((item, idx) => {
					console.log(`     ${idx + 1}. ${item.category} - ${item.primary_color} ${item.style}`)
				})

				// Validate styling analysis scores
				const analysis = firstRec.styling_analysis
				console.log(`\n🎯 Styling Analysis:`)
				console.log(`   Formality Score: ${analysis.formality_score}`)
				console.log(`   Color Harmony Score: ${analysis.color_harmony_score}`)
				console.log(`   Style Coherence Score: ${analysis.style_coherence_score}`)
				console.log(`   Pattern Compatibility Score: ${analysis.pattern_compatibility_score}`)

				// Check expected results
				if (scenario.expectedResults.minFormalityScore && analysis.formality_score < scenario.expectedResults.minFormalityScore) {
					console.log(`❌ Formality score too low: ${analysis.formality_score} < ${scenario.expectedResults.minFormalityScore}`)
				}
				if (scenario.expectedResults.maxFormalityScore && analysis.formality_score > scenario.expectedResults.maxFormalityScore) {
					console.log(`❌ Formality score too high: ${analysis.formality_score} > ${scenario.expectedResults.maxFormalityScore}`)
				}
				if (scenario.expectedResults.minColorHarmonyScore && analysis.color_harmony_score < scenario.expectedResults.minColorHarmonyScore) {
					console.log(`❌ Color harmony score too low: ${analysis.color_harmony_score} < ${scenario.expectedResults.minColorHarmonyScore}`)
				}

				// Log styling tips
				console.log(`\n💡 Styling Tips:`)
				firstRec.styling_tips.forEach((tip, idx) => {
					console.log(`   ${idx + 1}. ${tip}`)
				})

				// Log color coordination
				console.log(`\n🎨 Color Coordination:`)
				console.log(`   Primary Palette: ${firstRec.color_coordination.primary_palette.join(', ')}`)
				console.log(`   Skin Tone Compatibility: ${firstRec.color_coordination.skin_tone_compatibility}`)
				console.log(`   Harmony Type: ${firstRec.color_coordination.harmony_type}`)
			}

			// Log user analysis
			console.log(`\n👤 User Analysis:`)
			console.log(`   Skin Tone: ${data.user_analysis.skin_tone}`)
			console.log(`   Undertone: ${data.user_analysis.undertone || 'N/A'}`)
			console.log(`   Wardrobe Size: ${data.user_analysis.wardrobe_size}`)
			console.log(`   Recommended Colors: ${data.user_analysis.recommended_colors.join(', ')}`)

			return { success: true, data: response.data }

		} else {
			console.log(`❌ API call failed:`, response.data)
			return { success: false, error: response.data }
		}

	} catch (error) {
		console.log(`❌ API call error:`, error.response?.data || error.message)
		return { success: false, error: error.response?.data || error.message }
	}
}

/**
 * Test specific item recommendations
 */
async function testSpecificItemRecommendations(userId, garments) {
	console.log(`\n🎯 Testing specific item recommendations...`)

	// Find a blue shirt to test with
	const blueShirt = garments.find(g => g.primaryColor === 'blue' && g.category === 'top')

	if (blueShirt) {
		console.log(`\n🧪 Testing recommendations for blue shirt (${blueShirt.id})`)

		const scenario = {
			name: 'Blue Shirt Specific Recommendations',
			params: {
				item_id: blueShirt.id,
				occasion: 'smart_casual',
				weather: 'mild',
				skin_tone: 'cool',
				max_recommendations: 3
			}
		}

		const result = await testAPIEndpoint(userId, scenario)

		if (result.success) {
			const recommendations = result.data.data.recommendations
			let includesBlueShirt = false

			for (const rec of recommendations) {
				if (rec.items.some(item => item.item_id === blueShirt.id)) {
					includesBlueShirt = true
					break
				}
			}

			if (includesBlueShirt) {
				console.log(`✅ Recommendations correctly include the specified blue shirt`)
			} else {
				console.log(`❌ Recommendations should include the specified blue shirt`)
			}
		}
	} else {
		console.log(`❌ No blue shirt found in test wardrobe`)
	}
}

/**
 * Test error scenarios
 */
async function testErrorScenarios(userId) {
	console.log(`\n🚨 Testing error scenarios...`)

	const errorTests = [
		{
			name: 'Invalid occasion',
			params: { user_id: userId, occasion: 'invalid_occasion' },
			expectedStatus: 400
		},
		{
			name: 'Invalid skin tone',
			params: { user_id: userId, skin_tone: 'invalid_tone' },
			expectedStatus: 400
		},
		{
			name: 'Invalid max recommendations',
			params: { user_id: userId, max_recommendations: 15 },
			expectedStatus: 400
		}
	]

	for (const test of errorTests) {
		try {
			console.log(`\n🧪 Testing: ${test.name}`)

			const response = await axios.get(API_ENDPOINT, {
				params: test.params,
				headers: { 'Authorization': 'Bearer mock-token' }
			})

			console.log(`❌ Expected error but got success:`, response.status)

		} catch (error) {
			if (error.response && error.response.status === test.expectedStatus) {
				console.log(`✅ Correctly returned ${test.expectedStatus} error`)
			} else {
				console.log(`❌ Expected ${test.expectedStatus} but got ${error.response?.status || 'unknown error'}`)
			}
		}
	}
}

/**
 * Clean up test data
 */
async function cleanup(userId) {
	try {
		console.log(`\n🧹 Cleaning up test data...`)

		await prisma.garment.deleteMany({
			where: { userId: userId }
		})

		await prisma.user.delete({
			where: { id: userId }
		})

		console.log(`✅ Cleanup completed`)

	} catch (error) {
		console.error('❌ Cleanup error:', error)
	}
}

/**
 * Main test execution
 */
async function runTests() {
	console.log(`🚀 Starting Fashion AI Outfit Recommendations API Tests`)
	console.log(`API Endpoint: ${API_ENDPOINT}`)

	let testData = null

	try {
		// Create test data
		testData = await createTestUser()
		const userId = testData.user.id

		// Test all scenarios
		for (const scenario of testScenarios) {
			await testAPIEndpoint(userId, scenario)
		}

		// Test specific item recommendations
		await testSpecificItemRecommendations(userId, testData.garments)

		// Test error scenarios
		await testErrorScenarios(userId)

		console.log(`\n🎉 All tests completed!`)

	} catch (error) {
		console.error(`❌ Test execution failed:`, error)
	} finally {
		// Clean up
		if (testData) {
			await cleanup(testData.user.id)
		}
		await prisma.$disconnect()
	}
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runTests().catch(console.error)
}

export { createTestUser, runTests, testAPIEndpoint }
