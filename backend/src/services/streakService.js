import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * StreakService - Handles all streak-related business logic
 * Manages user streak calculations, updates, and activity logging
 */
class StreakService {
	/**
	 * Log user activity and update streak accordingly
	 * @param {string} userId - User ID
	 * @param {string} activityType - Type of activity (e.g., 'create_look', 'virtual_tryon')
	 * @returns {Object} Updated streak information
	 */
	async logActivity(userId, activityType = 'general') {
		try {
			const now = new Date();
			const today = this.getDateString(now);

			// Get current user streak data
			let userStreak = await prisma.userStreak.findUnique({
				where: { userId }
			});

			// Create streak record if it doesn't exist
			if (!userStreak) {
				userStreak = await prisma.userStreak.create({
					data: {
						userId,
						currentStreak: 1,
						longestStreak: 1,
						lastActivityDate: now,
						totalActivities: 1,
						lastActivityType: activityType
					}
				});

				return {
					success: true,
					message: 'First activity logged! Streak started.',
					streak: userStreak,
					streakIncreased: true,
					isNewRecord: true
				};
			}

			// Calculate streak based on last activity date
			const lastActivityDate = this.getDateString(userStreak.lastActivityDate);
			const streakResult = this.calculateStreak(lastActivityDate, today, userStreak.currentStreak);

			// Update streak data
			const updatedStreak = await prisma.userStreak.update({
				where: { userId },
				data: {
					currentStreak: streakResult.newStreak,
					longestStreak: Math.max(userStreak.longestStreak, streakResult.newStreak),
					lastActivityDate: now,
					totalActivities: userStreak.totalActivities + 1,
					lastActivityType: activityType
				}
			});

			return {
				success: true,
				message: streakResult.message,
				streak: updatedStreak,
				streakIncreased: streakResult.increased,
				streakReset: streakResult.reset,
				isNewRecord: updatedStreak.currentStreak > userStreak.longestStreak
			};

		} catch (error) {
			console.error('Error logging activity:', error);
			throw new Error('Failed to log activity and update streak');
		}
	}

