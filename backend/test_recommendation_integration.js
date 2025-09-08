import { PrismaClient } from '@prisma/client'
import { FashionAIService } from './src/services/fashionAI.js'

const prisma = new PrismaClient()

/**
 * Test script for Task 8.5: Integrate Recommendation Engine and Seed Item Database
 * This script tests the end-to-end integration of the recommendation system with the database
 */

async function testRecommendationIntegration() {
	console.log('🧪 Testing Recommendation Engine Integration...\n')

	try {
		// Initialize the Fashion AI Service
		const fashionAI = new FashionAIService()

		// Test 1: Database Connection
		console.log('1. Testing database connection...')
		const userCount = await prisma.user.count()
		const garmentCount = await prisma.garment.count()
		console.log(`   ✅ Connected! Found ${userCount} users and ${garmentCount} garments\n`)

		if (userCount === 0 || garmentCount === 0) {
			console.log('⚠️  Database appears to be empty. You may need to run the seeding script first.')
			console.log('   Run: npm run db:seed\n')
		}

		// Test 2: Get a test user
		console.log('2. Finding test user...')
		const testUser = await prisma.user.findFirst({
			include: {
				profile: true,
				styleProfile: true,
				avatars: true,
				garments: {
					take: 5
				}
			}
		})

		if (!testUser) {
			throw new Error('No test user found. Please run the seeding script first.')
		}

		console.log(`   ✅ Found test user: ${testUser.displayName} (${testUser.email})`)
		console.log(`   📊 User has ${testUser.garments.length} garments`)

		if (testUser.avatars.length > 0) {
			console.log(`   👤 Skin tone: ${testUser.avatars[0].skinTone}`)
		}
		console.log()

		// Test 3: Fetch User Wardrobe
		console.log('3. Testing wardrobe fetching...')
		const wardrobeItems = await fashionAI.fetchUserWardrobe(testUser.id)
		console.log(`   ✅ Retrieved ${wardrobeItems.length} wardrobe items`)

		if (wardrobeItems.length > 0) {
			console.log('   📋 Sample items:')
			wardrobeItems.slice(0, 3).forEach((item, index) => {
				console.log(`      ${index + 1}. ${item.name} (${item.category}, ${item.primaryColor})`)
			})
		}
		console.log()

		// Test 4: User Profile Retrieval
		console.log('4. Testing user profile retrieval...')
		const userProfile = await fashionAI.getUserProfile(testUser.id)
		console.log(`   ✅ Profile retrieved`)
		console.log(`   👤 Skin tone: ${userProfile?.skinTone || 'not set'}`)
		console.log(`   🎨 Style preferences: ${userProfile?.stylePreferences?.join(', ') || 'none set'}`)
		console.log()

		// Test 5: Generate Recommendations
		console.log('5. Testing outfit recommendation generation...')

		const recommendationParams = {
			userId: testUser.id,
			occasion: 'casual',
			weather: 'mild',
			skinTone: userProfile?.skinTone || 'neutral',
			maxRecommendations: 3
		}

		console.log(`   📝 Parameters: ${JSON.stringify(recommendationParams, null, 6)}`)

		const result = await fashionAI.getOutfitRecommendations(recommendationParams)

		if (result.success) {
			console.log(`   ✅ Generated ${result.recommendations.length} recommendations`)
			console.log(`   📊 Total wardrobe items analyzed: ${result.totalWardrobeItems}`)
			console.log(`   🎨 Skin tone analysis: ${result.skinToneAnalysis.primaryTone} (${result.skinToneAnalysis.undertone})`)

			// Display recommendations
			result.recommendations.forEach((rec, index) => {
				console.log(`
   🎯 Recommendation ${index + 1}:`)
				console.log(`      Score: ${rec.score.toFixed(3)} (${rec.recommendation})`)
				console.log(`      Items: ${rec.items.map(item => `${item.name} (${item.category})`).join(', ')}`)
				if (rec.breakdown) {
					console.log(`      Analysis: Formality=${rec.breakdown.formality?.toFixed(2)}, Color=${rec.breakdown.colorHarmony?.toFixed(2)}, Style=${rec.breakdown.styleCoherence?.toFixed(2)}`)
				}
			})
		} else {
			console.log(`   ❌ Failed: ${result.error}`)
			if (result.details) {
				console.log(`   Details: ${result.details}`)
			}
		}
		console.log()

		// Test 6: Test with specific item
		if (wardrobeItems.length > 0) {
			console.log('6. Testing recommendations with specific item...')
			const testItem = wardrobeItems[0]
			console.log(`   🎯 Anchor item: ${testItem.name} (${testItem.category})`)

			const specificResult = await fashionAI.getOutfitRecommendations({
				...recommendationParams,
				itemId: testItem.id,
				maxRecommendations: 2
			})

			if (specificResult.success) {
				console.log(`   ✅ Generated ${specificResult.recommendations.length} recommendations including the anchor item`)
				specificResult.recommendations.forEach((rec, index) => {
					const hasAnchorItem = rec.items.some(item => item.id === testItem.id)
					console.log(`   ${index + 1}. Score: ${rec.score.toFixed(3)} | Includes anchor: ${hasAnchorItem ? '✅' : '❌'}`)
				})
			} else {
				console.log(`   ❌ Failed: ${specificResult.error}`)
			}
			console.log()
		}

		// Test 7: Database Integration Summary
		console.log('7. Integration Summary...')
		const summary = {
			databaseConnected: true,
			usersInDatabase: userCount,
			garmentsInDatabase: garmentCount,
			wardrobeFetchWorking: wardrobeItems.length > 0,
			profileFetchWorking: userProfile !== null,
			recommendationGenerationWorking: result.success,
			recommendationsGenerated: result.success ? result.recommendations.length : 0
		}

		console.log('   📊 Integration Status:')
		Object.entries(summary).forEach(([key, value]) => {
			const status = value === true ? '✅' : value === false ? '❌' : value
			console.log(`      ${key}: ${status}`)
		})

		console.log('\n🎉 Integration test completed!')

		// Final validation
		const isFullyIntegrated = summary.databaseConnected &&
			summary.usersInDatabase > 0 &&
			summary.garmentsInDatabase > 0 &&
			summary.wardrobeFetchWorking &&
			summary.profileFetchWorking &&
			summary.recommendationGenerationWorking

		if (isFullyIntegrated) {
			console.log('✅ ALL TESTS PASSED - Recommendation engine is fully integrated with the database!')
			console.log('\n🚀 Task 8.5 requirements met:')
			console.log('   ✅ Database integration: Working')
			console.log('   ✅ Seeded item database: Available')
			console.log('   ✅ End-to-end testing: Successful')
		} else {
			console.log('⚠️  Some integration issues detected. Please review the test results above.')
		}

	} catch (error) {
		console.error('❌ Integration test failed:', error.message)
		if (process.env.NODE_ENV === 'development') {
			console.error('Full error:', error)
		}
	} finally {
		await prisma.$disconnect()
	}
}

// Run the test
testRecommendationIntegration().catch(console.error)
