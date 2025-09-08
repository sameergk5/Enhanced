import React, { useEffect, useState } from 'react'
import { useReward } from '../../contexts/RewardContext'
import {
	fetchStreak,
	formatStreakMessage,
	getNextMilestone,
	getStreakIcon,
	logActivity,
	StreakInfo
} from '../../services/streak'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import './StreakDisplay.css'

interface StreakDisplayProps {
	showActions?: boolean
	compact?: boolean
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
	showActions = true,
	compact = false
}) => {
	const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)
	const [loading, setLoading] = useState(true)
	const [activityLoading, setActivityLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const { showReward } = useReward()

	const loadStreakInfo = async () => {
		try {
			setLoading(true)
			setError(null)
			const data = await fetchStreak()
			setStreakInfo(data)
		} catch (err) {
			setError('Failed to load streak information')
			console.error('Error loading streak:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleLogActivity = async (activityType: string = 'general') => {
		if (!streakInfo || activityLoading) return

		try {
			setActivityLoading(true)
			const response = await logActivity(activityType)

			setStreakInfo(response.data.streak)

			// Check for new rewards
			if (response.data.milestones && response.data.milestones.length > 0) {
				showReward(response.data.milestones)
			}

		} catch (err) {
			setError('Failed to log activity')
			console.error('Error logging activity:', err)
		} finally {
			setActivityLoading(false)
		}
	}

	useEffect(() => {
		loadStreakInfo()
	}, [])

	if (loading) {
		return (
			<Card className={`streak-display ${compact ? 'compact' : ''}`}>
				<LoadingSpinner size="sm" />
			</Card>
		)
	}

	if (error || !streakInfo) {
		return (
			<Card className={`streak-display ${compact ? 'compact' : ''} error`}>
				<div className="error-content">
					<span>⚠️</span>
					<p>{error || 'Unable to load streak'}</p>
					<button onClick={loadStreakInfo} className="retry-btn">
						Try Again
					</button>
				</div>
			</Card>
		)
	}

	const streakIcon = getStreakIcon(streakInfo)
	const nextMilestone = getNextMilestone(streakInfo.currentStreak)
	const progressToNext = streakInfo.currentStreak > 0 ?
		(streakInfo.currentStreak / nextMilestone) * 100 : 0

	if (compact) {
		return (
			<div className="streak-display compact">
				<div className="streak-compact-content">
					<span className="streak-icon">{streakIcon}</span>
					<span className="streak-count">{streakInfo.currentStreak}</span>
					{streakInfo.hasActiveStreak && (
						<Badge variant="success">Active</Badge>
					)}
				</div>
			</div>
		)
	}

	return (
		<Card className="streak-display">
			<div className="streak-header">
				<div className="streak-main">
					<div className="streak-icon-large">{streakIcon}</div>
					<div className="streak-info">
						<div className="streak-count-large">{streakInfo.currentStreak}</div>
						<div className="streak-label">Day Streak</div>
					</div>
				</div>
				<div className="streak-status">
					{streakInfo.hasActiveStreak ? (
						<Badge variant="success">Active</Badge>
					) : (
						<Badge variant="secondary">Inactive</Badge>
					)}
				</div>
			</div>

			<div className="streak-message">
				{formatStreakMessage(streakInfo)}
			</div>

			<div className="streak-stats">
				<div className="stat">
					<div className="stat-value">{streakInfo.longestStreak}</div>
					<div className="stat-label">Longest</div>
				</div>
				<div className="stat">
					<div className="stat-value">{streakInfo.totalActivities}</div>
					<div className="stat-label">Total</div>
				</div>
				<div className="stat">
					<div className="stat-value">{nextMilestone}</div>
					<div className="stat-label">Next Goal</div>
				</div>
			</div>

			{streakInfo.currentStreak > 0 && (
				<div className="progress-section">
					<div className="progress-header">
						<span>Progress to {nextMilestone} days</span>
						<span>{streakInfo.currentStreak}/{nextMilestone}</span>
					</div>
					<div className="progress-bar">
						<div
							className="progress-fill"
							style={{ width: `${Math.min(progressToNext, 100)}%` }}
						/>
					</div>
				</div>
			)}

			{showActions && (
				<div className="streak-actions">
					<button
						onClick={() => handleLogActivity('general')}
						disabled={activityLoading}
						className="activity-btn primary"
					>
						{activityLoading ? <LoadingSpinner size="sm" /> : '📝'} Log Activity
					</button>

					<button
						onClick={() => handleLogActivity('create_look')}
						disabled={activityLoading}
						className="activity-btn secondary"
					>
						{activityLoading ? <LoadingSpinner size="sm" /> : '👕'} Create Look
					</button>

					<button
						onClick={() => handleLogActivity('virtual_tryon')}
						disabled={activityLoading}
						className="activity-btn secondary"
					>
						{activityLoading ? <LoadingSpinner size="sm" /> : '👓'} Try On
					</button>
				</div>
			)}

			{streakInfo.lastActivityDate && (
				<div className="last-activity">
					Last activity: {new Date(streakInfo.lastActivityDate).toLocaleDateString()}
					{streakInfo.lastActivityType && ` (${streakInfo.lastActivityType})`}
				</div>
			)}
		</Card>
	)
}
