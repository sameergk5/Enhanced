import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Reward Milestone Service
 * Handles virtual item rewards for user achievements
 */
export class RewardService {

	/**
	 * Get reward for a specific milestone
	 * @param {string} milestoneType - Type of milestone (e.g., 'streak')
	 * @param {number} threshold - Milestone threshold (e.g., 10 for 10-day streak)
	 * @returns {Object|null} Reward details or null if no reward exists
	 */
	async getRewardForMilestone(milestoneType, threshold) {
		try {
			const milestone = await prisma.rewardMilestone.findUnique({
				where: {
					milestoneType_threshold: {
						milestoneType,
						threshold
					}
				},
				include: {
					virtualItem: true
				}
			})

			return milestone || null
		} catch (error) {
			console.error('Error fetching reward milestone:', error)
			return null
		}
	}

	/**
	 * Get all available rewards for a milestone type
	 * @param {string} milestoneType - Type of milestone
	 * @returns {Array} Array of reward milestones
	 */
	async getRewardsForType(milestoneType) {
		try {
			return await prisma.rewardMilestone.findMany({
				where: {
					milestoneType,
					isActive: true
				},
				include: {
					virtualItem: true
				},
				orderBy: {
					threshold: 'asc'
				}
			})
		} catch (error) {
			console.error('Error fetching rewards for type:', error)
			return []
		}
	}

	/**
	 * Award a virtual item to a user
	 * @param {string} userId - User ID
	 * @param {string} virtualItemId - Virtual item ID
	 * @param {string} source - Source of the reward (default: 'reward')
	 * @returns {Object|null} Created user virtual item or null if failed
	 */
	async awardVirtualItem(userId, virtualItemId, source = 'reward') {
		try {
			// Check if user already has this item
			const existingItem = await prisma.userVirtualItem.findUnique({
				where: {
					userId_virtualItemId: {
						userId,
						virtualItemId
					}
				}
			})

			if (existingItem) {
				console.log(`User ${userId} already owns virtual item ${virtualItemId}`)
				return existingItem
			}

			// Award the item
			const userVirtualItem = await prisma.userVirtualItem.create({
				data: {
					userId,
					virtualItemId,
					source
				},
				include: {
					virtualItem: true
				}
			})

			console.log(`Awarded virtual item ${virtualItemId} to user ${userId}`)
			return userVirtualItem
		} catch (error) {
			console.error('Error awarding virtual item:', error)
			return null
		}
	}

	/**
	 * Check and award milestone rewards for a user
	 * @param {string} userId - User ID
	 * @param {string} milestoneType - Type of milestone
	 * @param {number} currentValue - Current value (e.g., streak count)
	 * @returns {Array} Array of newly awarded items
	 */
	async checkAndAwardMilestones(userId, milestoneType, currentValue) {
		try {
			// Get all milestones for this type up to the current value
			const milestones = await prisma.rewardMilestone.findMany({
				where: {
					milestoneType,
					threshold: {
						lte: currentValue
					},
					isActive: true
				},
				include: {
					virtualItem: true
				}
			})

			// Get user's existing virtual items to avoid duplicates
			const userItems = await prisma.userVirtualItem.findMany({
				where: { userId },
				select: { virtualItemId: true }
			})
			const ownedItemIds = new Set(userItems.map(item => item.virtualItemId))

			// Award new items
			const newlyAwarded = []
			for (const milestone of milestones) {
				if (!ownedItemIds.has(milestone.virtualItemId)) {
					const awarded = await this.awardVirtualItem(
						userId,
						milestone.virtualItemId,
						`${milestoneType}_milestone`
					)
					if (awarded) {
						newlyAwarded.push({
							...awarded,
							milestone: {
								title: milestone.title,
								description: milestone.description,
								threshold: milestone.threshold
							}
						})
					}
				}
			}

			return newlyAwarded
		} catch (error) {
			console.error('Error checking and awarding milestones:', error)
			return []
		}
	}

	/**
	 * Get user's virtual item inventory
	 * @param {string} userId - User ID
	 * @param {string} [category] - Optional category filter
	 * @returns {Array} User's virtual items
	 */
	async getUserVirtualItems(userId, category = null) {
		try {
			const where = { userId }
			if (category) {
				where.virtualItem = { category }
			}

			return await prisma.userVirtualItem.findMany({
				where,
				include: {
					virtualItem: true
				},
				orderBy: {
					obtainedAt: 'desc'
				}
			})
		} catch (error) {
			console.error('Error fetching user virtual items:', error)
			return []
		}
	}

	/**
	 * Equip/unequip a virtual item for a user
	 * @param {string} userId - User ID
	 * @param {string} virtualItemId - Virtual item ID
	 * @param {boolean} isEquipped - Whether to equip or unequip
	 * @returns {Object|null} Updated user virtual item
	 */
	async toggleItemEquipped(userId, virtualItemId, isEquipped) {
		try {
			// If equipping, unequip other items of the same category first
			if (isEquipped) {
				const virtualItem = await prisma.virtualItem.findUnique({
					where: { id: virtualItemId }
				})

				if (virtualItem) {
					await prisma.userVirtualItem.updateMany({
						where: {
							userId,
							virtualItem: {
								category: virtualItem.category
							},
							isEquipped: true
						},
						data: {
							isEquipped: false
						}
					})
				}
			}

			return await prisma.userVirtualItem.update({
				where: {
					userId_virtualItemId: {
						userId,
						virtualItemId
					}
				},
				data: {
					isEquipped
				},
				include: {
					virtualItem: true
				}
			})
		} catch (error) {
			console.error('Error toggling item equipped status:', error)
			return null
		}
	}
}

export default new RewardService()
