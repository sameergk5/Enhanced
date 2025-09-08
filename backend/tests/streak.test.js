import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import app from '../src/app.js'

const prisma = new PrismaClient()

// In-memory fallback if Prisma client not generated with UserStreak (e.g. DB/migration unavailable in test env)
if (!('userStreak' in prisma)) {
	const store = new Map()
	// @ts-ignore augment at runtime
	prisma.userStreak = {
		async deleteMany({ where }) {
			for (const [k, v] of store.entries()) {
				if (!where || !where.userId || v.userId === where.userId) store.delete(k)
			}
			return { count: store.size }
		},
		async findUnique({ where }) {
			for (const v of store.values()) {
				if (v.userId === where.userId) return { ...v }
			}
			return null
		},
		async create({ data }) {
			const rec = { id: data.id || data.userId, ...data }
			store.set(rec.userId, rec)
			return { ...rec }
		},
		async update({ where, data }) {
			const existing = await this.findUnique({ where })
			if (!existing) throw new Error('Not found')
			const updated = { ...existing, ...data }
			store.set(updated.userId, updated)
			return { ...updated }
		}
	}
}

// Mock auth middleware assumption: if project uses real auth, replace with a test utility.
// For now we assume req.user is injected; we'll monkey patch for tests.

describe('Streak API', () => {
	const testUserId = 'test-user-streak'

	beforeAll(async () => {
		process.env.TEST_IN_MEMORY = '1'
	})

	afterAll(async () => {
		await prisma.$disconnect()
	})

	it('returns default streak when none exists', async () => {
		const res = await request(app).get('/api/streak').set('x-test-user', testUserId)
		expect(res.status).toBe(200)
		expect(res.body.currentStreak).toBe(0)
	})

	it('increments streak on first ping', async () => {
		const res = await request(app).post('/api/streak/ping').set('x-test-user', testUserId)
		expect(res.status).toBe(200)
		expect(res.body.currentStreak).toBe(1)
		expect(res.body.longestStreak).toBe(1)
	})

	it('is idempotent for additional pings same day', async () => {
		const res1 = await request(app).post('/api/streak/ping').set('x-test-user', testUserId)
		const res2 = await request(app).post('/api/streak/ping').set('x-test-user', testUserId)
		expect(res2.status).toBe(200)
		expect(res2.body.currentStreak).toBe(res1.body.currentStreak)
	})

	it('resets after gap > 1 day', async () => {
		// Manually set lastActivityAt to 3 days ago
		const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
		await request(app).post('/api/streak/_test/set').set('x-test-user', testUserId).send({ currentStreak: 5, longestStreak: 5, lastActivityAt: threeDaysAgo })
		const res = await request(app).post('/api/streak/ping').set('x-test-user', testUserId)
		expect(res.status).toBe(200)
		expect(res.body.currentStreak).toBe(1)
		expect(res.body.longestStreak).toBe(5) // longest retained
	})

	it('increments when last activity was yesterday (normal 24h boundary)', async () => {
		const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
		await request(app).post('/api/streak/_test/set').set('x-test-user', testUserId).send({ currentStreak: 2, longestStreak: 5, lastActivityAt: yesterday })
		const res = await request(app).post('/api/streak/ping').set('x-test-user', testUserId)
		expect(res.status).toBe(200)
		expect(res.body.currentStreak).toBe(3)
		expect(res.body.longestStreak).toBe(5)
	})
})
