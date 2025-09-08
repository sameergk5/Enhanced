import { apiRequest } from './api'

export interface StreakInfo {
	currentStreak: number
	longestStreak: number
	totalActivities: number
	lastActivityDate: string | null
	lastActivityType: string | null
	hasActiveStreak: boolean
	daysSinceLastActivity?: number
}

export interface ActivityLogResponse {
	success: boolean
	message: string
	data: {
		streak: StreakInfo
		changes: {
			streakIncreased: boolean
			streakReset: boolean
			isNewRecord: boolean
		}
		milestones: MilestoneReward[] | null
	}
}

export interface MilestoneReward {
	virtualItem: {
		id: string
		name: string
		category: string
		description?: string
	}
	milestone: {
		title: string
		description: string
		threshold: number
	}
}

export interface LeaderboardEntry {
	rank: number
	userId: string
	user: {
		username: string
		firstName?: string
		lastName?: string
	}
	currentStreak: number
	longestStreak: number
	totalActivities: number
}

export interface UserInventory {
	id: string
	virtualItem: {
		id: string
		name: string
		category: string
		description: string
		metadata: any
	}
	isEquipped: boolean
	obtainedAt: string
	source: string
}

// Activity API endpoints
export async function logActivity(
	activityType: string = 'general',
	metadata: any = {}
): Promise<ActivityLogResponse> {
	return apiRequest('/api/activity/log', {
		method: 'POST',
		body: JSON.stringify({ activityType, metadata })
	})
}

export async function fetchStreak(): Promise<StreakInfo> {
	return apiRequest('/api/activity/streak', { method: 'GET' })
}

export async function fetchUserStreak(userId?: string): Promise<StreakInfo> {
	const endpoint = userId ? `/api/activity/streak/${userId}` : '/api/activity/streak'
	return apiRequest(endpoint, { method: 'GET' })
}

export async function fetchLeaderboard(
	type: 'current' | 'longest' = 'current',
	limit: number = 10
): Promise<LeaderboardEntry[]> {
	const response = await apiRequest(`/api/activity/leaderboard?type=${type}&limit=${limit}`, {
		method: 'GET'
	})
	return response.data.leaderboard
}

export async function fetchActivityStats(): Promise<{
	totalActivities: number
	currentStreak: number
	longestStreak: number
	lastActivityType: string | null
	lastActivityDate: string | null
}> {
	const response = await apiRequest('/api/activity/stats', { method: 'GET' })
	return response.data
}

// Reward API endpoints
export async function fetchUserInventory(): Promise<UserInventory[]> {
	const response = await apiRequest('/api/rewards/inventory', { method: 'GET' })
	return response.data
}

export async function checkMilestones(): Promise<MilestoneReward[]> {
	const response = await apiRequest('/api/rewards/check-milestones', {
		method: 'POST'
	})
	return response.data || []
}

export async function fetchRewardMilestones(type: string = 'streak'): Promise<any[]> {
	const response = await apiRequest(`/api/rewards/milestones/${type}`, {
		method: 'GET'
	})
	return response.data
}

// Utility functions
export function formatStreakMessage(streakInfo: StreakInfo): string {
	if (streakInfo.currentStreak === 0) {
		return "Start your streak today!"
	} else if (streakInfo.hasActiveStreak) {
		return `${streakInfo.currentStreak} day streak! Keep it up!`
	} else {
		return `Your streak ended. Last streak: ${streakInfo.currentStreak} days`
	}
}

export function getStreakIcon(streakInfo: StreakInfo): string {
	if (streakInfo.currentStreak === 0) {
		return '⭐'
	} else if (streakInfo.currentStreak < 5) {
		return '🔥'
	} else if (streakInfo.currentStreak < 10) {
		return '🚀'
	} else if (streakInfo.currentStreak < 20) {
		return '💎'
	} else {
		return '👑'
	}
}

export function getNextMilestone(currentStreak: number): number {
	const milestones = [1, 3, 5, 7, 10, 15, 20, 25, 30, 50, 100]
	return milestones.find(milestone => milestone > currentStreak) || currentStreak + 10
}

// Legacy compatibility (kept for backward compatibility)
export async function pingStreak(): Promise<StreakInfo> {
	const response = await logActivity('general')
	return response.data.streak
}
