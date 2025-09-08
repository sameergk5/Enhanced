import { PrismaClient } from '@prisma/client'
import express from 'express'

const router = express.Router()
const prisma = new PrismaClient()
const memoryStore = new Map() // userId -> record (test mode)

// Helper: determine if two timestamps are on same UTC day
function isSameUTCDate(a, b) {
	return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate()
}

// Test helper: allow x-test-user header to inject a fake req.user for automated tests
router.use((req, _res, next) => {
	if (!req.user && req.headers['x-test-user']) {
		req.user = { id: req.headers['x-test-user'] }
	}
	next()
})

// GET current streak info
router.get('/', async (req, res) => {
	try {
		const useMemory = process.env.TEST_IN_MEMORY === '1' || !prisma.userStreak || typeof prisma.userStreak.findUnique !== 'function'
		let streak
		if (useMemory) {
			streak = memoryStore.get(req.user.id)
		} else {
			streak = await prisma.userStreak.findUnique({ where: { userId: req.user.id } })
		}
		res.json({
			currentStreak: streak?.currentStreak || 0,
			longestStreak: streak?.longestStreak || 0,
			lastActivityAt: streak?.lastActivityAt || null
		})
	} catch (e) {
		console.error('Streak GET error', e)
		res.status(500).json({ error: 'Failed to fetch streak' })
	}
})

// POST record activity (increments streak respecting break conditions)
router.post('/ping', async (req, res) => {
	try {
		const useMemory = process.env.TEST_IN_MEMORY === '1' || !prisma.userStreak || typeof prisma.userStreak.findUnique !== 'function'
		const now = new Date()
		let existing
		if (useMemory) {
			existing = memoryStore.get(req.user.id)
		} else {
			existing = await prisma.userStreak.findUnique({ where: { userId: req.user.id } })
		}

		if (!existing) {
			const record = { userId: req.user.id, currentStreak: 1, longestStreak: 1, lastActivityAt: now }
			if (useMemory) {
				memoryStore.set(req.user.id, record)
				return res.json(record)
			} else {
				const created = await prisma.userStreak.create({ data: { ...record } })
				return res.json({ currentStreak: created.currentStreak, longestStreak: created.longestStreak, lastActivityAt: created.lastActivityAt })
			}
		}

		const last = existing.lastActivityAt
		let current = existing.currentStreak
		let longest = existing.longestStreak

		if (!last) {
			current = 1
		} else {
			const diffMs = now.getTime() - last.getTime()
			const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
			if (isSameUTCDate(now, last)) {
				// same day, do nothing
			} else if (diffDays === 1 || (!isSameUTCDate(now, last) && diffMs < 48 * 60 * 60 * 1000)) {
				current += 1
			} else if (diffDays > 1) {
				current = 1
			}
		}
		if (current > longest) longest = current

		if (useMemory) {
			const updated = { userId: req.user.id, currentStreak: current, longestStreak: longest, lastActivityAt: now }
			memoryStore.set(req.user.id, updated)
			return res.json(updated)
		} else {
			const updated = await prisma.userStreak.update({ where: { userId: req.user.id }, data: { currentStreak: current, longestStreak: longest, lastActivityAt: now } })
			return res.json({ currentStreak: updated.currentStreak, longestStreak: updated.longestStreak, lastActivityAt: updated.lastActivityAt })
		}
	} catch (e) {
		console.error('Streak POST error', e)
		res.status(500).json({ error: 'Failed to update streak' })
	}
})

// Test-only endpoint to set streak state when using memory mode
router.post('/_test/set', (req, res) => {
	const useMemory = process.env.TEST_IN_MEMORY === '1' || !prisma.userStreak || typeof prisma.userStreak.findUnique !== 'function'
	if (!useMemory) return res.status(400).json({ error: 'Test mode only' })
	const { currentStreak = 0, longestStreak = 0, lastActivityAt = null } = req.body || {}
	const rec = { userId: req.user.id, currentStreak, longestStreak, lastActivityAt: lastActivityAt ? new Date(lastActivityAt) : null }
	memoryStore.set(req.user.id, rec)
	res.json(rec)
})

export default router
