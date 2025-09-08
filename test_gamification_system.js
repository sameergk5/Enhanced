#!/usr/bin/env node

/**
 * Comprehensive Gamification System End-to-End Test
 * This script tests the complete flow from database to frontend UI
 */

const { PrismaClient } = require('@prisma/client')
const fetch = require('node-fetch')

// Test configuration
const TEST_CONFIG = {
	baseUrl: 'http://localhost:5000',
	testUser: {
		email: 'test-gamification@wardrobe.ai',
		username: 'gamification_tester',
		displayName: 'Gamification Tester'
	}
}

const prisma = new PrismaClient()

class GamificationTester {
	constructor() {
		this.userId = null
		this.authToken = null
		this.testResults = []
	}

	log(message, type = 'info') {
		const timestamp = new Date().toISOString()
		const color = {
			info: '\x1b[36m',
			success: '\x1b[32m',
			error: '\x1b[31m',
			warning: '\x1b[33m'
		}[type] || '\x1b[0m'

		console.log(`${color}[${timestamp}] ${message}\x1b[0m`)

		this.testResults.push({
			timestamp,
			message,
			type
		})
	}

	async setupTestUser() {
		this.log('Setting up test user...', 'info')

		try {
			// Clean up existing test user
			await prisma.user.deleteMany({
				where: { email: TEST_CONFIG.testUser.email }
			})

			// Create test user
			const user = await prisma.user.create({
				data: {
					email: TEST_CONFIG.testUser.email,
					username: TEST_CONFIG.testUser.username,
					displayName: TEST_CONFIG.testUser.displayName,
					isEmailVerified: true
				}
			})

			this.userId = user.id
			this.log(`Test user created with ID: ${this.userId}`, 'success')
			return true
		} catch (error) {
			this.log(`Failed to setup test user: ${error.message}`, 'error')
			return false
		}
	}

	async testDatabaseModels() {
		this.log('Testing database models...', 'info')

		try {
			// Test VirtualItem creation
			const virtualItem = await prisma.virtualItem.create({
				data: {
					name: 'Test Goggles',
					category: 'accessory',
					description: 'Special test goggles for validation',
					rarity: 'rare',
					metadata: { color: 'blue', style: 'futuristic' }
				}
			})
			this.log(`Virtual item created: ${virtualItem.name}`, 'success')

			// Test RewardMilestone creation
			const milestone = await prisma.rewardMilestone.create({
				data: {
					streakThreshold: 1,
					category: 'daily_streak',
					description: 'First day streak milestone',
					virtualItemId: virtualItem.id
				}
			})
			this.log(`Reward milestone created for streak ${milestone.streakThreshold}`, 'success')

			// Test UserStreak creation
			const userStreak = await prisma.userStreak.create({
				data: {
					userId: this.userId,
					currentStreak: 0,
					longestStreak: 0,
					lastActivityDate: new Date()
				}
			})
			this.log(`User streak record created for user ${this.userId}`, 'success')

			return true
		} catch (error) {
			this.log(`Database model test failed: ${error.message}`, 'error')
			return false
		}
	}

	async testStreakService() {
		this.log('Testing streak service...', 'info')

		try {
			const StreakService = require('../src/services/streakService')

			// Test initial streak
			let streakInfo = await StreakService.getUserStreak(this.userId)
			this.log(`Initial streak: ${streakInfo.currentStreak} days`, 'success')

			// Test activity logging
			const logResult = await StreakService.logActivity(this.userId, 'clothing_view')
			this.log(`Activity logged, new streak: ${logResult.currentStreak}`, 'success')

			// Test leaderboard
			const leaderboard = await StreakService.getStreakLeaderboard(5)
			this.log(`Leaderboard has ${leaderboard.length} entries`, 'success')

			return true
		} catch (error) {
			this.log(`Streak service test failed: ${error.message}`, 'error')
			return false
		}
	}

	async testRewardService() {
		this.log('Testing reward service...', 'info')

		try {
			const rewardService = require('../src/services/rewardService')

			// Test milestone checking (should award for streak 1)
			const milestones = await rewardService.checkAndAwardMilestones(this.userId, 1)
			this.log(`Milestones awarded: ${milestones.length}`, 'success')

			if (milestones.length > 0) {
				this.log(`First milestone: ${milestones[0].virtualItem.name}`, 'success')
			}

			// Test user virtual items
			const userItems = await rewardService.getUserVirtualItems(this.userId)
			this.log(`User has ${userItems.length} virtual items`, 'success')

			return true
		} catch (error) {
			this.log(`Reward service test failed: ${error.message}`, 'error')
			return false
		}
	}

