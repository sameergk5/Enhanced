import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'error'
}

const badgeVariants = {
	default: 'bg-blue-600 text-white hover:bg-blue-700',
	secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
	destructive: 'bg-red-600 text-white hover:bg-red-700',
	outline: 'text-gray-700 border border-gray-300 bg-white hover:bg-gray-50',
	success: 'bg-green-100 text-green-800 border border-green-200',
	warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
	info: 'bg-blue-100 text-blue-800 border border-blue-200',
	error: 'bg-red-100 text-red-800 border border-red-200'
}

export const Badge: React.FC<BadgeProps> = ({
	className = '',
	variant = 'default',
	...props
}) => {
	const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
	const variantClasses = badgeVariants[variant]
	const combinedClasses = `${baseClasses} ${variantClasses} ${className}`.trim()

	return (
		<div
			className={combinedClasses}
			{...props}
		/>
	)
}
