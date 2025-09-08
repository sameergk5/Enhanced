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

// Configure multer for garment uploads
const storage = multer.diskStorage({
	destination: async (req, file, cb) => {
		const uploadDir = path.join(process.cwd(), 'uploads/garments')
		await fs.mkdir(uploadDir, { recursive: true })
		cb(null, uploadDir)
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, `garment-${uniqueSuffix}${path.extname(file.originalname)}`)
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

/**
 * @route POST /api/garments/upload
 * @desc Upload and analyze a garment image
 * @access Private
 */
router.post('/upload',
	upload.single('garment_image'),
	[
		body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
		body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
		body('brand').optional().isLength({ max: 50 }).withMessage('Brand must be less than 50 characters'),
		body('size').optional().isLength({ max: 10 }).withMessage('Size must be less than 10 characters'),
		body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
		body('tags').optional().isJSON().withMessage('Tags must be valid JSON array')
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
					message: 'Garment image file is required'
				})
			}

			const userId = req.user?.id || 'test-user-123' // Allow testing without auth
			const { name, description, brand, size, price, tags, purchase_date } = req.body

			// Prepare metadata
			const metadata = {
				name: name || 'Untitled Garment',
				description: description || '',
				brand: brand || '',
				size: size || '',
				price: price ? parseFloat(price) : 0,
				purchase_date: purchase_date || '',
				tags: tags ? JSON.parse(tags) : [],
				is_favorite: false
			}

			// Prepare form data for AI service
			const form = new FormData()

			form.append('user_id', userId)
			form.append('garment_image', await fs.readFile(req.file.path), {
				filename: req.file.originalname,
				contentType: req.file.mimetype
			})
			form.append('metadata', JSON.stringify(metadata))

			// Call AI service
			const response = await axios.post(`${AI_SERVICE_URL}/api/garments/upload`, form, {
				headers: {
					...form.getHeaders(),
				},
				timeout: 30000 // 30 second timeout
			})

			const aiAnalysis = response.data

			// Save garment to database
			const garmentData = {
				userId: userId,
				name: aiAnalysis.garment.name,
				description: aiAnalysis.garment.description,
				brand: aiAnalysis.garment.brand,
				size: aiAnalysis.garment.size,
				price: aiAnalysis.garment.price,
				purchaseDate: aiAnalysis.garment.purchase_date ? new Date(aiAnalysis.garment.purchase_date) : null,
				category: aiAnalysis.garment.category,
				type: aiAnalysis.garment.type,
				subcategory: aiAnalysis.garment.subcategory,
				primaryColor: aiAnalysis.garment.primary_color,
				colors: aiAnalysis.garment.colors,
				pattern: aiAnalysis.garment.pattern,
				material: aiAnalysis.garment.material,
				occasions: aiAnalysis.garment.occasions,
				seasons: aiAnalysis.garment.seasons,
				styleAttributes: aiAnalysis.garment.style_attributes,
				tags: aiAnalysis.garment.tags,
				imageUrl: aiAnalysis.garment.image_url,
				thumbnailUrl: aiAnalysis.garment.thumbnail_url,
				isFavorite: aiAnalysis.garment.is_favorite,
				wearCount: 0,
				status: 'active'
			}

			const garment = await prisma.garment.create({
				data: garmentData
			})

			// Clean up uploaded file
			await fs.unlink(req.file.path)

			res.status(201).json({
				success: true,
				message: 'Garment uploaded and analyzed successfully',
				garment: {
					id: garment.id,
					name: garment.name,
					category: garment.category,
					type: garment.type,
					primaryColor: garment.primaryColor,
					imageUrl: garment.imageUrl,
					thumbnailUrl: garment.thumbnailUrl,
					createdAt: garment.createdAt
				},
				analysis: aiAnalysis.analysis
			})

		} catch (error) {
			console.error('Garment upload error:', error)

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
				message: 'Garment upload failed',
				error: error.message
			})
		}
	}
)

/**
 * @route GET /api/garments
 * @desc Get all garments for the current user with filtering
 * @access Private
 */
