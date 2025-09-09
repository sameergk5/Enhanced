import { PrismaClient } from '@prisma/client'
import express from 'express'
import { authenticateToken } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = express.Router()

// Submit a look for anonymous rating
router.post('/looks', authenticateToken, async (req, res, next) => {
	try {
		const userId = req.user.id
		const { outfitId, avatarImageUrl, lookData } = req.body

		if (!avatarImageUrl && !lookData) {
			return res.status(400).json({ error: 'avatarImageUrl or lookData required' })
		}

		const look = await prisma.communityLook.create({
			data: {
				userId,
				outfitId: outfitId || null,
				avatarImageUrl: avatarImageUrl || null,
				lookData: lookData || null
			}
		})

		// Do not expose userId back to client for anonymity
		const { userId: _omit, ...anon } = look
		res.status(201).json({ look: anon })
	} catch (err) {
		next(err)
	}
})

// Fetch a random look for rating (excluding the requesting user's own looks & already rated ones)
router.get('/looks/queue', authenticateToken, async (req, res, next) => {
	try {
		const userId = req.user.id

		// Get IDs of looks user already rated
		const rated = await prisma.lookRating.findMany({
			where: { raterUserId: userId },
			select: { lookId: true }
		})
		const ratedIds = rated.map(r => r.lookId)

		const candidate = await prisma.communityLook.findFirst({
			where: {
				status: 'active',
				userId: { not: userId },
				id: { notIn: ratedIds }
			},
			orderBy: { createdAt: 'desc' }
		})

		if (!candidate) return res.status(204).send()

		const { userId: _u, ...anon } = candidate
		res.json({ look: anon })
	} catch (err) {
		next(err)
	}
})

// Rate a look
router.post('/looks/:id/rate', authenticateToken, async (req, res, next) => {
	try {
		const userId = req.user.id
		const { id } = req.params
		const { score } = req.body

		if (typeof score !== 'number' || score < 1 || score > 5) {
			return res.status(400).json({ error: 'score must be 1-5' })
		}

		const look = await prisma.communityLook.findUnique({ where: { id } })
		if (!look || look.status !== 'active') return res.status(404).json({ error: 'Look not found' })
		if (look.userId === userId) return res.status(400).json({ error: 'Cannot rate your own look' })

		// Create rating (unique constraint prevents duplicates)
		const rating = await prisma.lookRating.create({
			data: { lookId: id, raterUserId: userId, score }
		})

		// Update aggregates
		const updated = await prisma.communityLook.update({
			where: { id },
			data: {
				ratingCount: { increment: 1 },
				totalScore: { increment: score },
				// averageScore recalculated: (totalScore + score)/(ratingCount + 1) not directly possible; fetch after
			}
		})

		// Recalculate average using latest totals
		const newAverage = (updated.totalScore) / (updated.ratingCount)
		await prisma.communityLook.update({
			where: { id },
			data: { averageScore: newAverage }
		})

		res.status(201).json({ rating: { id: rating.id, lookId: rating.lookId, score: rating.score } })
	} catch (err) {
		if (err.code === 'P2002') {
			return res.status(409).json({ error: 'Already rated' })
		}
		next(err)
	}
})

export default router
