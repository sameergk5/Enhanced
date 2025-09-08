import clsx from 'clsx'
import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	startIcon?: React.ReactNode
	endIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className = '', type = 'text', startIcon, endIcon, ...props }, ref) => {
		return (
			<div className={clsx('relative flex items-center', (startIcon || endIcon) && 'gap-2')}>
				{startIcon && (
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">{startIcon}</span>
				)}
				<input
					ref={ref}
					type={type}
					className={clsx(
						'w-full h-10 rounded-lg border bg-transparent text-primary placeholder:text-secondary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] transition-theme',
						startIcon && 'pl-10',
						endIcon && 'pr-10',
						className
					)}
					style={{ borderColor: 'var(--color-surface-variant)' }}
					{...props}
				/>
				{endIcon && (
					<span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">{endIcon}</span>
				)}
			</div>
		)
	}
)

Input.displayName = 'Input'

export default Input