router.get('/', async (req, res) => {
	try {
		const userId = req.user?.id || 'test-user-123' // Allow testing without auth
		const {
			category,
			color,
			season,
			occasion,
			is_favorite,
			limit = 50,
			offset = 0,
			sort_by = 'createdAt',
			sort_order = 'desc'
		} = req.query

		// Build filter conditions
		const whereConditions = {
			userId: userId,
			status: 'active'
		}

		if (category) {
			whereConditions.category = category
		}

		if (color) {
			whereConditions.primaryColor = color
		}

		if (is_favorite !== undefined) {
			whereConditions.isFavorite = is_favorite === 'true'
		}

		if (season) {
			whereConditions.seasons = {
				has: season
			}
		}

		if (occasion) {
			whereConditions.occasions = {
				has: occasion
			}
		}

		// Get total count for pagination
		const total = await prisma.garment.count({
			where: whereConditions
		})

		// Get garments with pagination
		const garments = await prisma.garment.findMany({
			where: whereConditions,
			select: {
				id: true,
				name: true,
				category: true,
				type: true,
				subcategory: true,
				primaryColor: true,
				colors: true,
				imageUrl: true,
				thumbnailUrl: true,
				isFavorite: true,
				wearCount: true,
				lastWorn: true,
				createdAt: true,
				updatedAt: true
			},
			orderBy: {
				[sort_by]: sort_order
			},
			take: parseInt(limit),
			skip: parseInt(offset)
		})

		const pages = Math.ceil(total / parseInt(limit))
		const currentPage = Math.floor(parseInt(offset) / parseInt(limit)) + 1

		res.json({
			success: true,
			garments: garments,
			pagination: {
				total: total,
				page: currentPage,
				pages: pages,
				limit: parseInt(limit),
				offset: parseInt(offset)
			},
			filters_applied: {
				category,
				color,
				season,
				occasion,
				is_favorite
			}
		})

	} catch (error) {
		console.error('Get garments error:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve garments',
			error: error.message
		})
	}
})

/**
 * @route GET /api/garments/:id
 * @desc Get specific garment details
 * @access Private
 */
router.get('/:id', async (req, res) => {
	try {
		const userId = req.user.id
		const garmentId = req.params.id

		const garment = await prisma.garment.findFirst({
			where: {
				id: garmentId,
				userId: userId
			}
		})

		if (!garment) {
			return res.status(404).json({
				success: false,
				message: 'Garment not found'
			})
		}

		res.json({
			success: true,
			garment: garment
		})

	} catch (error) {
		console.error('Get garment error:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve garment',
			error: error.message
		})
	}
})

/**
 * @route PUT /api/garments/:id
 * @desc Update garment information
 * @access Private
 */
router.put('/:id',
	[
		body('name').optional().isLength({ min: 1, max: 100 }),
		body('description').optional().isLength({ max: 500 }),
		body('brand').optional().isLength({ max: 50 }),
		body('size').optional().isLength({ max: 10 }),
		body('price').optional().isFloat({ min: 0 }),
		body('tags').optional().isArray(),
		body('is_favorite').optional().isBoolean(),
		body('status').optional().isIn(['active', 'donated', 'sold', 'lost'])
	],
	async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					errors: errors.array()
				})
			}

			const userId = req.user.id
			const garmentId = req.params.id

			// Check if garment exists and belongs to user
			const existingGarment = await prisma.garment.findFirst({
				where: {
					id: garmentId,
					userId: userId
				}
			})

			if (!existingGarment) {
				return res.status(404).json({
					success: false,
					message: 'Garment not found'
				})
			}

			// Prepare update data
			const updateData = {
				updatedAt: new Date()
			}

			const allowedFields = [
				'name', 'description', 'brand', 'size', 'price',
				'tags', 'isFavorite', 'status'
			]

			allowedFields.forEach(field => {
				const bodyField = field === 'isFavorite' ? 'is_favorite' : field
				if (req.body[bodyField] !== undefined) {
					updateData[field] = req.body[bodyField]
				}
			})

			// Update garment
			const updatedGarment = await prisma.garment.update({
				where: {
					id: garmentId
				},
				data: updateData
			})

			res.json({
				success: true,
				message: 'Garment updated successfully',
				garment: updatedGarment
			})

		} catch (error) {
			console.error('Update garment error:', error)
			res.status(500).json({
				success: false,
				message: 'Failed to update garment',
				error: error.message
			})
		}
	}
)

/**
 * @route DELETE /api/garments/:id
 * @desc Delete a garment
 * @access Private
 */
