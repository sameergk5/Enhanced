import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.status(401).json({ error: 'Access token required' })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		// Get user from database
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			include: {
				profile: true,
				styleProfile: true
			}
		})

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		req.user = user
		next()
	} catch (error) {
		return res.status(403).json({ error: 'Invalid or expired token' })
	}
}

export const requireAdmin = (req, res, next) => {
	if (!req.user || !req.user.isAdmin) {
		return res.status(403).json({ error: 'Admin access required' })
	}
	next()
}
