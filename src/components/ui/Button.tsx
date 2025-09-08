import clsx from 'clsx'
import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'destructive'
	size?: 'sm' | 'md' | 'lg' | 'icon'
	loading?: boolean
	iconLeft?: React.ReactNode
	iconRight?: React.ReactNode
}

const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<string, string> = {
	primary: 'btn-primary',
	secondary: 'bg-surface-variant text-primary hover:brightness-110',
	outline: 'border border-[color:var(--color-surface-variant)] text-primary hover:bg-surface-variant',
	ghost: 'text-secondary hover:bg-surface-variant',
	link: 'text-primary underline underline-offset-4 hover:brightness-110',
	danger: 'bg-[color:var(--color-error)] text-[color:var(--color-on-error)] hover:brightness-110',
	destructive: 'bg-[color:var(--color-error)] text-[color:var(--color-on-error)] hover:brightness-110'
}

const sizes: Record<string, string> = {
	sm: 'text-xs px-3 py-1.5',
	md: 'text-sm px-4 py-2',
	lg: 'text-base px-5 py-3',
	icon: 'p-2'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({
		variant = 'primary',
		size = 'md',
		className = '',
		loading = false,
		iconLeft,
		iconRight,
		children,
		...props
	}, ref) => {
		return (
			<button
				ref={ref}
				className={clsx(base, variants[variant], sizes[size], className, loading && 'relative')}
				{...props}
			>
				{loading && (
					<span className="absolute inset-0 flex items-center justify-center">
						<span className="w-4 h-4 border-2 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin" />
					</span>
				)}
				{!loading && iconLeft && <span className="mr-2 -ml-1 flex items-center">{iconLeft}</span>}
				<span className={loading ? 'opacity-0' : undefined}>{children}</span>
				{!loading && iconRight && <span className="ml-2 -mr-1 flex items-center">{iconRight}</span>}
			</button>
		)
	}
)

Button.displayName = 'Button'

export default Button
