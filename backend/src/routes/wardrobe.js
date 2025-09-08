import { PrismaClient } from '@prisma/client'
import express from 'express'
import { body, validationResult } from 'express-validator'
import {
	cleanupFile,
	generateThumbnail,
	getPublicUrl,
	processImage,
	upload
} from '../config/storage.js'
import { processGarmentAI } from '../services/garmentAI.js'

const router = express.Router()
const prisma = new PrismaClient()

// Upload garment images and create garment entry
router.post('/items', upload.single('image'), [
	body('name').optional().isLength({ min: 1, max: 100 }),
	body('category').optional().isIn(['top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear']),
	body('primaryColor').optional().notEmpty(),
	body('colors').optional().isArray(),
	body('brand').optional().isLength({ max: 50 }),
	body('description').optional().isLength({ max: 500 }),
	body('tags').optional().isArray()
], async (req, res) => {
	let processedImagePath = null
	let thumbnailPath = null

	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({
				error: 'Validation failed',
				details: errors.array()
			})
		}

		// Check if file was uploaded
		if (!req.file) {
			return res.status(400).json({
				error: 'No image file provided',
				details: 'Please upload an image file (JPEG, PNG, or WebP)'
			})
		}

		console.log(`Processing image upload for user ${req.user.id}:`, req.file.filename)

		// Process the uploaded image
		try {
			processedImagePath = await processImage(req.file.path, {
				maxWidth: 1024,
				maxHeight: 1024,
				quality: 85,
				format: 'webp'
			})
		} catch (processError) {
			console.error('Image processing failed:', processError)
			cleanupFile(req.file.path)
			return res.status(500).json({
				error: 'Failed to process image',
				details: 'Image could not be optimized'
			})
		}

		// Generate thumbnail
		try {
			thumbnailPath = await generateThumbnail(processedImagePath, 200)
		} catch (thumbError) {
			console.error('Thumbnail generation failed:', thumbError)
			// Continue without thumbnail - not critical
		}

		// TODO: AI background removal (Task 3.3 integration point)
		// const cleanImagePath = await removeBackground(processedImagePath)

		// Get public URLs
		const imageUrl = getPublicUrl(processedImagePath)
		const thumbnailUrl = thumbnailPath ? getPublicUrl(thumbnailPath) : imageUrl

		// Extract metadata from request body or set defaults
		const {
			name = `New Item ${new Date().toLocaleDateString()}`,
			category = 'top',
			primaryColor = 'unknown',
			colors = [primaryColor],
			brand = '',
			description = '',
			tags = []
		} = req.body

		// Parse arrays if they came as strings
		const parsedColors = Array.isArray(colors) ? colors :
			(typeof colors === 'string' ? colors.split(',').map(c => c.trim()) : [primaryColor])
		const parsedTags = Array.isArray(tags) ? tags :
			(typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [])

		// Create garment record in database
		const garment = await prisma.garment.create({
			data: {
				userId: req.user.id,
				name,
				description,
				category,
				brand,
				images: [imageUrl],
				color: primaryColor,
				tags: [...parsedTags, category], // Add category as a tag
				// Metadata will be updated by AI service (Task 3.3)
				createdAt: new Date(),
				updatedAt: new Date()
			}
		})

		// Log successful upload
		console.log(`Garment created successfully: ${garment.id} for user ${req.user.id}`)

		// Process AI metadata extraction in background (Task 3.3)
		processGarmentAI(garment.id, processedImagePath, imageUrl)
			.then(result => {
				if (result.success) {
					console.log(`AI analysis completed for garment ${garment.id}`)
				} else {
					console.warn(`AI analysis failed for garment ${garment.id}:`, result.error)
				}
			})
			.catch(error => {
				console.error(`AI analysis error for garment ${garment.id}:`, error)
			})

		// Respond with success
		res.status(201).json({
			success: true,
			message: 'Garment uploaded successfully',
			garment: {
				id: garment.id,
				name: garment.name,
				category: garment.category,
				imageUrl,
				thumbnailUrl,
				primaryColor,
				colors: parsedColors,
				tags: parsedTags,
				createdAt: garment.createdAt
			},
			// Include processing status for frontend
			processing: {
				imageProcessed: true,
				thumbnailGenerated: !!thumbnailPath,
				aiAnalysisPending: true // Will be processed by Task 3.3
			}
		})

	} catch (error) {
		console.error('Garment upload error:', error)

		// Cleanup uploaded files on error
		if (req.file?.path) cleanupFile(req.file.path)
		if (processedImagePath) cleanupFile(processedImagePath)
		if (thumbnailPath) cleanupFile(thumbnailPath)

		res.status(500).json({
			error: 'Failed to upload garment',
			details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
		})
	}
})

