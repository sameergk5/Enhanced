import fs from 'fs'
import multer from 'multer'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads')
const garmentUploadsDir = path.join(uploadsDir, 'garments')
const thumbnailsDir = path.join(garmentUploadsDir, 'thumbnails')

	// Create directories if they don't exist
	;[uploadsDir, garmentUploadsDir, thumbnailsDir].forEach(dir => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}
	})

// File filter for images only
const fileFilter = (req, file, cb) => {
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false)
	}
}

// Storage configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, garmentUploadsDir)
	},
	filename: (req, file, cb) => {
		const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`
		cb(null, uniqueName)
	}
})

// Multer configuration
export const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
		files: 5 // Maximum 5 files per upload
	}
})

// Image processing utilities
export const processImage = async (filePath, options = {}) => {
	try {
		const {
			maxWidth = 1024,
			maxHeight = 1024,
			quality = 80,
			format = 'webp'
		} = options

		const filename = path.basename(filePath, path.extname(filePath))
		const processedPath = path.join(path.dirname(filePath), `${filename}.${format}`)

		await sharp(filePath)
			.resize(maxWidth, maxHeight, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.webp({ quality })
			.toFile(processedPath)

		// Remove original file if different format
		if (path.extname(filePath) !== `.${format}`) {
			fs.unlinkSync(filePath)
		}

		return processedPath
	} catch (error) {
		console.error('Image processing error:', error)
		throw new Error('Failed to process image')
	}
}

// Generate thumbnail
export const generateThumbnail = async (originalPath, thumbnailSize = 200) => {
	try {
		const filename = path.basename(originalPath, path.extname(originalPath))
		const thumbnailPath = path.join(thumbnailsDir, `${filename}-thumb.webp`)

		await sharp(originalPath)
			.resize(thumbnailSize, thumbnailSize, {
				fit: 'cover',
				position: 'center'
			})
			.webp({ quality: 70 })
			.toFile(thumbnailPath)

		return thumbnailPath
	} catch (error) {
		console.error('Thumbnail generation error:', error)
		throw new Error('Failed to generate thumbnail')
	}
}

// Background removal (placeholder for future AI integration)
export const removeBackground = async (imagePath) => {
	// TODO: Integrate with AI service for background removal
	// For now, return the original image
	return imagePath
}

// Get public URL for uploaded files
export const getPublicUrl = (filePath) => {
	const relativePath = path.relative(uploadsDir, filePath)
	return `/uploads/${relativePath.replace(/\\/g, '/')}`
}

// Clean up old files
export const cleanupFile = (filePath) => {
	try {
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath)
		}
	} catch (error) {
		console.error('File cleanup error:', error)
	}
}

export default {
	upload,
	processImage,
	generateThumbnail,
	removeBackground,
	getPublicUrl,
	cleanupFile
}
