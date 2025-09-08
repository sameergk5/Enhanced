import { PrismaClient } from '@prisma/client'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()
const prisma = new PrismaClient()

// Get user profile
router.get('/profile', async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			include: {
				profile: true,
				styleProfile: true,
				avatars: true,
				_count: {
					select: {
						garments: true,
						outfits: true,
						posts: true,
						followers: true,
						following: true
					}
				}
			}
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		res.json({
			user: {
				...user,
				stats: user._count
			}
		})
	} catch (error) {
		console.error('Get profile error:', error)
		res.status(500).json({ error: 'Failed to get user profile' })
	}
})

// Update user profile
router.put('/profile', [
	body('displayName').optional().isLength({ min: 1, max: 50 }),
	body('bio').optional().isLength({ max: 500 }),
	body('website').optional().isURL(),
	body('location').optional().isLength({ max: 100 })
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const allowedFields = ['displayName', 'bio', 'avatar', 'isPrivate']
		const updates = {}

		Object.keys(req.body).forEach(key => {
			if (allowedFields.includes(key)) {
				updates[key] = req.body[key]
			}
		})

		const user = await prisma.user.update({
			where: { id: req.user.id },
			data: updates,
			include: {
				profile: true,
				styleProfile: true
			}
		})

		res.json({
			message: 'Profile updated successfully',
			user
		})
	} catch (error) {
		console.error('Update profile error:', error)
		res.status(500).json({ error: 'Failed to update profile' })
	}
})

// Update user measurements
router.put('/profile/measurements', [
	body('height').optional().isFloat({ min: 100, max: 250 }),
	body('weight').optional().isFloat({ min: 30, max: 300 }),
	body('chestBust').optional().isFloat({ min: 50, max: 200 }),
	body('waist').optional().isFloat({ min: 40, max: 200 }),
	body('hips').optional().isFloat({ min: 50, max: 200 })
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const allowedFields = ['height', 'weight', 'chestBust', 'waist', 'hips', 'shoulderWidth']
		const updates = {}

		Object.keys(req.body).forEach(key => {
			if (allowedFields.includes(key)) {
				updates[key] = req.body[key]
			}
		})

		const profile = await prisma.userProfile.upsert({
			where: { userId: req.user.id },
			update: updates,
			create: {
				userId: req.user.id,
				...updates
			}
		})

		res.json({
			message: 'Measurements updated successfully',
			profile
		})
	} catch (error) {
		console.error('Update measurements error:', error)
		res.status(500).json({ error: 'Failed to update measurements' })
	}
})

// Get user's wardrobe stats
router.get('/wardrobe-stats', async (req, res) => {
	try {
		const stats = await prisma.user.findUnique({
			where: { id: req.user.id },
			select: {
				_count: {
					select: {
						garments: true,
						outfits: true
					}
				},
				garments: {
					select: {
						category: true,
						wearCount: true
					}
				}
			}
		})

		// Calculate category breakdown
		const categoryStats = {}
		stats.garments.forEach(garment => {
			categoryStats[garment.category] = (categoryStats[garment.category] || 0) + 1
		})

		// Calculate wear frequency
		const totalWears = stats.garments.reduce((sum, g) => sum + g.wearCount, 0)
		const avgWearCount = totalWears / (stats.garments.length || 1)

		res.json({
			totalGarments: stats._count.garments,
			totalOutfits: stats._count.outfits,
			categoryBreakdown: categoryStats,
			wearStats: {
				totalWears,
				avgWearCount: Math.round(avgWearCount * 10) / 10
			}
		})
	} catch (error) {
		console.error('Get wardrobe stats error:', error)
		res.status(500).json({ error: 'Failed to get wardrobe stats' })
	}
})

export default router
