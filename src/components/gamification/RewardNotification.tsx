import React, { useEffect, useState } from 'react'
import { MilestoneReward } from '../../services/streak'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import './RewardNotification.css'

interface RewardNotificationProps {
	rewards: MilestoneReward[]
	onClose: () => void
	autoClose?: boolean
	autoCloseDelay?: number
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({
	rewards,
	onClose,
	autoClose = true,
	autoCloseDelay = 5000
}) => {
	const [isVisible, setIsVisible] = useState(false)
	const [currentRewardIndex, setCurrentRewardIndex] = useState(0)

	useEffect(() => {
		if (rewards.length > 0) {
			setIsVisible(true)

			if (autoClose) {
				const timer = setTimeout(() => {
					handleClose()
				}, autoCloseDelay)

				return () => clearTimeout(timer)
			}
		}
	}, [rewards, autoClose, autoCloseDelay])

	useEffect(() => {
		if (rewards.length > 1) {
			const interval = setInterval(() => {
				setCurrentRewardIndex((prev) => (prev + 1) % rewards.length)
			}, 3000)

			return () => clearInterval(interval)
		}
	}, [rewards.length])

	const handleClose = () => {
		setIsVisible(false)
		setTimeout(onClose, 300) // Wait for animation to complete
	}

	if (rewards.length === 0) return null

	const currentReward = rewards[currentRewardIndex]

	return (
		<div className={`reward-notification-overlay ${isVisible ? 'visible' : ''}`}>
			<div className="reward-notification-backdrop" onClick={handleClose} />

			<div className={`reward-notification ${isVisible ? 'show' : ''}`}>
				<Card className="reward-card">
					<button
						className="close-btn"
						onClick={handleClose}
						aria-label="Close notification"
					>
						✕
					</button>

					<div className="reward-header">
						<div className="celebration-icon">🎉</div>
						<h2 className="reward-title">Congratulations!</h2>
						<p className="reward-subtitle">You've unlocked a new reward!</p>
					</div>

					<div className="reward-content">
						<div className="reward-item">
							<div className="item-icon">
								{getItemIcon(currentReward.virtualItem.category)}
							</div>
							<div className="item-info">
								<h3 className="item-name">{currentReward.virtualItem.name}</h3>
								<p className="item-description">
									{currentReward.virtualItem.description ||
										`Unlocked by reaching ${currentReward.milestone.threshold} day streak!`}
								</p>
							</div>
						</div>

						<div className="milestone-info">
							<Badge variant="success">{currentReward.milestone.title}</Badge>
							<p className="milestone-description">
								{currentReward.milestone.description}
							</p>
						</div>

						{rewards.length > 1 && (
							<div className="multiple-rewards-indicator">
								<span>Reward {currentRewardIndex + 1} of {rewards.length}</span>
								<div className="reward-dots">
									{rewards.map((_, index) => (
										<div
											key={index}
											className={`dot ${index === currentRewardIndex ? 'active' : ''}`}
										/>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="reward-actions">
						<button
							className="action-btn secondary"
							onClick={handleClose}
						>
							Continue
						</button>
						<button
							className="action-btn primary"
							onClick={() => {
								// Navigate to inventory or rewards page
								window.location.href = '/rewards'
							}}
						>
							View Inventory
						</button>
					</div>
				</Card>
			</div>
		</div>
	)
}

// Helper function to get appropriate icon for item category
function getItemIcon(category: string): string {
	switch (category.toLowerCase()) {
		case 'accessory':
		case 'accessories':
			return '👓'
		case 'clothing':
		case 'apparel':
			return '👕'
		case 'shoes':
		case 'footwear':
			return '👟'
		case 'jewelry':
			return '💎'
		case 'hat':
		case 'headwear':
			return '🎩'
		case 'bag':
		case 'bags':
			return '👜'
		case 'achievement':
		case 'badge':
			return '🏆'
		default:
			return '🎁'
	}
}

interface RewardToastProps {
	reward: MilestoneReward
	isVisible: boolean
	onClose: () => void
}

export const RewardToast: React.FC<RewardToastProps> = ({
	reward,
	isVisible,
	onClose
}) => {
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(onClose, 4000)
			return () => clearTimeout(timer)
		}
	}, [isVisible, onClose])

	return (
		<div className={`reward-toast ${isVisible ? 'show' : ''}`}>
			<div className="toast-content">
				<div className="toast-icon">
					{getItemIcon(reward.virtualItem.category)}
				</div>
				<div className="toast-text">
					<div className="toast-title">New Reward!</div>
					<div className="toast-message">{reward.virtualItem.name}</div>
				</div>
				<button className="toast-close" onClick={onClose}>×</button>
			</div>
		</div>
	)
}
