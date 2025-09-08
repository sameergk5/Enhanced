/**
 * Theme Selector Component - Wardrobe AI
 * UI component for selecting and switching between themes
 */

import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { themes } from '../types/theme'

interface ThemeSelectorProps {
	className?: string
	showLabels?: boolean
	compact?: boolean
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
	className = '',
	showLabels = true,
	compact = false
}) => {
	const { currentTheme, themeId, setTheme, isThemeLoading } = useTheme()
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)

	const handleThemeChange = (newThemeId: string) => {
		setTheme(newThemeId)
		setIsDropdownOpen(false)
	}

	if (isThemeLoading) {
		return (
			<div className={`theme-selector loading ${className}`}>
				<div className="loading-spinner" />
				{showLabels && <span>Loading themes...</span>}
			</div>
		)
	}

	const themeEntries = Object.entries(themes)

	if (compact) {
		return (
			<div className={`theme-selector compact ${className}`}>
				<div className="theme-toggle-group">
					{themeEntries.map(([id, theme]) => (
						<button
							key={id}
							className={`theme-toggle ${themeId === id ? 'active' : ''}`}
							onClick={() => handleThemeChange(id)}
							title={theme.name}
							aria-label={`Switch to ${theme.name} theme`}
						>
							<div
								className="theme-preview"
								style={{
									backgroundColor: theme.colors.primary,
									border: `2px solid ${themeId === id ? theme.colors.accent : 'transparent'}`
								}}
							/>
							{showLabels && <span className="theme-label">{theme.name}</span>}
						</button>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className={`theme-selector ${className}`}>
			<div className="current-theme-display">
				<div className="current-theme-info">
					<div
						className="current-theme-preview"
						style={{ backgroundColor: currentTheme.colors.primary }}
					/>
					{showLabels && (
						<div className="current-theme-details">
							<span className="current-theme-name">{currentTheme.name}</span>
							<span className="current-theme-description">{currentTheme.description}</span>
						</div>
					)}
				</div>

				<button
					className="theme-dropdown-trigger"
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					aria-expanded={isDropdownOpen}
					aria-label="Open theme selector"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M4.427 9.573l3.396-3.396a.25.25 0 01.354 0l3.396 3.396a.25.25 0 01-.177.427H4.604a.25.25 0 01-.177-.427z" />
					</svg>
				</button>
			</div>

			{isDropdownOpen && (
				<div className="theme-dropdown">
					<div className="theme-options">
						{themeEntries.map(([id, theme]) => (
							<button
								key={id}
								className={`theme-option ${themeId === id ? 'active' : ''}`}
								onClick={() => handleThemeChange(id)}
							>
								<div className="theme-option-preview">
									<div
										className="color-swatch primary"
										style={{ backgroundColor: theme.colors.primary }}
									/>
									<div
										className="color-swatch secondary"
										style={{ backgroundColor: theme.colors.secondary }}
									/>
									<div
										className="color-swatch accent"
										style={{ backgroundColor: theme.colors.accent }}
									/>
								</div>

								<div className="theme-option-info">
									<span className="theme-option-name">{theme.name}</span>
									<span className="theme-option-description">{theme.description}</span>
								</div>

								{themeId === id && (
									<div className="theme-active-indicator">
										<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
											<path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
										</svg>
									</div>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

// Theme mode indicator for header/navbar
export const ThemeModeIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
	const { currentTheme } = useTheme()

	return (
		<div className={`theme-mode-indicator ${className}`}>
			<div
				className="mode-color"
				style={{ backgroundColor: currentTheme.colors.primary }}
			/>
			<span className="mode-name">{currentTheme.name}</span>
		</div>
	)
}

// Quick theme toggle button (for compact switching)
export const ThemeToggleButton: React.FC<{ className?: string }> = ({ className = '' }) => {
	const { themeId, setTheme } = useTheme()

	const getNextTheme = () => {
		const themeIds = Object.keys(themes)
		const currentIndex = themeIds.indexOf(themeId)
		const nextIndex = (currentIndex + 1) % themeIds.length
		return themeIds[nextIndex]
	}

	const handleToggle = () => {
		setTheme(getNextTheme())
	}

	return (
		<button
			className={`theme-toggle-btn ${className}`}
			onClick={handleToggle}
			aria-label="Switch theme"
			title="Switch theme"
		>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
				<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
			</svg>
		</button>
	)
}
