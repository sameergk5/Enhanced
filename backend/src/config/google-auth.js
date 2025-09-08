import { PrismaClient } from '@prisma/client'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

const prisma = new PrismaClient()

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_CALLBACK_URL
)

// Passport configuration for Google OAuth
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
	try {
		// Check if user already exists
		let user = await prisma.user.findUnique({
			where: { email: profile.emails[0].value },
			include: {
				profile: true,
				styleProfile: true
			}
		})

		if (user) {
			// Update existing user with Google info if needed
			if (!user.googleId) {
				user = await prisma.user.update({
					where: { id: user.id },
					data: {
						googleId: profile.id,
						avatar: profile.photos[0]?.value || user.avatar
					},
					include: {
						profile: true,
						styleProfile: true
					}
				})
			}
		} else {
			// Create new user
			const username = await generateUniqueUsername(profile.emails[0].value)

			user = await prisma.user.create({
				data: {
					email: profile.emails[0].value,
					username: username,
					displayName: profile.displayName || profile.name?.givenName || 'User',
					googleId: profile.id,
					avatar: profile.photos[0]?.value,
					emailVerified: true, // Google accounts are pre-verified
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
		}

		return done(null, user)
	} catch (error) {
		console.error('Google OAuth error:', error)
		return done(error, null)
	}
}))

// Generate unique username from email
async function generateUniqueUsername(email) {
	const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
	let username = baseUsername
	let counter = 1

	while (await prisma.user.findUnique({ where: { username } })) {
		username = `${baseUsername}${counter}`
		counter++
	}

	return username
}

// Serialize user for session
passport.serializeUser((user, done) => {
	done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id },
			include: {
				profile: true,
				styleProfile: true
			}
		})
		done(null, user)
	} catch (error) {
		done(error, null)
	}
})

// Generate JWT token for user
export function generateJwtToken(user) {
	return jwt.sign(
		{
			userId: user.id,
			email: user.email,
			username: user.username
		},
		process.env.JWT_SECRET,
		{ expiresIn: '7d' }
	)
}

// Get Google OAuth URL
export function getGoogleAuthUrl() {
	const scopes = [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email'
	]

	return oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes,
		prompt: 'consent'
	})
}

// Verify Google token
export async function verifyGoogleToken(token) {
	try {
		const ticket = await oauth2Client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID
		})

		const payload = ticket.getPayload()
		return payload
	} catch (error) {
		console.error('Token verification error:', error)
		throw new Error('Invalid Google token')
	}
}

export { oauth2Client, passport }
