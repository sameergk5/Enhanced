import React, { createContext, ReactNode, useContext } from 'react'
import { MilestoneReward } from '../services/streak'

interface RewardContextType {
	showReward: (rewards: MilestoneReward[]) => void
}

const RewardContext = createContext<RewardContextType | undefined>(undefined)

interface RewardProviderProps {
	children: ReactNode
	onRewardUnlocked: (rewards: MilestoneReward[]) => void
}

export const RewardProvider: React.FC<RewardProviderProps> = ({
	children,
	onRewardUnlocked
}) => {
	const showReward = (rewards: MilestoneReward[]) => {
		onRewardUnlocked(rewards)
	}

	return (
		<RewardContext.Provider value={{ showReward }}>
			{children}
		</RewardContext.Provider>
	)
}

export const useReward = (): RewardContextType => {
	const context = useContext(RewardContext)
	if (context === undefined) {
		throw new Error('useReward must be used within a RewardProvider')
	}
	return context
}