// Get individual garment by ID
router.get('/items/:id', async (req, res) => {
	try {
		const { id } = req.params

		const garment = await prisma.garment.findFirst({
			where: {
				id,
				userId: req.user.id
			},
			include: {
				_count: {
					select: { outfitItems: true }
				}
			}
		})

		if (!garment) {
			return res.status(404).json({ error: 'Garment not found' })
		}

		res.json({ garment })
	} catch (error) {
		console.error('Get garment error:', error)
		res.status(500).json({ error: 'Failed to get garment' })
	}
})

// Update garment metadata
router.patch('/items/:id', [
	body('name').optional().isLength({ min: 1, max: 100 }),
	body('category').optional().isIn(['top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear']),
	body('primaryColor').optional().notEmpty(),
	body('colors').optional().isArray(),
	body('brand').optional().isLength({ max: 50 }),
	body('description').optional().isLength({ max: 500 }),
	body('tags').optional().isArray()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { id } = req.params
		const updateData = { ...req.body, updatedAt: new Date() }

		// Parse arrays if they came as strings
		if (updateData.colors && typeof updateData.colors === 'string') {
			updateData.colors = updateData.colors.split(',').map(c => c.trim())
		}
		if (updateData.tags && typeof updateData.tags === 'string') {
			updateData.tags = updateData.tags.split(',').map(t => t.trim())
		}

		const garment = await prisma.garment.update({
			where: {
				id,
				userId: req.user.id
			},
			data: updateData
		})

		res.json({
			message: 'Garment updated successfully',
			garment
		})
	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'Garment not found' })
		}
		console.error('Update garment error:', error)
		res.status(500).json({ error: 'Failed to update garment' })
	}
})

// Delete garment
router.delete('/items/:id', async (req, res) => {
	try {
		const { id } = req.params

		// Get garment to access image paths for cleanup
		const garment = await prisma.garment.findFirst({
			where: {
				id,
				userId: req.user.id
			}
		})

		if (!garment) {
			return res.status(404).json({ error: 'Garment not found' })
		}

		// Delete from database
		await prisma.garment.delete({
			where: {
				id,
				userId: req.user.id
			}
		})

		// TODO: Cleanup image files from storage
		// This should be done asynchronously to avoid blocking the response

		res.json({ message: 'Garment deleted successfully' })
	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'Garment not found' })
		}
		console.error('Delete garment error:', error)
		res.status(500).json({ error: 'Failed to delete garment' })
	}
})

