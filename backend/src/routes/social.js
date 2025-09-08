import { PrismaClient } from '@prisma/client'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router()
const prisma = new PrismaClient()

// Get social feed
router.get('/feed', async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query
		const skip = (page - 1) * limit

		// Get posts from users that the current user follows, plus their own posts
		const following = await prisma.follow.findMany({
			where: { followerId: req.user.id },
			select: { followingId: true }
		})

		const followingIds = following.map(f => f.followingId)
		const userIds = [req.user.id, ...followingIds]

		const [posts, total] = await Promise.all([
			prisma.post.findMany({
				where: {
					userId: { in: userIds },
					isPublic: true
				},
				skip: parseInt(skip),
				take: parseInt(limit),
				orderBy: { createdAt: 'desc' },
				include: {
					user: {
						select: {
							id: true,
							username: true,
							displayName: true,
							avatar: true,
							isVerified: true
						}
					},
					outfit: {
						include: {
							items: {
								include: {
									garment: {
										select: {
											name: true,
											category: true,
											brand: true,
											color: true
										}
									}
								}
							}
						}
					},
					_count: {
						select: {
							likes: true,
							comments: true
						}
					},
					likes: {
						where: { userId: req.user.id },
						select: { id: true }
					}
				}
			}),
			prisma.post.count({
				where: {
					userId: { in: userIds },
					isPublic: true
				}
			})
		])

		// Add isLiked flag
		const postsWithLikes = posts.map(post => ({
			...post,
			isLiked: post.likes.length > 0,
			likes: undefined // Remove the likes array, we only needed it for the check
		}))

		res.json({
			posts: postsWithLikes,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get feed error:', error)
		res.status(500).json({ error: 'Failed to get feed' })
	}
})

// Create post
router.post('/posts', [
	body('content').optional().isLength({ max: 1000 }),
	body('imageUrls').optional().isArray(),
	body('outfitId').optional().isUUID(),
	body('tags').optional().isArray()
], async (req, res) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { content, imageUrls = [], outfitId, tags = [] } = req.body

		// Verify outfit belongs to user if provided
		if (outfitId) {
			const outfit = await prisma.outfit.findFirst({
				where: {
					id: outfitId,
					userId: req.user.id
				}
			})

			if (!outfit) {
				return res.status(400).json({ error: 'Outfit not found or not owned by user' })
			}
		}

		const post = await prisma.post.create({
			data: {
				userId: req.user.id,
				content,
				imageUrls,
				outfitId,
				tags
			},
			include: {
				user: {
					select: {
						id: true,
						username: true,
						displayName: true,
						avatar: true,
						isVerified: true
					}
				},
				outfit: {
					include: {
						items: {
							include: {
								garment: {
									select: {
										name: true,
										category: true,
										brand: true,
										color: true
									}
								}
							}
						}
					}
				},
				_count: {
					select: {
						likes: true,
						comments: true
					}
				}
			}
		})

		res.status(201).json({
			message: 'Post created successfully',
			post: {
				...post,
				isLiked: false
			}
		})
	} catch (error) {
		console.error('Create post error:', error)
		res.status(500).json({ error: 'Failed to create post' })
	}
})

// Like/unlike post
router.post('/posts/:id/like', async (req, res) => {
	try {
		const { id } = req.params

		// Check if already liked
		const existingLike = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId: req.user.id,
					postId: id
				}
			}
		})

		if (existingLike) {
			// Unlike
			await prisma.like.delete({
				where: { id: existingLike.id }
			})
			res.json({ message: 'Post unliked', liked: false })
		} else {
			// Like
			await prisma.like.create({
				data: {
					userId: req.user.id,
					postId: id
				}
			})
			res.json({ message: 'Post liked', liked: true })
		}
	} catch (error) {
		console.error('Like post error:', error)
		res.status(500).json({ error: 'Failed to like/unlike post' })
	}
})

// Follow/unfollow user
router.post('/users/:id/follow', async (req, res) => {
	try {
		const { id } = req.params

		if (id === req.user.id) {
			return res.status(400).json({ error: 'Cannot follow yourself' })
		}

		// Check if already following
		const existingFollow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: req.user.id,
					followingId: id
				}
			}
		})

		if (existingFollow) {
			// Unfollow
			await prisma.follow.delete({
				where: { id: existingFollow.id }
			})
			res.json({ message: 'User unfollowed', following: false })
		} else {
			// Follow
			await prisma.follow.create({
				data: {
					followerId: req.user.id,
					followingId: id
				}
			})
			res.json({ message: 'User followed', following: true })
		}
	} catch (error) {
		console.error('Follow user error:', error)
		res.status(500).json({ error: 'Failed to follow/unfollow user' })
	}
})

// Get user's followers
router.get('/users/:id/followers', async (req, res) => {
	try {
		const { id } = req.params
		const { page = 1, limit = 20 } = req.query
		const skip = (page - 1) * limit

		const [followers, total] = await Promise.all([
			prisma.follow.findMany({
				where: { followingId: id },
				skip: parseInt(skip),
				take: parseInt(limit),
				include: {
					follower: {
						select: {
							id: true,
							username: true,
							displayName: true,
							avatar: true,
							isVerified: true
						}
					}
				}
			}),
			prisma.follow.count({ where: { followingId: id } })
		])

		res.json({
			followers: followers.map(f => f.follower),
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages: Math.ceil(total / limit)
			}
		})
	} catch (error) {
		console.error('Get followers error:', error)
		res.status(500).json({ error: 'Failed to get followers' })
	}
})

export default router