router.delete('/:id', async (req, res) => {
	try {
		const userId = req.user.id
		const garmentId = req.params.id

		// Check if garment exists and belongs to user
		const existingGarment = await prisma.garment.findFirst({
			where: {
				id: garmentId,
				userId: userId
			}
		})

		if (!existingGarment) {
			return res.status(404).json({
				success: false,
				message: 'Garment not found'
			})
		}

		// Delete garment from database
		await prisma.garment.delete({
			where: {
				id: garmentId
			}
		})

		res.json({
			success: true,
			message: 'Garment deleted successfully'
		})

	} catch (error) {
		console.error('Delete garment error:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to delete garment',
			error: error.message
		})
	}
})

/**
 * @route POST /api/garments/worn/:id
 * @desc Mark garment as worn (increment wear count)
 * @access Private
 */
router.post('/worn/:id', async (req, res) => {
	try {
		const userId = req.user.id
		const garmentId = req.params.id

		// Check if garment exists and belongs to user
		const existingGarment = await prisma.garment.findFirst({
			where: {
				id: garmentId,
				userId: userId
			}
		})

		if (!existingGarment) {
			return res.status(404).json({
				success: false,
				message: 'Garment not found'
			})
		}

		// Update wear count and last worn date
		const updatedGarment = await prisma.garment.update({
			where: {
				id: garmentId
			},
			data: {
				wearCount: {
					increment: 1
				},
				lastWorn: new Date(),
				updatedAt: new Date()
			}
		})

		res.json({
			success: true,
			message: 'Garment wear count updated',
			garment: {
				id: updatedGarment.id,
				wearCount: updatedGarment.wearCount,
				lastWorn: updatedGarment.lastWorn
			}
		})

	} catch (error) {
		console.error('Update wear count error:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to update wear count',
			error: error.message
		})
	}
})

/**
 * @route GET /api/garments/statistics/wardrobe
 * @desc Get wardrobe statistics for the current user
 * @access Private
 */
router.get('/statistics/wardrobe', async (req, res) => {
	try {
		const userId = req.user.id

		// Get total garment count
		const totalGarments = await prisma.garment.count({
			where: {
				userId: userId,
				status: 'active'
			}
		})

		// Get category breakdown
		const categoryStats = await prisma.garment.groupBy({
			by: ['category'],
			where: {
				userId: userId,
				status: 'active'
			},
			_count: {
				category: true
			}
		})

		// Get color breakdown
		const colorStats = await prisma.garment.groupBy({
			by: ['primaryColor'],
			where: {
				userId: userId,
				status: 'active'
			},
			_count: {
				primaryColor: true
			}
		})

		// Get most and least worn items
		const mostWorn = await prisma.garment.findFirst({
			where: {
				userId: userId,
				status: 'active'
			},
			orderBy: {
				wearCount: 'desc'
			},
			select: {
				id: true,
				name: true,
				wearCount: true
			}
		})

		const leastWorn = await prisma.garment.findFirst({
			where: {
				userId: userId,
				status: 'active',
				wearCount: {
					gt: 0
				}
			},
			orderBy: {
				wearCount: 'asc'
			},
			select: {
				id: true,
				name: true,
				wearCount: true
			}
		})

		// Get favorites count
		const favoritesCount = await prisma.garment.count({
			where: {
				userId: userId,
				status: 'active',
				isFavorite: true
			}
		})

		// Calculate average wear count
		const wearCountStats = await prisma.garment.aggregate({
			where: {
				userId: userId,
				status: 'active'
			},
			_avg: {
				wearCount: true
			}
		})

		res.json({
			success: true,
			statistics: {
				total_garments: totalGarments,
				categories: Object.fromEntries(
					categoryStats.map(stat => [stat.category, stat._count.category])
				),
				colors: Object.fromEntries(
					colorStats.map(stat => [stat.primaryColor, stat._count.primaryColor])
				),
				most_worn: mostWorn,
				least_worn: leastWorn,
				favorites_count: favoritesCount,
				average_wear_count: Math.round((wearCountStats._avg.wearCount || 0) * 10) / 10,
				last_updated: new Date().toISOString()
			}
		})

	} catch (error) {
		console.error('Get statistics error:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve wardrobe statistics',
			error: error.message
		})
	}
})

export default router