// Get user's garments
router.get('/garments', async (req, res) => {
	try {
		const { category, search, page = 1, limit = 20 } = req.query
		const skip = (page - 1) * limit

		const where = {
			userId: req.user.id,
			...(category && { category }),
			...(search && {
				OR: [
					{ name: { contains: search, mode: 'insensitive' } },
					{ brand: { contains: search, mode: 'insensitive' } },
					{ tags: { has: search } }
				]
			})
		}

		const [garments, total] = await Promise.all([
			prisma.garment.findMany({
				where,
				skip: parseInt(skip),
				take: parseInt(limit),
				orderBy: { createdAt: 'desc' },
				include: {
					_count: {
						select: { outfitItems: true }
					}
				}
			}),
			prisma.garment.count({ where })
		])

		res.json({
			garments,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get garments error:', error)
		res.status(500).json({ error: 'Failed to get garments' })
	}
})

// Add garment
router.post('/garments', [
	body('name').isLength({ min: 1, max: 100 }),
	body('category').isIn(['top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear']),
	body('color').notEmpty(),
	body('images').isArray().isLength({ min: 1 })
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const garment = await prisma.garment.create({
			data: {
				...req.body,
				userId: req.user.id,
				tags: req.body.tags || []
			}
		})

		res.status(201).json({
			message: 'Garment added successfully',
			garment
		})
	} catch (error) {
		console.error('Add garment error:', error)
		res.status(500).json({ error: 'Failed to add garment' })
	}
})

// Get user's outfits
router.get('/outfits', async (req, res) => {
	try {
		const { page = 1, limit = 12 } = req.query
		const skip = (page - 1) * limit

		const [outfits, total] = await Promise.all([
			prisma.outfit.findMany({
				where: { userId: req.user.id },
				skip: parseInt(skip),
				take: parseInt(limit),
				orderBy: { createdAt: 'desc' },
				include: {
					items: {
						include: {
							garment: {
								select: {
									id: true,
									name: true,
									category: true,
									color: true,
									images: true
								}
							}
						}
					},
					_count: {
						select: { posts: true }
					}
				}
			}),
			prisma.outfit.count({ where: { userId: req.user.id } })
		])

		res.json({
			outfits,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get outfits error:', error)
		res.status(500).json({ error: 'Failed to get outfits' })
	}
})

// Create outfit
router.post('/outfits', [
	body('name').isLength({ min: 1, max: 100 }),
	body('garmentIds').isArray().isLength({ min: 1 }),
	body('occasion').optional().isArray(),
	body('season').optional().isArray()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { name, description, garmentIds, occasion = [], season = [] } = req.body

		// Verify all garments belong to user
		const garments = await prisma.garment.findMany({
			where: {
				id: { in: garmentIds },
				userId: req.user.id
			}
		})

		if (garments.length !== garmentIds.length) {
			return res.status(400).json({ error: 'Some garments not found or not owned by user' })
		}

		const outfit = await prisma.outfit.create({
			data: {
				name,
				description,
				occasion,
				season,
				userId: req.user.id,
				items: {
					create: garmentIds.map(garmentId => ({
						garmentId
					}))
				}
			},
			include: {
				items: {
					include: {
						garment: true
					}
				}
			}
		})

		res.status(201).json({
			message: 'Outfit created successfully',
			outfit
		})
	} catch (error) {
		console.error('Create outfit error:', error)
		res.status(500).json({ error: 'Failed to create outfit' })
	}
})

// Update garment wear count
router.post('/garments/:id/wear', async (req, res) => {
	try {
		const { id } = req.params

		const garment = await prisma.garment.update({
			where: {
				id,
				userId: req.user.id
			},
			data: {
				wearCount: { increment: 1 },
				lastWorn: new Date()
			}
		})

		res.json({
			message: 'Wear count updated',
			garment
		})
	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({ error: 'Garment not found' })
		}
		console.error('Update wear count error:', error)
		res.status(500).json({ error: 'Failed to update wear count' })
	}
})

// Check AI analysis status for a garment (Task 3.3)
router.get('/items/:id/ai-status', async (req, res) => {
	try {
		const { id } = req.params

		const garment = await prisma.garment.findFirst({
			where: {
				id,
				userId: req.user.id
			},
			select: {
				id: true,
				name: true,
				category: true,
				subcategory: true,
				color: true,
				pattern: true,
				material: true,
				tags: true,
				arMetadata: true,
				updatedAt: true
			}
		})

		if (!garment) {
			return res.status(404).json({ error: 'Garment not found' })
		}

		// Check if AI analysis has been completed
		const hasAIAnalysis = garment.arMetadata?.aiAnalysis &&
			!garment.arMetadata.aiAnalysis.error

		const aiError = garment.arMetadata?.aiAnalysis?.error

		res.json({
			garmentId: id,
			aiAnalysisComplete: hasAIAnalysis,
			hasError: !!aiError,
			error: aiError || null,
			analysis: hasAIAnalysis ? {
				category: garment.category,
				subcategory: garment.subcategory,
				color: garment.color,
				pattern: garment.pattern,
				material: garment.material,
				tags: garment.tags,
				confidence: garment.arMetadata.aiAnalysis.confidence,
				analyzedAt: garment.arMetadata.aiAnalysis.analyzedAt
			} : null,
			lastUpdated: garment.updatedAt
		})
	} catch (error) {
		console.error('AI status check error:', error)
		res.status(500).json({ error: 'Failed to check AI analysis status' })
	}
})

// Trigger AI re-analysis for a garment (Task 3.3)
router.post('/items/:id/reanalyze', async (req, res) => {
	try {
		const { id } = req.params

		const garment = await prisma.garment.findFirst({
			where: {
				id,
				userId: req.user.id
			}
		})

		if (!garment) {
			return res.status(404).json({ error: 'Garment not found' })
		}

		if (!garment.images || garment.images.length === 0) {
			return res.status(400).json({ error: 'No images available for analysis' })
		}

		// Trigger AI reanalysis
		const imagePath = garment.images[0].replace('/uploads/', '')
		const fullImagePath = path.join(process.cwd(), 'uploads', imagePath)

		// Start AI processing in background
		processGarmentAI(id, fullImagePath, garment.images[0])
			.then(result => {
				console.log(`AI reanalysis ${result.success ? 'completed' : 'failed'} for garment ${id}`)
			})
			.catch(error => {
				console.error(`AI reanalysis error for garment ${id}:`, error)
			})

		res.json({
			message: 'AI reanalysis started',
			garmentId: id,
			status: 'processing'
		})
	} catch (error) {
		console.error('AI reanalysis trigger error:', error)
		res.status(500).json({ error: 'Failed to trigger AI reanalysis' })
	}
})

export default router