	/**
	 * Calculate new streak value based on activity dates
	 * @param {string} lastActivityDate - Last activity date (YYYY-MM-DD)
	 * @param {string} currentDate - Current date (YYYY-MM-DD)
	 * @param {number} currentStreak - Current streak value
	 * @returns {Object} Streak calculation result
	 */
	calculateStreak(lastActivityDate, currentDate, currentStreak) {
		const lastDate = new Date(lastActivityDate);
		const today = new Date(currentDate);
		const diffTime = today.getTime() - lastDate.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			// Same day activity - maintain streak
			return {
				newStreak: currentStreak,
				increased: false,
				reset: false,
				message: 'Activity logged for today. Streak maintained.'
			};
		} else if (diffDays === 1) {
			// Consecutive day - increment streak
			return {
				newStreak: currentStreak + 1,
				increased: true,
				reset: false,
				message: `Streak increased to ${currentStreak + 1} days!`
			};
		} else {
			// Gap in activity - reset streak
			return {
				newStreak: 1,
				increased: false,
				reset: true,
				message: 'Streak reset due to missed days. Starting fresh!'
			};
		}
	}

	/**
	 * Get user's current streak information
	 * @param {string} userId - User ID
	 * @returns {Object} User streak data
	 */
	async getUserStreak(userId) {
		try {
			const userStreak = await prisma.userStreak.findUnique({
				where: { userId }
			});

			if (!userStreak) {
				return {
					currentStreak: 0,
					longestStreak: 0,
					totalActivities: 0,
					lastActivityDate: null,
					lastActivityType: null,
					hasActiveStreak: false
				};
			}

			// Check if streak is still active (not broken by missing today)
			const today = this.getDateString(new Date());
			const lastActivity = this.getDateString(userStreak.lastActivityDate);
			const daysSinceActivity = this.getDaysDifference(lastActivity, today);

			const hasActiveStreak = daysSinceActivity <= 1;

			return {
				...userStreak,
				hasActiveStreak,
				daysSinceLastActivity: daysSinceActivity
			};

		} catch (error) {
			console.error('Error fetching user streak:', error);
			throw new Error('Failed to fetch user streak information');
		}
	}

	/**
	 * Get streak statistics for multiple users
	 * @param {Array} userIds - Array of user IDs
	 * @returns {Array} Array of user streak data
	 */
	async getMultipleUserStreaks(userIds) {
		try {
			const streaks = await prisma.userStreak.findMany({
				where: {
					userId: { in: userIds }
				},
				include: {
					user: {
						select: {
							id: true,
							username: true,
							firstName: true,
							lastName: true
						}
					}
				}
			});

			return streaks.map(streak => ({
				userId: streak.userId,
				user: streak.user,
				currentStreak: streak.currentStreak,
				longestStreak: streak.longestStreak,
				totalActivities: streak.totalActivities,
				lastActivityDate: streak.lastActivityDate,
				hasActiveStreak: this.getDaysDifference(
					this.getDateString(streak.lastActivityDate),
					this.getDateString(new Date())
				) <= 1
			}));

		} catch (error) {
			console.error('Error fetching multiple user streaks:', error);
			throw new Error('Failed to fetch user streak information');
		}
	}

	/**
	 * Get streak leaderboard
	 * @param {number} limit - Number of top users to return
	 * @param {string} type - 'current' or 'longest' streak
	 * @returns {Array} Leaderboard data
	 */
	async getStreakLeaderboard(limit = 10, type = 'current') {
		try {
			const orderBy = type === 'current' ? 'currentStreak' : 'longestStreak';

			const topStreaks = await prisma.userStreak.findMany({
				orderBy: { [orderBy]: 'desc' },
				take: limit,
				include: {
					user: {
						select: {
							id: true,
							username: true,
							firstName: true,
							lastName: true
						}
					}
				}
			});

			return topStreaks.map((streak, index) => ({
				rank: index + 1,
				userId: streak.userId,
				user: streak.user,
				currentStreak: streak.currentStreak,
				longestStreak: streak.longestStreak,
				totalActivities: streak.totalActivities,
				lastActivityDate: streak.lastActivityDate
			}));

		} catch (error) {
			console.error('Error fetching streak leaderboard:', error);
			throw new Error('Failed to fetch streak leaderboard');
		}
	}

	/**
	 * Reset user streak (admin function)
	 * @param {string} userId - User ID
	 * @returns {Object} Reset result
	 */
	async resetUserStreak(userId) {
		try {
			const updatedStreak = await prisma.userStreak.update({
				where: { userId },
				data: {
					currentStreak: 0,
					lastActivityDate: new Date(),
					lastActivityType: 'reset'
				}
			});

			return {
				success: true,
				message: 'User streak has been reset',
				streak: updatedStreak
			};

		} catch (error) {
			console.error('Error resetting user streak:', error);
			throw new Error('Failed to reset user streak');
		}
	}

	/**
	 * Get date string in YYYY-MM-DD format
	 * @param {Date} date - Date object
	 * @returns {string} Date string
	 */
	getDateString(date) {
		return date.toISOString().split('T')[0];
	}

	/**
	 * Calculate difference in days between two date strings
	 * @param {string} date1 - First date (YYYY-MM-DD)
	 * @param {string} date2 - Second date (YYYY-MM-DD)
	 * @returns {number} Difference in days
	 */
	getDaysDifference(date1, date2) {
		const d1 = new Date(date1);
		const d2 = new Date(date2);
		const diffTime = Math.abs(d2.getTime() - d1.getTime());
		return Math.floor(diffTime / (1000 * 60 * 60 * 24));
	}

	/**
	 * Validate activity type
	 * @param {string} activityType - Activity type to validate
	 * @returns {boolean} Is valid activity type
	 */
	isValidActivityType(activityType) {
		const validTypes = [
			'create_look',
			'virtual_tryon',
			'share_look',
			'rate_outfit',
			'browse_collection',
			'update_profile',
			'general'
		];
		return validTypes.includes(activityType);
	}

	/**
	 * Get activity type statistics for a user
	 * @param {string} userId - User ID
	 * @returns {Object} Activity statistics
	 */
	async getUserActivityStats(userId) {
		try {
			// This would require a separate ActivityLog table for detailed tracking
			// For now, return basic streak info
			const streak = await this.getUserStreak(userId);

			return {
				totalActivities: streak.totalActivities || 0,
				currentStreak: streak.currentStreak || 0,
				longestStreak: streak.longestStreak || 0,
				lastActivityType: streak.lastActivityType || null,
				lastActivityDate: streak.lastActivityDate || null
			};

		} catch (error) {
			console.error('Error fetching user activity stats:', error);
			throw new Error('Failed to fetch user activity statistics');
		}
	}
}

export default StreakService;