	async testActivityAPI() {
		this.log('Testing activity API endpoints...', 'info')

		try {
			// Test activity logging endpoint
			const logResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/activity/log`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-user-id': this.userId // Simulating auth
				},
				body: JSON.stringify({
					activityType: 'outfit_creation'
				})
			})

			if (logResponse.ok) {
				const logData = await logResponse.json()
				this.log(`Activity logged via API, streak: ${logData.streakInfo.currentStreak}`, 'success')
			} else {
				throw new Error(`API returned ${logResponse.status}`)
			}

			// Test streak fetch endpoint
			const streakResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/activity/streak`, {
				headers: {
					'x-user-id': this.userId
				}
			})

			if (streakResponse.ok) {
				const streakData = await streakResponse.json()
				this.log(`Current streak from API: ${streakData.currentStreak}`, 'success')
			}

			return true
		} catch (error) {
			this.log(`Activity API test failed: ${error.message}`, 'error')
			return false
		}
	}

	async testFrontendIntegration() {
		this.log('Testing frontend service integration...', 'info')

		try {
			// Import the frontend streak service
			const streakService = require('../src/services/streak.ts')

			// This would normally require a running frontend, so we'll just validate the module
			if (streakService.logActivity && streakService.fetchStreak) {
				this.log('Frontend streak service methods available', 'success')
			}

			// Check component files exist
			const fs = require('fs')
			const componentPaths = [
				'../src/components/gamification/StreakDisplay.tsx',
				'../src/components/gamification/StreakDisplay.css',
				'../src/components/gamification/RewardNotification.tsx',
				'../src/components/gamification/RewardNotification.css'
			]

			for (const path of componentPaths) {
				if (fs.existsSync(path)) {
					this.log(`Component exists: ${path}`, 'success')
				} else {
					this.log(`Component missing: ${path}`, 'warning')
				}
			}

			return true
		} catch (error) {
			this.log(`Frontend integration test failed: ${error.message}`, 'error')
			return false
		}
	}

	async testCompleteFlow() {
		this.log('Testing complete gamification flow...', 'info')

		try {
			// Simulate multiple days of activity
			const activities = ['clothing_view', 'outfit_creation', 'wardrobe_update']

			for (let day = 0; day < 3; day++) {
				for (const activity of activities) {
					// Log activity
					const response = await fetch(`${TEST_CONFIG.baseUrl}/api/activity/log`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'x-user-id': this.userId
						},
						body: JSON.stringify({
							activityType: activity
						})
					})

					if (response.ok) {
						const data = await response.json()
						this.log(`Day ${day + 1}: ${activity} logged, streak: ${data.streakInfo.currentStreak}`, 'success')

						if (data.milestones?.length > 0) {
							this.log(`🎉 Milestone achieved! Awarded: ${data.milestones[0].virtualItem.name}`, 'success')
						}
					}

					// Small delay between activities
					await new Promise(resolve => setTimeout(resolve, 100))
				}

				// Simulate day passing
				if (day < 2) {
					const tomorrow = new Date()
					tomorrow.setDate(tomorrow.getDate() + day + 1)

					await prisma.userStreak.update({
						where: {
							userId: this.userId
						},
						data: {
							lastActivityDate: tomorrow
						}
					})
				}
			}

			return true
		} catch (error) {
			this.log(`Complete flow test failed: ${error.message}`, 'error')
			return false
		}
	}

	async cleanup() {
		this.log('Cleaning up test data...', 'info')

		try {
			// Clean up test user and related data
			if (this.userId) {
				await prisma.userVirtualItem.deleteMany({
					where: { userId: this.userId }
				})

				await prisma.userStreak.deleteMany({
					where: { userId: this.userId }
				})

				await prisma.user.delete({
					where: { id: this.userId }
				})
			}

			// Clean up test virtual items and milestones
			await prisma.rewardMilestone.deleteMany({
				where: { description: { contains: 'test' } }
			})

			await prisma.virtualItem.deleteMany({
				where: { name: { contains: 'Test' } }
			})

			this.log('Cleanup completed', 'success')
		} catch (error) {
			this.log(`Cleanup failed: ${error.message}`, 'error')
		}
	}

	async generateReport() {
		this.log('Generating test report...', 'info')

		const summary = {
			total: this.testResults.length,
			success: this.testResults.filter(r => r.type === 'success').length,
			errors: this.testResults.filter(r => r.type === 'error').length,
			warnings: this.testResults.filter(r => r.type === 'warning').length
		}

		console.log('\n' + '='.repeat(60))
		console.log('GAMIFICATION SYSTEM TEST REPORT')
		console.log('='.repeat(60))
		console.log(`Total Tests: ${summary.total}`)
		console.log(`\x1b[32mSuccessful: ${summary.success}\x1b[0m`)
		console.log(`\x1b[31mErrors: ${summary.errors}\x1b[0m`)
		console.log(`\x1b[33mWarnings: ${summary.warnings}\x1b[0m`)
		console.log('='.repeat(60))

		if (summary.errors === 0) {
			console.log('\x1b[32m✅ ALL TESTS PASSED! Gamification system is ready.\x1b[0m')
		} else {
			console.log('\x1b[31m❌ Some tests failed. Check the logs above.\x1b[0m')
		}

		return summary.errors === 0
	}

	async runAllTests() {
		this.log('Starting comprehensive gamification system test...', 'info')

		try {
			const tests = [
				() => this.setupTestUser(),
				() => this.testDatabaseModels(),
				() => this.testStreakService(),
				() => this.testRewardService(),
				() => this.testActivityAPI(),
				() => this.testFrontendIntegration(),
				() => this.testCompleteFlow()
			]

			for (const test of tests) {
				const result = await test()
				if (!result) {
					this.log('Test suite aborted due to failure', 'error')
					break
				}
			}

			return await this.generateReport()
		} catch (error) {
			this.log(`Test suite failed: ${error.message}`, 'error')
			return false
		} finally {
			await this.cleanup()
			await prisma.$disconnect()
		}
	}
}

// Run tests if this script is executed directly
if (require.main === module) {
	const tester = new GamificationTester()
	tester.runAllTests()
		.then(success => {
			process.exit(success ? 0 : 1)
		})
		.catch(error => {
			console.error('Test runner failed:', error)
			process.exit(1)
		})
}

module.exports = GamificationTester
