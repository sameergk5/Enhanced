import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import React from 'react'

interface AIStatusIndicatorProps {
	status: 'pending' | 'processing' | 'completed' | 'failed' | undefined
	className?: string
}

export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
	status,
	className = ''
}) => {
	const getIndicator = () => {
		switch (status) {
			case 'pending':
				return {
					icon: <Clock size={16} className="text-yellow-600" />,
					text: 'Analysis Queued',
					bgColor: 'bg-yellow-50',
					textColor: 'text-yellow-800',
					borderColor: 'border-yellow-200'
				}
			case 'processing':
				return {
					icon: <RefreshCw size={16} className="text-blue-600 animate-spin" />,
					text: 'Analyzing...',
					bgColor: 'bg-blue-50',
					textColor: 'text-blue-800',
					borderColor: 'border-blue-200'
				}
			case 'completed':
				return {
					icon: <CheckCircle size={16} className="text-green-600" />,
					text: 'Analysis Complete',
					bgColor: 'bg-green-50',
					textColor: 'text-green-800',
					borderColor: 'border-green-200'
				}
			case 'failed':
				return {
					icon: <AlertCircle size={16} className="text-red-600" />,
					text: 'Analysis Failed',
					bgColor: 'bg-red-50',
					textColor: 'text-red-800',
					borderColor: 'border-red-200'
				}
			default:
				return {
					icon: <AlertCircle size={16} className="text-gray-400" />,
					text: 'No Analysis',
					bgColor: 'bg-gray-50',
					textColor: 'text-gray-600',
					borderColor: 'border-gray-200'
				}
		}
	}

	const indicator = getIndicator()

	return (
		<div
			className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${indicator.bgColor} ${indicator.textColor} ${indicator.borderColor} ${className}`}
		>
			{indicator.icon}
			<span className="text-sm font-medium">{indicator.text}</span>
		</div>
	)
}
