import { jest } from '@jest/globals';

// Mock Prisma Client
const mockPrismaClient = {
	userStreak: {
		findUnique: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		findMany: jest.fn(),
	},
	user: {
		findUnique: jest.fn(),
	}
};

// Mock Prisma
jest.unstable_mockModule('@prisma/client', () => ({
	PrismaClient: jest.fn(() => mockPrismaClient)
}));

const { default: StreakService } = await import('../src/services/streakService.js');

describe('StreakService', () => {
	let streakService;

	beforeEach(() => {
		streakService = new StreakService();
		// Clear all mocks
		jest.clearAllMocks();
	});

	describe('calculateStreak', () => {
		test('should maintain streak for same day activity', () => {
			const result = streakService.calculateStreak('2024-01-15', '2024-01-15', 5);

			expect(result).toEqual({
				newStreak: 5,
				increased: false,
				reset: false,
				message: 'Activity logged for today. Streak maintained.'
			});
		});

		test('should increment streak for consecutive day activity', () => {
			const result = streakService.calculateStreak('2024-01-14', '2024-01-15', 5);

			expect(result).toEqual({
				newStreak: 6,
				increased: true,
				reset: false,
				message: 'Streak increased to 6 days!'
			});
		});

		test('should reset streak for missed days', () => {
			const result = streakService.calculateStreak('2024-01-13', '2024-01-15', 5);

			expect(result).toEqual({
				newStreak: 1,
				increased: false,
				reset: true,
				message: 'Streak reset due to missed days. Starting fresh!'
			});
		});
	});

	describe('logActivity', () => {
		test('should create new streak for first-time user', async () => {
			const userId = 'user123';
			const activityType = 'create_look';

			mockPrismaClient.userStreak.findUnique.mockResolvedValue(null);
			mockPrismaClient.userStreak.create.mockResolvedValue({
				id: 'streak123',
				userId,
				currentStreak: 1,
				longestStreak: 1,
				lastActivityDate: new Date('2024-01-15'),
				totalActivities: 1,
				lastActivityType: activityType
			});

			const result = await streakService.logActivity(userId, activityType);

			expect(mockPrismaClient.userStreak.findUnique).toHaveBeenCalledWith({
				where: { userId }
			});
			expect(mockPrismaClient.userStreak.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					userId,
					currentStreak: 1,
					longestStreak: 1,
					totalActivities: 1,
					lastActivityType: activityType
				})
			});
			expect(result.success).toBe(true);
			expect(result.streakIncreased).toBe(true);
			expect(result.isNewRecord).toBe(true);
		});

		test('should update existing streak for consecutive day', async () => {
			const userId = 'user123';
			const activityType = 'virtual_tryon';

			const existingStreak = {
				id: 'streak123',
				userId,
				currentStreak: 5,
				longestStreak: 10,
				lastActivityDate: new Date('2024-01-14'),
				totalActivities: 20,
				lastActivityType: 'create_look'
			};

			mockPrismaClient.userStreak.findUnique.mockResolvedValue(existingStreak);
			mockPrismaClient.userStreak.update.mockResolvedValue({
				...existingStreak,
				currentStreak: 6,
				totalActivities: 21,
				lastActivityDate: new Date('2024-01-15'),
				lastActivityType: activityType
			});

			// Mock current date to be 2024-01-15
			jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-15').getTime());

			const result = await streakService.logActivity(userId, activityType);

			expect(mockPrismaClient.userStreak.update).toHaveBeenCalledWith({
				where: { userId },
				data: expect.objectContaining({
					currentStreak: 6,
					longestStreak: 10, // Should remain the same
					totalActivities: 21,
					lastActivityType: activityType
				})
			});
			expect(result.success).toBe(true);
			expect(result.streakIncreased).toBe(true);
			expect(result.isNewRecord).toBe(false);

			Date.now.mockRestore();
		});

		test('should reset streak for missed days', async () => {
			const userId = 'user123';
			const activityType = 'share_look';

			const existingStreak = {
				id: 'streak123',
				userId,
				currentStreak: 5,
				longestStreak: 10,
				lastActivityDate: new Date('2024-01-13'),
				totalActivities: 20,
				lastActivityType: 'create_look'
			};

			mockPrismaClient.userStreak.findUnique.mockResolvedValue(existingStreak);
			mockPrismaClient.userStreak.update.mockResolvedValue({
				...existingStreak,
				currentStreak: 1,
				totalActivities: 21,
				lastActivityDate: new Date('2024-01-15'),
				lastActivityType: activityType
			});

			// Mock current date to be 2024-01-15
			jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-15').getTime());

			const result = await streakService.logActivity(userId, activityType);

			expect(mockPrismaClient.userStreak.update).toHaveBeenCalledWith({
				where: { userId },
				data: expect.objectContaining({
					currentStreak: 1,
					longestStreak: 10, // Should remain the same
					totalActivities: 21,
					lastActivityType: activityType
				})
			});
			expect(result.success).toBe(true);
			expect(result.streakIncreased).toBe(false);
			expect(result.streakReset).toBe(true);

			Date.now.mockRestore();
		});

		test('should maintain streak for same day activity', async () => {
			const userId = 'user123';
			const activityType = 'rate_outfit';

			const existingStreak = {
				id: 'streak123',
				userId,
				currentStreak: 5,
				longestStreak: 10,
				lastActivityDate: new Date('2024-01-15'),
				totalActivities: 20,
				lastActivityType: 'create_look'
			};

			mockPrismaClient.userStreak.findUnique.mockResolvedValue(existingStreak);
			mockPrismaClient.userStreak.update.mockResolvedValue({
				...existingStreak,
				totalActivities: 21,
				lastActivityDate: new Date('2024-01-15'),
				lastActivityType: activityType
			});

			// Mock current date to be 2024-01-15
			jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-15').getTime());

			const result = await streakService.logActivity(userId, activityType);

			expect(mockPrismaClient.userStreak.update).toHaveBeenCalledWith({
				where: { userId },
				data: expect.objectContaining({
					currentStreak: 5, // Should remain the same
					longestStreak: 10,
					totalActivities: 21,
					lastActivityType: activityType
				})
			});
			expect(result.success).toBe(true);
			expect(result.streakIncreased).toBe(false);
			expect(result.streakReset).toBe(false);

			Date.now.mockRestore();
		});

		test('should update longest streak when current exceeds it', async () => {
			const userId = 'user123';
			const activityType = 'browse_collection';

			const existingStreak = {
				id: 'streak123',
				userId,
				currentStreak: 10,
				longestStreak: 10,
				lastActivityDate: new Date('2024-01-14'),
				totalActivities: 20,
				lastActivityType: 'create_look'
			};

			mockPrismaClient.userStreak.findUnique.mockResolvedValue(existingStreak);
			mockPrismaClient.userStreak.update.mockResolvedValue({
				...existingStreak,
				currentStreak: 11,
				longestStreak: 11,
				totalActivities: 21,
				lastActivityDate: new Date('2024-01-15'),
				lastActivityType: activityType
			});

			// Mock current date to be 2024-01-15
			jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-15').getTime());

			const result = await streakService.logActivity(userId, activityType);

			expect(mockPrismaClient.userStreak.update).toHaveBeenCalledWith({
				where: { userId },
				data: expect.objectContaining({
					currentStreak: 11,
					longestStreak: 11, // Should be updated
					totalActivities: 21,
					lastActivityType: activityType
				})
			});
			expect(result.success).toBe(true);
			expect(result.isNewRecord).toBe(true);

			Date.now.mockRestore();
		});

		test('should handle database errors gracefully', async () => {
			const userId = 'user123';
			const activityType = 'create_look';

			mockPrismaClient.userStreak.findUnique.mockRejectedValue(new Error('Database connection failed'));

			await expect(streakService.logActivity(userId, activityType))
				.rejects.toThrow('Failed to log activity and update streak');
		});
	});

	describe('getUserStreak', () => {
		test('should return streak data for existing user', async () => {
			const userId = 'user123';
			const streakData = {
				id: 'streak123',
				userId,
				currentStreak: 5,
				longestStreak: 10,
				lastActivityDate: new Date('2024-01-15'),
				totalActivities: 20,
				lastActivityType: 'create_look'
			};

			mockPrismaClient.userStreak.findUnique.mockResolvedValue(streakData);

			// Mock current date to be 2024-01-15 (same day as last activity)
			jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-15').getTime());

			const result = await streakService.getUserStreak(userId);

			expect(result).toEqual(expect.objectContaining({
				...streakData,
				hasActiveStreak: true,
				daysSinceLastActivity: 0
			}));

			Date.now.mockRestore();
		});

		test('should return default data for non-existent user', async () => {
			const userId = 'user123';

			mockPrismaClient.userStreak.findUnique.mockResolvedValue(null);

			const result = await streakService.getUserStreak(userId);

			expect(result).toEqual({
				currentStreak: 0,
				longestStreak: 0,
				totalActivities: 0,
				lastActivityDate: null,
				lastActivityType: null,
				hasActiveStreak: false
			});
		});

		test('should detect inactive streak', async () => {
			const userId = 'user123';
			const streakData = {
				id: 'streak123',
				userId,
				currentStreak: 5,
				longestStreak: 10,
				lastActivityDate: new Date('2024-01-13'),
				totalActivities: 20,
				lastActivityType: 'create_look'
			};

			mockPrismaClient.userStreak.findUnique.mockResolvedValue(streakData);

			// Mock current date to be 2024-01-15 (2 days after last activity)
			jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-15').getTime());

			const result = await streakService.getUserStreak(userId);

			expect(result).toEqual(expect.objectContaining({
				...streakData,
				hasActiveStreak: false,
				daysSinceLastActivity: 2
			}));

			Date.now.mockRestore();
		});
	});

	describe('getStreakLeaderboard', () => {
		test('should return current streak leaderboard', async () => {
			const leaderboardData = [
				{
					id: 'streak1',
					userId: 'user1',
					currentStreak: 15,
					longestStreak: 20,
					totalActivities: 100,
					lastActivityDate: new Date('2024-01-15'),
					user: { id: 'user1', username: 'alice', firstName: 'Alice', lastName: 'Smith' }
				},
				{
					id: 'streak2',
					userId: 'user2',
					currentStreak: 10,
					longestStreak: 15,
					totalActivities: 80,
					lastActivityDate: new Date('2024-01-15'),
					user: { id: 'user2', username: 'bob', firstName: 'Bob', lastName: 'Johnson' }
				}
			];

			mockPrismaClient.userStreak.findMany.mockResolvedValue(leaderboardData);

			const result = await streakService.getStreakLeaderboard(10, 'current');

			expect(mockPrismaClient.userStreak.findMany).toHaveBeenCalledWith({
				orderBy: { currentStreak: 'desc' },
				take: 10,
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

			expect(result).toHaveLength(2);
			expect(result[0]).toEqual(expect.objectContaining({
				rank: 1,
				userId: 'user1',
				currentStreak: 15
			}));
		});

		test('should return longest streak leaderboard', async () => {
			const leaderboardData = [
				{
					id: 'streak1',
					userId: 'user1',
					currentStreak: 10,
					longestStreak: 25,
					totalActivities: 100,
					lastActivityDate: new Date('2024-01-15'),
					user: { id: 'user1', username: 'alice', firstName: 'Alice', lastName: 'Smith' }
				}
			];

			mockPrismaClient.userStreak.findMany.mockResolvedValue(leaderboardData);

			const result = await streakService.getStreakLeaderboard(10, 'longest');

			expect(mockPrismaClient.userStreak.findMany).toHaveBeenCalledWith({
				orderBy: { longestStreak: 'desc' },
				take: 10,
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

			expect(result[0]).toEqual(expect.objectContaining({
				rank: 1,
				longestStreak: 25
			}));
		});
	});

	describe('resetUserStreak', () => {
		test('should reset user streak successfully', async () => {
			const userId = 'user123';
			const updatedStreak = {
				id: 'streak123',
				userId,
				currentStreak: 0,
				longestStreak: 10,
				lastActivityDate: new Date('2024-01-15'),
				totalActivities: 20,
				lastActivityType: 'reset'
			};

			mockPrismaClient.userStreak.update.mockResolvedValue(updatedStreak);

			const result = await streakService.resetUserStreak(userId);

			expect(mockPrismaClient.userStreak.update).toHaveBeenCalledWith({
				where: { userId },
				data: expect.objectContaining({
					currentStreak: 0,
					lastActivityType: 'reset'
				})
			});

			expect(result).toEqual({
				success: true,
				message: 'User streak has been reset',
				streak: updatedStreak
			});
		});
	});

	describe('isValidActivityType', () => {
		test('should validate correct activity types', () => {
			const validTypes = [
				'create_look',
				'virtual_tryon',
				'share_look',
				'rate_outfit',
				'browse_collection',
				'update_profile',
				'general'
			];

			validTypes.forEach(type => {
				expect(streakService.isValidActivityType(type)).toBe(true);
			});
		});

		test('should reject invalid activity types', () => {
			const invalidTypes = [
				'invalid_type',
				'random_activity',
				'',
				null,
				undefined
			];

			invalidTypes.forEach(type => {
				expect(streakService.isValidActivityType(type)).toBe(false);
			});
		});
	});

	describe('utility methods', () => {
		test('getDateString should format date correctly', () => {
			const date = new Date('2024-01-15T10:30:00.000Z');
			const result = streakService.getDateString(date);
			expect(result).toBe('2024-01-15');
		});

		test('getDaysDifference should calculate difference correctly', () => {
			expect(streakService.getDaysDifference('2024-01-13', '2024-01-15')).toBe(2);
			expect(streakService.getDaysDifference('2024-01-15', '2024-01-13')).toBe(2);
			expect(streakService.getDaysDifference('2024-01-15', '2024-01-15')).toBe(0);
		});
	});
});

describe('StreakService Integration (without database)', () => {
	test('should handle complete workflow without database errors', async () => {
		const streakService = new StreakService();

		// Test utility methods that don't require database
		expect(streakService.isValidActivityType('create_look')).toBe(true);
		expect(streakService.getDateString(new Date('2024-01-15'))).toBe('2024-01-15');
		expect(streakService.getDaysDifference('2024-01-13', '2024-01-15')).toBe(2);

		// Test streak calculation logic
		const streakResult = streakService.calculateStreak('2024-01-14', '2024-01-15', 5);
		expect(streakResult.newStreak).toBe(6);
		expect(streakResult.increased).toBe(true);
	});
});
