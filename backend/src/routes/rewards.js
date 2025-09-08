import express from 'express'
import { RewardService } from '../services/rewardService.js'

const router = express.Router()
const rewardService = new RewardService()

// Test helper: allow x-test-user header to inject a fake req.user for automated tests
router.use((req, _res, next) => {
	if (!req.user && req.headers['x-test-user']) {
		req.user = { id: req.headers['x-test-user'] }
	}
	next()
})

/**
 * GET /api/rewards/milestones/:type
 * Get all reward milestones for a specific type
 */
router.get('/milestones/:type', async (req, res) => {
	try {
		const { type } = req.params
		const milestones = await rewardService.getRewardsForType(type)

		res.json({
			milestoneType: type,
			milestones: milestones.map(milestone => ({
				id: milestone.id,
				threshold: milestone.threshold,
				title: milestone.title,
				description: milestone.description,
				virtualItem: {
					id: milestone.virtualItem.id,
					name: milestone.virtualItem.name,
					description: milestone.virtualItem.description,
					imageUrl: milestone.virtualItem.imageUrl,
					rarity: milestone.virtualItem.rarity,
					category: milestone.virtualItem.category,
					metadata: milestone.virtualItem.metadata
				}
			}))
		})
	} catch (error) {
		console.error('Error fetching reward milestones:', error)
		res.status(500).json({ error: 'Failed to fetch reward milestones' })
	}
})

/**
 * GET /api/rewards/milestone/:type/:threshold
 * Get specific reward for a milestone
 */
router.get('/milestone/:type/:threshold', async (req, res) => {
	try {
		const { type, threshold } = req.params
		const milestone = await rewardService.getRewardForMilestone(type, parseInt(threshold))

		if (!milestone) {
			return res.status(404).json({
				error: 'No reward found for this milestone',
				milestoneType: type,
				threshold: parseInt(threshold)
			})
		}

		res.json({
			milestone: {
				id: milestone.id,
				milestoneType: milestone.milestoneType,
				threshold: milestone.threshold,
				title: milestone.title,
				description: milestone.description,
				virtualItem: {
					id: milestone.virtualItem.id,
					name: milestone.virtualItem.name,
					description: milestone.virtualItem.description,
					imageUrl: milestone.virtualItem.imageUrl,
					rarity: milestone.virtualItem.rarity,
					category: milestone.virtualItem.category,
					metadata: milestone.virtualItem.metadata
				}
			}
		})
	} catch (error) {
		console.error('Error fetching reward milestone:', error)
		res.status(500).json({ error: 'Failed to fetch reward milestone' })
	}
})

/**
 * GET /api/rewards/inventory
 * Get current user's virtual item inventory
 */
router.get('/inventory', async (req, res) => {
	try {
		const { category } = req.query
		const inventory = await rewardService.getUserVirtualItems(req.user.id, category)

		res.json({
			userId: req.user.id,
			totalItems: inventory.length,
			items: inventory.map(item => ({
				id: item.id,
				obtainedAt: item.obtainedAt,
				source: item.source,
				isEquipped: item.isEquipped,
				virtualItem: {
					id: item.virtualItem.id,
					name: item.virtualItem.name,
					description: item.virtualItem.description,
					imageUrl: item.virtualItem.imageUrl,
					rarity: item.virtualItem.rarity,
					category: item.virtualItem.category,
					metadata: item.virtualItem.metadata
				}
			}))
		})
	} catch (error) {
		console.error('Error fetching user inventory:', error)
		res.status(500).json({ error: 'Failed to fetch user inventory' })
	}
})

/**
 * POST /api/rewards/equip/:virtualItemId
 * Equip a virtual item
 */
router.post('/equip/:virtualItemId', async (req, res) => {
	try {
		const { virtualItemId } = req.params
		const { equip = true } = req.body

		const result = await rewardService.toggleItemEquipped(req.user.id, virtualItemId, equip)

		if (!result) {
			return res.status(404).json({
				error: 'Virtual item not found in user inventory'
			})
		}

		res.json({
			success: true,
			action: equip ? 'equipped' : 'unequipped',
			item: {
				id: result.id,
				isEquipped: result.isEquipped,
				virtualItem: {
					id: result.virtualItem.id,
					name: result.virtualItem.name,
					category: result.virtualItem.category
				}
			}
		})
	} catch (error) {
		console.error('Error toggling item equipped:', error)
		res.status(500).json({ error: 'Failed to update item equipped status' })
	}
})

/**
 * POST /api/rewards/check-milestones
 * Check and award milestones for current user
 * Used internally by other services (e.g., streak service)
 */
router.post('/check-milestones', async (req, res) => {
	try {
		const { milestoneType, currentValue } = req.body

		if (!milestoneType || currentValue === undefined) {
			return res.status(400).json({
				error: 'milestoneType and currentValue are required'
			})
		}

		const newRewards = await rewardService.checkAndAwardMilestones(
			req.user.id,
			milestoneType,
			currentValue
		)

		res.json({
			success: true,
			milestoneType,
			currentValue,
			newRewards: newRewards.map(reward => ({
				virtualItem: {
					id: reward.virtualItem.id,
					name: reward.virtualItem.name,
					description: reward.virtualItem.description,
					imageUrl: reward.virtualItem.imageUrl,
					rarity: reward.virtualItem.rarity,
					category: reward.virtualItem.category
				},
				milestone: reward.milestone,
				obtainedAt: reward.obtainedAt,
				source: reward.source
			}))
		})
	} catch (error) {
		console.error('Error checking milestones:', error)
		res.status(500).json({ error: 'Failed to check milestones' })
	}
})

export default router
