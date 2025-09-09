import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import app from '../src/app.js'

const prisma = new PrismaClient()

// Helper to create a JWT for a given user id
function makeToken(userId) {
	return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' })
}

describe('Community Look Rating API', () => {
	let lookId
	const testUser1 = '00000000-0000-0000-0000-000000000001'
	const testUser2 = '00000000-0000-0000-0000-000000000002'
	let token1, token2

	beforeAll(async () => {
		// Ensure placeholder users exist
		await prisma.user.upsert({
			where: { id: testUser1 },
			update: {},
			create: { id: testUser1, email: 'u1@example.com', username: 'u1', displayName: 'User1' }
		})
		await prisma.user.upsert({
			where: { id: testUser2 },
			update: {},
			create: { id: testUser2, email: 'u2@example.com', username: 'u2', displayName: 'User2' }
		})
		token1 = makeToken(testUser1)
		token2 = makeToken(testUser2)
	})

	afterAll(async () => {
		await prisma.lookRating.deleteMany({ where: { look: { userId: testUser1 } } })
		await prisma.communityLook.deleteMany({ where: { userId: testUser1 } })
		await prisma.$disconnect()
	})

	it('should allow user1 to submit a look', async () => {
		const res = await request(app)
			.post('/api/community/looks')
			.set('Authorization', `Bearer ${token1}`)
			.send({ avatarImageUrl: 'http://example.com/img.png', lookData: { items: [] } })
			.expect(201)
		expect(res.body.look).toBeDefined()
		// userId omitted for anonymity
		expect(res.body.look.userId).toBeUndefined()
		lookId = res.body.look.id
	})

	it('should allow user2 to fetch a look queue and rate it', async () => {
		const queue = await request(app)
			.get('/api/community/looks/queue')
			.set('Authorization', `Bearer ${token2}`)
			.expect(200)
		expect(queue.body.look.id).toBe(lookId)

		await request(app)
			.post(`/api/community/looks/${lookId}/rate`)
			.set('Authorization', `Bearer ${token2}`)
			.send({ score: 5 })
			.expect(201)
	})

	it('should return 204 when no more looks available', async () => {
		await request(app)
			.get('/api/community/looks/queue')
			.set('Authorization', `Bearer ${token2}`)
			.expect(204)
	})
})
