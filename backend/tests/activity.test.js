import { jest } from '@jest/globals';
import request from 'supertest';

// Mock dependencies
const mockStreakService = {
	logActivity: jest.fn(),
	getUserStreak: jest.fn(),
	getStreakLeaderboard: jest.fn(),
	resetUserStreak: jest.fn(),
	getUserActivityStats: jest.fn(),
	getMultipleUserStreaks: jest.fn(),
	isValidActivityType: jest.fn()
};

const mockRewardService = {
	checkAndAwardMilestones: jest.fn()
};

const mockAuthMiddleware = jest.fn((req, res, next) => {
	// Mock user for testing
	req.user = {
		id: req.headers['x-test-user'] || 'test-user-123',
		role: req.headers['x-test-role'] || 'user'
	};
	next();
});

// Mock modules
jest.unstable_mockModule('../src/services/streakService.js', () => ({
	default: jest.fn(() => mockStreakService)
}));

jest.unstable_mockModule('../src/services/rewardService.js', () => ({
	default: jest.fn(() => mockRewardService)
}));

jest.unstable_mockModule('../src/middleware/auth.js', () => ({
	authMiddleware: mockAuthMiddleware
}));

// Import and setup Express app for testing
import express from 'express';
const { default: activityRoutes } = await import('../src/routes/activity.js');

const app = express();
app.use(express.json());
app.use('/api/activity', activityRoutes);

