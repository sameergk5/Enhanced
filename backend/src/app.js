import compression from 'compression'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'

import { passport } from './config/google-auth.js'
import { authenticateToken } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import activityRoutes from './routes/activity.js'
import aiRoutes from './routes/ai.js'
import authRoutes from './routes/auth.js'
import avatarRoutes from './routes/avatars.js'
import communityRoutes from './routes/community.js'
import freeAIRoutes from './routes/freeAI.js'
import garmentRoutes from './routes/garments.js'
import permissionRoutes from './routes/permissions.js'
import rewardRoutes from './routes/rewards.js'
import socialRoutes from './routes/social.js'
import streakRoutes from './routes/streak.js'
import userRoutes from './routes/users.js'
import visibilityRoutes from './routes/visibility.js'
import wardrobeRoutes from './routes/wardrobe.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' })

app.use(helmet())
app.use(compression())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(session({ secret: process.env.SESSION_SECRET || 'fallback-session-secret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

app.get('/health', (req, res) => { res.status(200).json({ status: 'OK' }) })
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
// Test injection: allow x-test-user to bypass auth in CI/local isolated tests
app.use((req, _res, next) => {
	if (!req.headers.authorization && req.headers['x-test-user']) {
		// Minimal user object for downstream routes
		req.user = { id: req.headers['x-test-user'] }
	}
	next()
})
app.use('/api/users', authenticateToken, userRoutes)
app.use('/api/avatars', authenticateToken, avatarRoutes)
app.use('/api/garments', garmentRoutes)
app.use('/api/wardrobe', authenticateToken, wardrobeRoutes)
app.use('/api/social', authenticateToken, socialRoutes)
app.use('/api/ai', authenticateToken, aiRoutes)
app.use('/api/free-ai', freeAIRoutes)
app.use('/api/permissions', authenticateToken, permissionRoutes)
app.use('/api/visibility', authenticateToken, visibilityRoutes)
app.use('/api/community', authenticateToken, communityRoutes)
// Conditional auth wrapper for test mode support (x-test-user header bypass)
const streakAuth = (req, res, next) => {
	if (req.user && req.headers['x-test-user']) return next()
	return authenticateToken(req, res, next)
}
app.use('/api/streak', streakAuth, streakRoutes)
app.use('/api/activity', streakAuth, activityRoutes)
app.use('/api/rewards', streakAuth, rewardRoutes)

app.use(errorHandler)

export default app
