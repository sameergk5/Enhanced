import express from 'express';
import { authenticateToken as authMiddleware } from '../middleware/auth.js';
import rewardService from '../services/rewardService.js';
import StreakService from '../services/streakService.js';

const router = express.Router();
const streakService = new StreakService();

/**
 * @route POST /api/activity/log
 * @desc Log user activity and update streak
 * @access Private
 */
router.post('/log', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.id;
		const { activityType = 'general', metadata = {} } = req.body;

		// Validate activity type
		if (!streakService.isValidActivityType(activityType)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid activity type',
				validTypes: [
					'create_look',
					'virtual_tryon',
					'share_look',
					'rate_outfit',
					'browse_collection',
					'update_profile',
					'general'
				]
			});
		}

		// Log activity and update streak
		const result = await streakService.logActivity(userId, activityType);

		// Check if user achieved any new milestones
		let milestoneResults = null;
		try {
			milestoneResults = await rewardService.checkAndAwardMilestones(userId, 'streak', result.streak.currentStreak);
		} catch (error) {
			console.log('Milestone check failed:', error.message);
			// Continue without milestone check if reward service is unavailable
		}

		res.status(200).json({
			success: true,
			message: result.message,
			data: {
				streak: {
					current: result.streak.currentStreak,
					longest: result.streak.longestStreak,
					totalActivities: result.streak.totalActivities,
					lastActivityDate: result.streak.lastActivityDate,
					lastActivityType: result.streak.lastActivityType
				},
				changes: {
					streakIncreased: result.streakIncreased,
					streakReset: result.streakReset,
					isNewRecord: result.isNewRecord
				},
				milestones: milestoneResults || null
			}
		});

	} catch (error) {
		console.error('Error logging activity:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to log activity'
		});
	}
});

/**
 * @route GET /api/activity/streak
 * @desc Get current user's streak information
 * @access Private
 */
router.get('/streak', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.id;
		const streakData = await streakService.getUserStreak(userId);

		res.status(200).json({
			success: true,
			data: streakData
		});

	} catch (error) {
		console.error('Error fetching user streak:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch streak information'
		});
	}
});

/**
 * @route GET /api/activity/streak/:userId
 * @desc Get specific user's streak information (admin or self)
 * @access Private
 */
router.get('/streak/:userId', authMiddleware, async (req, res) => {
	try {
		const { userId } = req.params;
		const requesterId = req.user.id;

		// Allow users to view their own streak or admin to view any
		if (userId !== requesterId && req.user.role !== 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Not authorized to view this user\'s streak'
			});
		}

		const streakData = await streakService.getUserStreak(userId);

		res.status(200).json({
			success: true,
			data: streakData
		});

	} catch (error) {
		console.error('Error fetching user streak:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch streak information'
		});
	}
});

/**
 * @route GET /api/activity/leaderboard
 * @desc Get streak leaderboard
 * @access Private
 */
router.get('/leaderboard', authMiddleware, async (req, res) => {
	try {
		const { limit = 10, type = 'current' } = req.query;

		if (!['current', 'longest'].includes(type)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid leaderboard type. Use "current" or "longest"'
			});
		}

		const leaderboard = await streakService.getStreakLeaderboard(
			Math.min(parseInt(limit), 50), // Cap at 50 users
			type
		);

		res.status(200).json({
			success: true,
			data: {
				type,
				leaderboard
			}
		});

	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch leaderboard'
		});
	}
});

/**
 * @route POST /api/activity/streak/reset
 * @desc Reset user's streak (admin only)
 * @access Private - Admin
 */
router.post('/streak/reset', authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Admin access required'
			});
		}

		const { userId } = req.body;

		if (!userId) {
			return res.status(400).json({
				success: false,
				message: 'userId is required'
			});
		}

		const result = await streakService.resetUserStreak(userId);

		res.status(200).json(result);

	} catch (error) {
		console.error('Error resetting user streak:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to reset user streak'
		});
	}
});

/**
 * @route GET /api/activity/stats
 * @desc Get user's activity statistics
 * @access Private
 */
router.get('/stats', authMiddleware, async (req, res) => {
	try {
		const userId = req.user.id;
		const stats = await streakService.getUserActivityStats(userId);

		res.status(200).json({
			success: true,
			data: stats
		});

	} catch (error) {
		console.error('Error fetching activity stats:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch activity statistics'
		});
	}
});

/**
 * @route GET /api/activity/stats/bulk
 * @desc Get activity statistics for multiple users (admin or friends)
 * @access Private
 */
router.get('/stats/bulk', authMiddleware, async (req, res) => {
	try {
		const { userIds } = req.query;

		if (!userIds) {
			return res.status(400).json({
				success: false,
				message: 'userIds query parameter is required'
			});
		}

		const userIdArray = userIds.split(',').map(id => id.trim());

		// Limit to prevent abuse
		if (userIdArray.length > 20) {
			return res.status(400).json({
				success: false,
				message: 'Maximum 20 users allowed per request'
			});
		}

		const stats = await streakService.getMultipleUserStreaks(userIdArray);

		res.status(200).json({
			success: true,
			data: stats
		});

	} catch (error) {
		console.error('Error fetching bulk activity stats:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch bulk activity statistics'
		});
	}
});

/**
 * @route GET /api/activity/validate/:activityType
 * @desc Validate if an activity type is supported
 * @access Private
 */
router.get('/validate/:activityType', authMiddleware, async (req, res) => {
	try {
		const { activityType } = req.params;
		const isValid = streakService.isValidActivityType(activityType);

		res.status(200).json({
			success: true,
			data: {
				activityType,
				isValid,
				validTypes: [
					'create_look',
					'virtual_tryon',
					'share_look',
					'rate_outfit',
					'browse_collection',
					'update_profile',
					'general'
				]
			}
		});

	} catch (error) {
		console.error('Error validating activity type:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to validate activity type'
		});
	}
});

export default router;