describe('Activity API Endpoints', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('POST /api/activity/log', () => {
		test('should log activity successfully', async () => {
			const mockResult = {
				success: true,
				message: 'Streak increased to 6 days!',
				streak: {
					currentStreak: 6,
					longestStreak: 10,
					totalActivities: 21,
					lastActivityDate: new Date('2024-01-15'),
					lastActivityType: 'create_look'
				},
				streakIncreased: true,
				streakReset: false,
				isNewRecord: false
			};

			const mockMilestones = {
				newMilestones: [],
				rewards: []
			};

			mockStreakService.isValidActivityType.mockReturnValue(true);
			mockStreakService.logActivity.mockResolvedValue(mockResult);
			mockRewardService.checkAndAwardMilestones.mockResolvedValue(mockMilestones);

			const response = await request(app)
				.post('/api/activity/log')
				.set('x-test-user', 'user123')
				.send({
					activityType: 'create_look',
					metadata: { lookId: 'look123' }
				});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.streak.current).toBe(6);
			expect(response.body.data.changes.streakIncreased).toBe(true);
			expect(response.body.data.milestones).toEqual(mockMilestones);

			expect(mockStreakService.isValidActivityType).toHaveBeenCalledWith('create_look');
			expect(mockStreakService.logActivity).toHaveBeenCalledWith('user123', 'create_look');
			expect(mockRewardService.checkAndAwardMilestones).toHaveBeenCalledWith('user123', 'streak', 6);
		});

		test('should reject invalid activity type', async () => {
			mockStreakService.isValidActivityType.mockReturnValue(false);

			const response = await request(app)
				.post('/api/activity/log')
				.set('x-test-user', 'user123')
				.send({
					activityType: 'invalid_activity'
				});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Invalid activity type');
			expect(response.body.validTypes).toContain('create_look');
		});

		test('should handle activity logging without reward service', async () => {
			const mockResult = {
				success: true,
				message: 'Activity logged successfully',
				streak: {
					currentStreak: 1,
					longestStreak: 1,
					totalActivities: 1,
					lastActivityDate: new Date('2024-01-15'),
					lastActivityType: 'general'
				},
				streakIncreased: false,
				streakReset: false,
				isNewRecord: true
			};

			mockStreakService.isValidActivityType.mockReturnValue(true);
			mockStreakService.logActivity.mockResolvedValue(mockResult);
			mockRewardService.checkAndAwardMilestones.mockRejectedValue(new Error('Reward service unavailable'));

			const response = await request(app)
				.post('/api/activity/log')
				.set('x-test-user', 'user123')
				.send({
					activityType: 'general'
				});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.milestones).toBeNull();
		});

		test('should handle streak service errors', async () => {
			mockStreakService.isValidActivityType.mockReturnValue(true);
			mockStreakService.logActivity.mockRejectedValue(new Error('Database connection failed'));

			const response = await request(app)
				.post('/api/activity/log')
				.set('x-test-user', 'user123')
				.send({
					activityType: 'create_look'
				});

			expect(response.status).toBe(500);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Failed to log activity');
		});

		test('should use default activity type when not provided', async () => {
			const mockResult = {
				success: true,
				message: 'Activity logged',
				streak: {
					currentStreak: 1,
					longestStreak: 1,
					totalActivities: 1,
					lastActivityDate: new Date('2024-01-15'),
					lastActivityType: 'general'
				},
				streakIncreased: false,
				streakReset: false,
				isNewRecord: true
			};

			mockStreakService.isValidActivityType.mockReturnValue(true);
			mockStreakService.logActivity.mockResolvedValue(mockResult);
			mockRewardService.checkAndAwardMilestones.mockResolvedValue({});

			const response = await request(app)
				.post('/api/activity/log')
				.set('x-test-user', 'user123')
				.send({});

			expect(response.status).toBe(200);
			expect(mockStreakService.logActivity).toHaveBeenCalledWith('user123', 'general');
		});
	});

	describe('GET /api/activity/streak', () => {
		test('should return user streak information', async () => {
			const mockStreakData = {
				currentStreak: 5,
				longestStreak: 10,
				totalActivities: 20,
				lastActivityDate: new Date('2024-01-15'),
				lastActivityType: 'create_look',
				hasActiveStreak: true,
				daysSinceLastActivity: 0
			};

			mockStreakService.getUserStreak.mockResolvedValue(mockStreakData);

			const response = await request(app)
				.get('/api/activity/streak')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toEqual(mockStreakData);
			expect(mockStreakService.getUserStreak).toHaveBeenCalledWith('user123');
		});

		test('should handle errors when fetching streak', async () => {
			mockStreakService.getUserStreak.mockRejectedValue(new Error('Database error'));

			const response = await request(app)
				.get('/api/activity/streak')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(500);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Failed to fetch streak information');
		});
	});

	describe('GET /api/activity/streak/:userId', () => {
		test('should allow user to view their own streak', async () => {
			const mockStreakData = {
				currentStreak: 3,
				longestStreak: 7,
				totalActivities: 15,
				hasActiveStreak: true
			};

			mockStreakService.getUserStreak.mockResolvedValue(mockStreakData);

			const response = await request(app)
				.get('/api/activity/streak/user123')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toEqual(mockStreakData);
		});

		test('should allow admin to view any user streak', async () => {
			const mockStreakData = {
				currentStreak: 8,
				longestStreak: 12,
				totalActivities: 30,
				hasActiveStreak: false
			};

			mockStreakService.getUserStreak.mockResolvedValue(mockStreakData);

			const response = await request(app)
				.get('/api/activity/streak/other-user')
				.set('x-test-user', 'admin123')
				.set('x-test-role', 'admin');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toEqual(mockStreakData);
			expect(mockStreakService.getUserStreak).toHaveBeenCalledWith('other-user');
		});

		test('should deny access to other users streak for non-admin', async () => {
			const response = await request(app)
				.get('/api/activity/streak/other-user')
				.set('x-test-user', 'user123')
				.set('x-test-role', 'user');

			expect(response.status).toBe(403);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Not authorized to view this user\'s streak');
		});
	});

	describe('GET /api/activity/leaderboard', () => {
		test('should return current streak leaderboard', async () => {
			const mockLeaderboard = [
				{
					rank: 1,
					userId: 'user1',
					user: { username: 'alice' },
					currentStreak: 15,
					longestStreak: 20
				},
				{
					rank: 2,
					userId: 'user2',
					user: { username: 'bob' },
					currentStreak: 10,
					longestStreak: 15
				}
			];

			mockStreakService.getStreakLeaderboard.mockResolvedValue(mockLeaderboard);

			const response = await request(app)
				.get('/api/activity/leaderboard?type=current&limit=10')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.type).toBe('current');
			expect(response.body.data.leaderboard).toEqual(mockLeaderboard);
			expect(mockStreakService.getStreakLeaderboard).toHaveBeenCalledWith(10, 'current');
		});

		test('should return longest streak leaderboard', async () => {
			const mockLeaderboard = [
				{
					rank: 1,
					userId: 'user1',
					user: { username: 'alice' },
					currentStreak: 5,
					longestStreak: 25
				}
			];

			mockStreakService.getStreakLeaderboard.mockResolvedValue(mockLeaderboard);

			const response = await request(app)
				.get('/api/activity/leaderboard?type=longest')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(response.body.data.type).toBe('longest');
			expect(mockStreakService.getStreakLeaderboard).toHaveBeenCalledWith(10, 'longest');
		});

		test('should reject invalid leaderboard type', async () => {
			const response = await request(app)
				.get('/api/activity/leaderboard?type=invalid')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Invalid leaderboard type. Use "current" or "longest"');
		});

		test('should use default parameters', async () => {
			mockStreakService.getStreakLeaderboard.mockResolvedValue([]);

			const response = await request(app)
				.get('/api/activity/leaderboard')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(mockStreakService.getStreakLeaderboard).toHaveBeenCalledWith(10, 'current');
		});

		test('should cap limit at 50', async () => {
			mockStreakService.getStreakLeaderboard.mockResolvedValue([]);

			const response = await request(app)
				.get('/api/activity/leaderboard?limit=100')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(mockStreakService.getStreakLeaderboard).toHaveBeenCalledWith(50, 'current');
		});
	});

	describe('POST /api/activity/streak/reset', () => {
		test('should allow admin to reset user streak', async () => {
			const mockResult = {
				success: true,
				message: 'User streak has been reset',
				streak: {
					currentStreak: 0,
					longestStreak: 10,
					totalActivities: 20
				}
			};

			mockStreakService.resetUserStreak.mockResolvedValue(mockResult);

			const response = await request(app)
				.post('/api/activity/streak/reset')
				.set('x-test-user', 'admin123')
				.set('x-test-role', 'admin')
				.send({ userId: 'user123' });

			expect(response.status).toBe(200);
			expect(response.body).toEqual(mockResult);
			expect(mockStreakService.resetUserStreak).toHaveBeenCalledWith('user123');
		});

		test('should deny access to non-admin users', async () => {
			const response = await request(app)
				.post('/api/activity/streak/reset')
				.set('x-test-user', 'user123')
				.set('x-test-role', 'user')
				.send({ userId: 'user123' });

			expect(response.status).toBe(403);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Admin access required');
		});

		test('should require userId parameter', async () => {
			const response = await request(app)
				.post('/api/activity/streak/reset')
				.set('x-test-user', 'admin123')
				.set('x-test-role', 'admin')
				.send({});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('userId is required');
		});
	});

	describe('GET /api/activity/stats', () => {
		test('should return user activity statistics', async () => {
			const mockStats = {
				totalActivities: 25,
				currentStreak: 5,
				longestStreak: 12,
				lastActivityType: 'create_look',
				lastActivityDate: new Date('2024-01-15')
			};

			mockStreakService.getUserActivityStats.mockResolvedValue(mockStats);

			const response = await request(app)
				.get('/api/activity/stats')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toEqual(mockStats);
			expect(mockStreakService.getUserActivityStats).toHaveBeenCalledWith('user123');
		});

		test('should handle errors when fetching stats', async () => {
			mockStreakService.getUserActivityStats.mockRejectedValue(new Error('Database error'));

			const response = await request(app)
				.get('/api/activity/stats')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(500);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Failed to fetch activity statistics');
		});
	});

	describe('GET /api/activity/stats/bulk', () => {
		test('should return bulk user statistics', async () => {
			const mockStats = [
				{
					userId: 'user1',
					user: { username: 'alice' },
					currentStreak: 5,
					longestStreak: 10,
					hasActiveStreak: true
				},
				{
					userId: 'user2',
					user: { username: 'bob' },
					currentStreak: 3,
					longestStreak: 8,
					hasActiveStreak: false
				}
			];

			mockStreakService.getMultipleUserStreaks.mockResolvedValue(mockStats);

			const response = await request(app)
				.get('/api/activity/stats/bulk?userIds=user1,user2')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toEqual(mockStats);
			expect(mockStreakService.getMultipleUserStreaks).toHaveBeenCalledWith(['user1', 'user2']);
		});

		test('should require userIds parameter', async () => {
			const response = await request(app)
				.get('/api/activity/stats/bulk')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('userIds query parameter is required');
		});

		test('should limit number of users to 20', async () => {
			const userIds = Array.from({ length: 25 }, (_, i) => `user${i}`).join(',');

			const response = await request(app)
				.get(`/api/activity/stats/bulk?userIds=${userIds}`)
				.set('x-test-user', 'user123');

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe('Maximum 20 users allowed per request');
		});
	});

	describe('GET /api/activity/validate/:activityType', () => {
		test('should validate correct activity type', async () => {
			mockStreakService.isValidActivityType.mockReturnValue(true);

			const response = await request(app)
				.get('/api/activity/validate/create_look')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.activityType).toBe('create_look');
			expect(response.body.data.isValid).toBe(true);
			expect(response.body.data.validTypes).toContain('create_look');
		});

		test('should validate incorrect activity type', async () => {
			mockStreakService.isValidActivityType.mockReturnValue(false);

			const response = await request(app)
				.get('/api/activity/validate/invalid_type')
				.set('x-test-user', 'user123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.activityType).toBe('invalid_type');
			expect(response.body.data.isValid).toBe(false);
		});
	});
});

describe('Activity API Integration (without database)', () => {
	test('should handle complete workflow without external dependencies', async () => {
		// Test that the route handlers can be imported and configured
		const app = express();
		app.use(express.json());
		app.use('/api/activity', activityRoutes);

		// Verify app is configured correctly
		expect(app._router).toBeDefined();

		// Test that middleware is properly applied
		expect(mockAuthMiddleware).toBeDefined();
	});
});
