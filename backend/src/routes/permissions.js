import { PrismaClient } from '@prisma/client'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()
const prisma = new PrismaClient()

// Get current user's wardrobe permissions
router.get('/', async (req, res) => {
	try {
		const perms = await prisma.wardrobePermission.findUnique({
			where: { userId: req.user.id }
		})

		// Provide sensible defaults if not yet created
		if (!perms) {
			return res.json({
				permissions: {
					shareWardrobePublic: false,
					allowOutfitSharing: true,
					allowAvatarDownloads: false,
					allowLookRating: true,
					allowAnonymousViews: false,
					advancedRules: null
				},
				initialized: false
			})
		}

		res.json({ permissions: perms, initialized: true })
	} catch (error) {
		console.error('Get permissions error:', error)
		res.status(500).json({ error: 'Failed to fetch permissions' })
	}
})

// Upsert permissions
router.put('/', [
	body('shareWardrobePublic').optional().isBoolean(),
	body('allowOutfitSharing').optional().isBoolean(),
	body('allowAvatarDownloads').optional().isBoolean(),
	body('allowLookRating').optional().isBoolean(),
	body('allowAnonymousViews').optional().isBoolean(),
	body('advancedRules').optional().isObject()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const allowed = [
			'shareWardrobePublic',
			'allowOutfitSharing',
			'allowAvatarDownloads',
			'allowLookRating',
			'allowAnonymousViews',
			'advancedRules'
		]

		const data = {}
		Object.keys(req.body).forEach(k => {
			if (allowed.includes(k)) data[k] = req.body[k]
		})

		const permissions = await prisma.wardrobePermission.upsert({
			where: { userId: req.user.id },
			update: data,
			create: { userId: req.user.id, ...data }
		})

		res.json({ message: 'Permissions updated', permissions })
	} catch (error) {
		console.error('Update permissions error:', error)
		res.status(500).json({ error: 'Failed to update permissions' })
	}
})

export default router
