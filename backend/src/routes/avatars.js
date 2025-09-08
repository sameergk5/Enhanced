import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import express from 'express'
import { body, validationResult } from 'express-validator'
import FormData from 'form-data'
import fs from 'fs/promises'
import multer from 'multer'
import path from 'path'

const router = express.Router()
const prisma = new PrismaClient()

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: async (req, file, cb) => {
		const uploadDir = path.join(process.cwd(), 'uploads/avatars')
		await fs.mkdir(uploadDir, { recursive: true })
		cb(null, uploadDir)
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`)
	}
})

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|webp/
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
		const mimetype = allowedTypes.test(file.mimetype)

		if (mimetype && extname) {
			return cb(null, true)
		} else {
			cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'))
		}
	}
})

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// Get user's avatars
router.get('/', async (req, res) => {
	try {
		const avatars = await prisma.avatar3D.findMany({
			where: { userId: req.user.id },
			orderBy: [
				{ isDefault: 'desc' },
				{ createdAt: 'desc' }
			]
		})

		res.json({ avatars })
	} catch (error) {
		console.error('Get avatars error:', error)
		res.status(500).json({ error: 'Failed to get avatars' })
	}
})

// Create avatar from photo (NEW)
router.post('/from-photo',
	upload.single('photo'),
	[
		body('measurements').optional().isJSON().withMessage('Measurements must be valid JSON'),
		body('preferences').optional().isJSON().withMessage('Preferences must be valid JSON')
	],
	async (req, res) => {
		try {
			// Check for validation errors
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					errors: errors.array()
				})
			}

			// Check if file was uploaded
			if (!req.file) {
				return res.status(400).json({
					success: false,
					message: 'Photo file is required'
				})
			}

			const userId = req.user.id
			const { measurements, preferences } = req.body

			// Prepare form data for AI service
			const form = new FormData()

			form.append('user_id', userId)
			form.append('photo', await fs.readFile(req.file.path), {
				filename: req.file.originalname,
				contentType: req.file.mimetype
			})

			if (measurements) {
				form.append('measurements', measurements)
			}

			if (preferences) {
				form.append('preferences', preferences)
			}

			// Call AI service
			const response = await axios.post(`${AI_SERVICE_URL}/api/avatars/create`, form, {
				headers: {
					...form.getHeaders(),
				},
				timeout: 30000 // 30 second timeout
			})

			// Save avatar to database
			const avatarData = {
				userId: userId,
				name: `Avatar ${new Date().toLocaleDateString()}`,
				description: 'AI-generated avatar from photo',
				modelUrl: response.data.avatar_url,
				previewUrl: response.data.preview_url,
				configData: response.data.config,
				bodyType: response.data.config.build || 'medium',
				skinTone: response.data.config.skin_tone || 'medium',
				hairStyle: response.data.config.hair_style || 'medium',
				hairColor: response.data.config.hair_color || 'brown',
				eyeColor: response.data.config.eye_color || 'brown',
				height: response.data.config.height || 170,
				isDefault: false
			}

			const avatar = await prisma.avatar3D.create({
				data: avatarData
			})

			// Clean up uploaded file
			await fs.unlink(req.file.path)

			res.status(201).json({
				success: true,
				message: 'Avatar created successfully from photo',
				avatar: {
					id: avatar.id,
					name: avatar.name,
					modelUrl: avatar.modelUrl,
					previewUrl: avatar.previewUrl,
					createdAt: avatar.createdAt
				}
			})

		} catch (error) {
			console.error('Avatar creation from photo error:', error)

			// Clean up uploaded file if it exists
			if (req.file) {
				try {
					await fs.unlink(req.file.path)
				} catch (unlinkError) {
					console.error('Failed to delete uploaded file:', unlinkError)
				}
			}

			if (error.response) {
				return res.status(error.response.status).json({
					success: false,
					message: 'AI service error',
					error: error.response.data
				})
			}

			res.status(500).json({
				success: false,
				message: 'Avatar creation failed',
				error: error.message
			})
		}
	}
)

// Create new avatar
router.post('/', [
	body('name').isLength({ min: 1, max: 50 }),
	body('description').optional().isLength({ max: 200 }),
	body('bodyType').isIn(['slim', 'athletic', 'curvy', 'plus']),
	body('skinTone').notEmpty(),
	body('hairStyle').notEmpty(),
	body('hairColor').notEmpty(),
	body('eyeColor').notEmpty()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const {
			name,
			description,
			bodyType,
			skinTone,
			hairStyle,
			hairColor,
			eyeColor,
			isDefault = false
		} = req.body

		// If setting as default, update other avatars
		if (isDefault) {
			await prisma.avatar3D.updateMany({
				where: {
					userId: req.user.id,
					isDefault: true
				},
				data: { isDefault: false }
			})
		}

		// In a real implementation, you'd call Hunyuan3D API here
		// For now, we'll create a placeholder
		const avatar = await prisma.avatar3D.create({
			data: {
				userId: req.user.id,
				name,
				description,
				bodyType,
				skinTone,
				hairStyle,
				hairColor,
				eyeColor,
				isDefault,
				modelUrl: `/avatars/placeholder-${Date.now()}.glb`, // Placeholder
				thumbnailUrl: `/avatars/thumb-${Date.now()}.jpg`
			}
		})

		res.status(201).json({
			message: 'Avatar created successfully',
			avatar
		})
	} catch (error) {
		console.error('Create avatar error:', error)
		res.status(500).json({ error: 'Failed to create avatar' })
	}
})

// Update avatar
router.put('/:id', [
	body('name').optional().isLength({ min: 1, max: 50 }),
	body('description').optional().isLength({ max: 200 })
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { id } = req.params
		const allowedFields = ['name', 'description', 'isDefault', 'isPublic']
		const updates = {}

		Object.keys(req.body).forEach(key => {
			if (allowedFields.includes(key)) {
				updates[key] = req.body[key]
			}
		})

		// If setting as default, update other avatars
		if (updates.isDefault) {
			await prisma.avatar3D.updateMany({
				where: {
					userId: req.user.id,
					isDefault: true,
					id: { not: id }
				},
				data: { isDefault: false }
			})
		}

		const avatar = await prisma.avatar3D.update({
			where: {
				id,
				userId: req.user.id
			},
			data: updates
		})

		res.json({
			message: 'Avatar updated successfully',
			avatar
		})
	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'Avatar not found' })
		}
		console.error('Update avatar error:', error)
		res.status(500).json({ error: 'Failed to update avatar' })
	}
})

// Delete avatar
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params

		await prisma.avatar3D.delete({
			where: {
				id,
				userId: req.user.id
			}
		})

		res.json({ message: 'Avatar deleted successfully' })
	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'Avatar not found' })
		}
		console.error('Delete avatar error:', error)
		res.status(500).json({ error: 'Failed to delete avatar' })
	}
})

// Generate avatar with Hunyuan3D (placeholder for future implementation)
router.post('/generate-hunyuan', [
	body('prompt').isLength({ min: 1, max: 500 }),
	body('style').optional().isIn(['realistic', 'cartoon', 'anime'])
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { prompt, style = 'realistic' } = req.body

		// TODO: Implement Hunyuan3D API integration
		// This would call the Hunyuan3D service to generate a 3D model

		res.json({
			message: 'Avatar generation started',
			jobId: `hunyuan_${Date.now()}`,
			status: 'processing',
			estimatedTime: '2-5 minutes'
		})
	} catch (error) {
		console.error('Generate avatar error:', error)
		res.status(500).json({ error: 'Failed to start avatar generation' })
	}
})

export default router
