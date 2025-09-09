import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import app from '../src/app.js'

const prisma = new PrismaClient()

// NOTE: Assumes a test user already exists or uses x-test-user header bypass pattern.

describe('Community Look Rating API', () => {
	let lookId
	const testUser1 = '00000000-0000-0000-0000-000000000001'
	const testUser2 = '00000000-0000-0000-0000-000000000002'

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
	})

	afterAll(async () => {
		await prisma.lookRating.deleteMany({ where: { look: { userId: testUser1 } } })
		await prisma.communityLook.deleteMany({ where: { userId: testUser1 } })
		await prisma.$disconnect()
	})

	it('should allow user1 to submit a look', async () => {
		const res = await request(app)
			.post('/api/community/looks')
			.set('x-test-user', testUser1)
			.send({ avatarImageUrl: 'http://example.com/img.png', lookData: { items: [] } })
			.expect(201)
		expect(res.body.look).toBeDefined()
		expect(res.body.look.userId).toBeUndefined()
		lookId = res.body.look.id
	})

	it('should allow user2 to fetch a look queue and rate it', async () => {
		const queue = await request(app)
			.get('/api/community/looks/queue')
			.set('x-test-user', testUser2)
			.expect(200)
		expect(queue.body.look.id).toBe(lookId)

		await request(app)
			.post(`/api/community/looks/${lookId}/rate`)
			.set('x-test-user', testUser2)
			.send({ score: 5 })
			.expect(201)
	})

	it('should return 204 when no more looks available', async () => {
		await request(app)
			.get('/api/community/looks/queue')
			.set('x-test-user', testUser2)
			.expect(204)
	})
})
