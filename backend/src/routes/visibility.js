import { PrismaClient } from '@prisma/client'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()
const prisma = new PrismaClient()

// GET current user's wardrobe visibility
router.get('/', async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.id },
			select: { wardrobeVisibility: true }
		})
		if (!user) return res.status(404).json({ error: 'User not found' })
		res.json({ visibility: user.wardrobeVisibility })
	} catch (e) {
		console.error('Get visibility error', e)
		res.status(500).json({ error: 'Failed to fetch wardrobe visibility' })
	}
})

// PUT update wardrobe visibility
router.put('/', [
	body('visibility').isIn(['private', 'friends', 'public']).withMessage('Invalid visibility value')
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

		const { visibility } = req.body
		const user = await prisma.user.update({
			where: { id: req.user.id },
			data: { wardrobeVisibility: visibility }
		})
		res.json({ message: 'Visibility updated', visibility: user.wardrobeVisibility })
	} catch (e) {
		console.error('Update visibility error', e)
		res.status(500).json({ error: 'Failed to update wardrobe visibility' })
	}
})

export default router
