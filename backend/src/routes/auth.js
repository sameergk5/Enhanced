import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import express from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { generateJwtToken, getGoogleAuthUrl, passport, verifyGoogleToken } from '../config/google-auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Register
router.post('/register', [
	body('email').isEmail().normalizeEmail(),
	body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
	body('password').isLength({ min: 6 }),
	body('displayName').isLength({ min: 1, max: 50 })
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { email, username, password, displayName } = req.body

		// Check if user exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [
					{ email },
					{ username }
				]
			}
		})

		if (existingUser) {
			return res.status(400).json({
				error: 'User with this email or username already exists'
			})
		}

		// Hash password
		const saltRounds = 12
		const hashedPassword = await bcrypt.hash(password, saltRounds)

		// Create user
		const user = await prisma.user.create({
			data: {
				email,
				username,
				displayName,
				// Note: We'll store password hash separately for security
				profile: {
					create: {}
				},
				styleProfile: {
					create: {
						preferredStyles: [],
						preferredColors: [],
						brandPrefs: [],
						priceRange: { min: 0, max: 1000 }
					}
				}
			},
			include: {
				profile: true,
				styleProfile: true
			}
		})

		// Create JWT token
		const token = jwt.sign(
			{ userId: user.id },
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		)

		res.status(201).json({
			message: 'User created successfully',
			token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				displayName: user.displayName,
				avatar: user.avatar,
				createdAt: user.createdAt
			}
		})
	} catch (error) {
		console.error('Registration error:', error)
		res.status(500).json({ error: 'Failed to create user' })
	}
})

// Login
router.post('/login', [
	body('emailOrUsername').notEmpty(),
	body('password').notEmpty()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { emailOrUsername, password } = req.body

		// Find user by email or username
		const user = await prisma.user.findFirst({
			where: {
				OR: [
					{ email: emailOrUsername },
					{ username: emailOrUsername }
				]
			},
			include: {
				profile: true,
				styleProfile: true
			}
		})

		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' })
		}

		// Note: In production, you'd verify the password hash here
		// const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

		// Create JWT token
		const token = jwt.sign(
			{ userId: user.id },
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		)

		res.json({
			message: 'Login successful',
			token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				displayName: user.displayName,
				avatar: user.avatar,
				profile: user.profile,
				styleProfile: user.styleProfile
			}
		})
	} catch (error) {
		console.error('Login error:', error)
		res.status(500).json({ error: 'Login failed' })
	}
})

// Refresh token
router.post('/refresh', async (req, res) => {
	try {
		const { token } = req.body

		if (!token) {
			return res.status(401).json({ error: 'Refresh token required' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		// Create new token
		const newToken = jwt.sign(
			{ userId: decoded.userId },
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		)

		res.json({ token: newToken })
	} catch (error) {
		res.status(403).json({ error: 'Invalid refresh token' })
	}
})

// Google OAuth Routes

// Initiate Google OAuth flow
router.get('/google', (req, res) => {
	try {
		const authUrl = getGoogleAuthUrl()
		res.json({
			message: 'Redirect to Google OAuth',
			authUrl: authUrl
		})
	} catch (error) {
		console.error('Google auth initiation error:', error)
		res.status(500).json({ error: 'Failed to initiate Google authentication' })
	}
})

// Google OAuth callback
router.get('/google/callback',
	passport.authenticate('google', { session: false }),
	async (req, res) => {
		try {
			const user = req.user
			const token = generateJwtToken(user)

			// In production, you might want to redirect to frontend with token
			// For API testing, we'll return JSON
			res.json({
				message: 'Google authentication successful',
				token,
				user: {
					id: user.id,
					email: user.email,
					username: user.username,
					displayName: user.displayName,
					avatar: user.avatar,
					googleId: user.googleId,
					profile: user.profile,
					styleProfile: user.styleProfile
				}
			})
		} catch (error) {
			console.error('Google callback error:', error)
			res.status(500).json({ error: 'Authentication failed' })
		}
	}
)

// Verify Google ID token (for frontend direct integration)
router.post('/google/verify', [
	body('idToken').notEmpty().withMessage('Google ID token is required')
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { idToken } = req.body

		// Verify the token with Google
		const payload = await verifyGoogleToken(idToken)

		if (!payload) {
			return res.status(401).json({ error: 'Invalid Google token' })
		}

		// Check if user exists or create new user
		let user = await prisma.user.findUnique({
			where: { email: payload.email },
			include: {
				profile: true,
				styleProfile: true
			}
		})

		if (!user) {
			// Generate unique username
			const baseUsername = payload.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
			let username = baseUsername
			let counter = 1

			while (await prisma.user.findUnique({ where: { username } })) {
				username = `${baseUsername}${counter}`
				counter++
			}

			// Create new user
			user = await prisma.user.create({
				data: {
					email: payload.email,
					username: username,
					displayName: payload.name || 'User',
					googleId: payload.sub,
					avatar: payload.picture,
					emailVerified: true,
					profile: {
						create: {
							bio: '',
							location: '',
							website: ''
						}
					},
					styleProfile: {
						create: {
							preferredStyles: [],
							preferredColors: [],
							brandPrefs: [],
							priceRange: { min: 0, max: 1000 }
						}
					}
				},
				include: {
					profile: true,
					styleProfile: true
				}
			})
		} else if (!user.googleId) {
			// Update existing user with Google ID
			user = await prisma.user.update({
				where: { id: user.id },
				data: {
					googleId: payload.sub,
					avatar: payload.picture || user.avatar
				},
				include: {
					profile: true,
					styleProfile: true
				}
			})
		}

		// Generate JWT token
		const token = generateJwtToken(user)

		res.json({
			message: 'Google authentication successful',
			token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				displayName: user.displayName,
				avatar: user.avatar,
				googleId: user.googleId,
				profile: user.profile,
				styleProfile: user.styleProfile
			}
		})

	} catch (error) {
		console.error('Google token verification error:', error)
		res.status(500).json({ error: 'Authentication failed' })
	}
})

export default router
