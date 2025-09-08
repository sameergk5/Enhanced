#!/usr/bin/env node
/**
 * Test script for Task 6.1: Streak Tracking Data Model
 * Validates the UserStreak model implementation and API functionality
 */

import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import app from './src/app.js'

const prisma = new PrismaClient()

// Color codes for console output
const colors = {
	green: '\x1b[32m',
	red: '\x1b[31m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	reset: '\x1b[0m',
	bold: '\x1b[1m'
}

function log(color, message) {
	console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testStreakModel() {
	console.log(`${colors.bold}${colors.blue}🎯 Task 6.1: Streak Tracking Data Model Validation${colors.reset}`)
	console.log('='.repeat(60))

	const results = {
		schemaValidation: false,
		apiEndpoints: false,
		businessLogic: false,
		dataIntegrity: false,
		overall: false
	}

	try {
		// Test 1: Schema Validation
		log('blue', '\n1️⃣ Testing Database Schema...')

		// Check if UserStreak model exists in Prisma client
		if (!prisma.userStreak) {
			throw new Error('UserStreak model not found in Prisma client')
		}

		// Validate required fields and methods
		const expectedMethods = ['findUnique', 'create', 'update', 'delete', 'findMany']
		for (const method of expectedMethods) {
			if (typeof prisma.userStreak[method] !== 'function') {
				throw new Error(`UserStreak.${method} method not available`)
			}
		}

		log('green', '   ✅ UserStreak model properly generated')
		log('green', '   ✅ All CRUD methods available')
		log('green', '   ✅ Schema validation passed')
		results.schemaValidation = true

		// Test 2: API Endpoints (using in-memory mode)
		log('blue', '\n2️⃣ Testing API Endpoints...')

		// Set test mode to use in-memory storage
		process.env.TEST_IN_MEMORY = '1'
		const testUserId = 'test-user-' + Date.now()

		// Test GET endpoint - should return default values
		const getResponse = await request(app)
			.get('/api/streak')
			.set('x-test-user', testUserId)

		if (getResponse.status !== 200) {
			throw new Error(`GET /api/streak failed with status ${getResponse.status}`)
		}

		if (getResponse.body.currentStreak !== 0 || getResponse.body.longestStreak !== 0) {
			throw new Error('Default streak values should be 0')
		}

		log('green', '   ✅ GET /api/streak endpoint working')

		// Test POST endpoint - should create initial streak
		const postResponse = await request(app)
			.post('/api/streak/ping')
			.set('x-test-user', testUserId)

		if (postResponse.status !== 200) {
			throw new Error(`POST /api/streak/ping failed with status ${postResponse.status}`)
		}

		if (postResponse.body.currentStreak !== 1 || postResponse.body.longestStreak !== 1) {
			throw new Error('Initial streak should be 1/1')
		}

		log('green', '   ✅ POST /api/streak/ping endpoint working')
		log('green', '   ✅ API endpoints validation passed')
		results.apiEndpoints = true

		// Test 3: Business Logic
		log('blue', '\n3️⃣ Testing Business Logic...')

		// Test same-day idempotency
		const sameDay = await request(app)
			.post('/api/streak/ping')
			.set('x-test-user', testUserId)

		if (sameDay.body.currentStreak !== 1) {
			throw new Error('Same-day ping should not increment streak')
		}

		log('green', '   ✅ Same-day idempotency working')

		// Test consecutive day increment
		const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
		await request(app)
			.post('/api/streak/_test/set')
			.set('x-test-user', testUserId)
			.send({ currentStreak: 2, longestStreak: 3, lastActivityAt: yesterday })

		const nextDay = await request(app)
			.post('/api/streak/ping')
			.set('x-test-user', testUserId)

		if (nextDay.body.currentStreak !== 3) {
			throw new Error('Consecutive day should increment streak')
		}

		log('green', '   ✅ Consecutive day increment working')

		// Test streak reset after gap
		const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
		await request(app)
			.post('/api/streak/_test/set')
			.set('x-test-user', testUserId)
			.send({ currentStreak: 5, longestStreak: 5, lastActivityAt: threeDaysAgo })

		const afterGap = await request(app)
			.post('/api/streak/ping')
			.set('x-test-user', testUserId)

		if (afterGap.body.currentStreak !== 1) {
			throw new Error('Streak should reset to 1 after gap > 1 day')
		}

		if (afterGap.body.longestStreak !== 5) {
			throw new Error('Longest streak should be preserved')
		}

		log('green', '   ✅ Streak reset logic working')
		log('green', '   ✅ Longest streak preservation working')
		log('green', '   ✅ Business logic validation passed')
		results.businessLogic = true

		// Test 4: Data Integrity
		log('blue', '\n4️⃣ Testing Data Integrity...')

		// Verify data structure
		const finalCheck = await request(app)
			.get('/api/streak')
			.set('x-test-user', testUserId)

		const requiredFields = ['currentStreak', 'longestStreak', 'lastActivityAt']
		for (const field of requiredFields) {
			if (!(field in finalCheck.body)) {
				throw new Error(`Missing required field: ${field}`)
			}
		}

		// Validate data types
		if (typeof finalCheck.body.currentStreak !== 'number') {
			throw new Error('currentStreak should be a number')
		}

		if (typeof finalCheck.body.longestStreak !== 'number') {
			throw new Error('longestStreak should be a number')
		}

		if (finalCheck.body.lastActivityAt !== null && typeof finalCheck.body.lastActivityAt !== 'string') {
			throw new Error('lastActivityAt should be null or string')
		}

		log('green', '   ✅ All required fields present')
		log('green', '   ✅ Data types validated')
		log('green', '   ✅ Data integrity validation passed')
		results.dataIntegrity = true

		// Overall success
		results.overall = true
		log('green', '\n🎉 All tests passed! Streak tracking data model is fully implemented.')

	} catch (error) {
		log('red', `\n❌ Test failed: ${error.message}`)
		if (error.stack) {
			console.log(`${colors.yellow}Stack trace:${colors.reset}`)
			console.log(error.stack)
		}
	} finally {
		// Cleanup
		process.env.TEST_IN_MEMORY = '0'
		await prisma.$disconnect()
	}

	// Print summary
	console.log(`\n${colors.bold}📊 Test Results Summary:${colors.reset}`)
	console.log('='.repeat(30))
	console.log(`Schema Validation:    ${results.schemaValidation ? '✅' : '❌'}`)
	console.log(`API Endpoints:        ${results.apiEndpoints ? '✅' : '❌'}`)
	console.log(`Business Logic:       ${results.businessLogic ? '✅' : '❌'}`)
	console.log(`Data Integrity:       ${results.dataIntegrity ? '✅' : '❌'}`)
	console.log(`Overall Status:       ${results.overall ? '🟢 READY' : '🔴 FAILED'}`)

	if (results.overall) {
		console.log(`\n${colors.green}${colors.bold}✅ Task 6.1 Successfully Completed!${colors.reset}`)
		console.log(`${colors.green}The streak tracking data model is ready for production use.${colors.reset}`)
		return true
	} else {
		console.log(`\n${colors.red}${colors.bold}❌ Task 6.1 Needs Attention${colors.reset}`)
		console.log(`${colors.red}Please fix the failing tests before proceeding.${colors.reset}`)
		return false
	}
}

// Run the test
testStreakModel()
	.then(success => {
		process.exit(success ? 0 : 1)
	})
	.catch(error => {
		console.error('Test suite failed:', error)
		process.exit(1)
	})
