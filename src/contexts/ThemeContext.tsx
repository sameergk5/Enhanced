/**
 * Theme Context - Wardrobe AI
 * React Context for managing theme state and switching
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { defaultTheme, getTheme, Theme, themes } from '../types/theme'

interface ThemeContextValue {
	currentTheme: Theme
	themeId: string
	setTheme: (themeId: string) => void
	availableThemes: Theme[]
	isThemeLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Theme persistence key
const THEME_STORAGE_KEY = 'wardrobe-ai-theme'

// CSS custom properties mapping
const getContrastColor = (hex: string): string => {
	// Remove hash
	const clean = hex.replace('#', '')
	if (clean.length !== 6 && clean.length !== 3) return '#FFFFFF'
	const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
	const r = parseInt(full.substring(0, 2), 16)
	const g = parseInt(full.substring(2, 4), 16)
	const b = parseInt(full.substring(4, 6), 16)
	// Relative luminance (sRGB)
	const srgb = [r, g, b].map(v => {
		const c = v / 255
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
	})
	const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
	return L > 0.55 ? '#212121' : '#FFFFFF'
}

const applyThemeToCSS = (theme: Theme) => {
	const root = document.documentElement

	// Colors
	root.style.setProperty('--color-primary', theme.colors.primary)
	root.style.setProperty('--color-primary-dark', theme.colors.primaryDark)
	root.style.setProperty('--color-primary-light', theme.colors.primaryLight)
	root.style.setProperty('--color-secondary', theme.colors.secondary)
	root.style.setProperty('--color-secondary-dark', theme.colors.secondaryDark)
	root.style.setProperty('--color-secondary-light', theme.colors.secondaryLight)
	root.style.setProperty('--color-accent', theme.colors.accent)
	root.style.setProperty('--color-background', theme.colors.background)
	root.style.setProperty('--color-surface', theme.colors.surface)
	root.style.setProperty('--color-surface-variant', theme.colors.surfaceVariant)
	root.style.setProperty('--color-text-primary', theme.colors.textPrimary)
	root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
	root.style.setProperty('--color-text-disabled', theme.colors.textDisabled)
	root.style.setProperty('--color-success', theme.colors.success)
	root.style.setProperty('--color-warning', theme.colors.warning)
	root.style.setProperty('--color-error', theme.colors.error)
	root.style.setProperty('--color-info', theme.colors.info)

	// Auto contrast (on-color) variables for foreground text/icons
	root.style.setProperty('--color-on-primary', getContrastColor(theme.colors.primary))
	root.style.setProperty('--color-on-secondary', getContrastColor(theme.colors.secondary))
	root.style.setProperty('--color-on-accent', getContrastColor(theme.colors.accent))
	root.style.setProperty('--color-on-success', getContrastColor(theme.colors.success))
	root.style.setProperty('--color-on-error', getContrastColor(theme.colors.error))

	// Typography
	root.style.setProperty('--font-family-heading', theme.typography.fontFamilyHeading)
	root.style.setProperty('--font-family-body', theme.typography.fontFamilyBody)
	root.style.setProperty('--font-size-display', theme.typography.fontSizeDisplay)
	root.style.setProperty('--font-size-h1', theme.typography.fontSizeH1)
	root.style.setProperty('--font-size-h2', theme.typography.fontSizeH2)
	root.style.setProperty('--font-size-h3', theme.typography.fontSizeH3)
	root.style.setProperty('--font-size-h4', theme.typography.fontSizeH4)
	root.style.setProperty('--font-size-h5', theme.typography.fontSizeH5)
	root.style.setProperty('--font-size-h6', theme.typography.fontSizeH6)
	root.style.setProperty('--font-size-body-large', theme.typography.fontSizeBodyLarge)
	root.style.setProperty('--font-size-body', theme.typography.fontSizeBody)
	root.style.setProperty('--font-size-body-small', theme.typography.fontSizeBodySmall)
	root.style.setProperty('--font-size-caption', theme.typography.fontSizeCaption)

	// Visual elements
	root.style.setProperty('--border-radius-large', theme.visuals.borderRadiusLarge)
	root.style.setProperty('--border-radius-medium', theme.visuals.borderRadiusMedium)
	root.style.setProperty('--border-radius-small', theme.visuals.borderRadiusSmall)
	root.style.setProperty('--shadow-elevation-1', theme.visuals.shadowElevation1)
	root.style.setProperty('--shadow-elevation-2', theme.visuals.shadowElevation2)
	root.style.setProperty('--shadow-elevation-3', theme.visuals.shadowElevation3)
	root.style.setProperty('--transition-timing', theme.visuals.transitionTiming)
	root.style.setProperty('--transition-duration', theme.visuals.transitionDuration)

	// Add theme class to body for additional styling
	document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` theme-${theme.id}`
}

interface ThemeProviderProps {
	children: ReactNode
	defaultThemeId?: string
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
	children,
	defaultThemeId = defaultTheme.id
}) => {
	const [themeId, setThemeId] = useState<string>(defaultThemeId)
	const [isThemeLoading, setIsThemeLoading] = useState(true)

	// Initialize theme from localStorage or default
	useEffect(() => {
		const initializeTheme = () => {
			try {
				const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY)
				if (savedThemeId && savedThemeId in themes) {
					setThemeId(savedThemeId)
				} else {
					setThemeId(defaultThemeId)
				}
			} catch (error) {
				console.warn('Failed to load theme from localStorage:', error)
				setThemeId(defaultThemeId)
			} finally {
				setIsThemeLoading(false)
			}
		}

		initializeTheme()
	}, [defaultThemeId])

	// Apply theme to CSS whenever themeId changes
	useEffect(() => {
		if (!isThemeLoading) {
			const theme = getTheme(themeId)
			applyThemeToCSS(theme)
		}
	}, [themeId, isThemeLoading])

	const setTheme = (newThemeId: string) => {
		if (newThemeId === themeId) return

		try {
			const theme = getTheme(newThemeId)
			setThemeId(theme.id)
			localStorage.setItem(THEME_STORAGE_KEY, theme.id)

			// Add smooth transition for theme switching
			document.documentElement.style.setProperty('--theme-transition', 'all var(--transition-duration) var(--transition-timing)')

			// Remove transition after animation completes
			setTimeout(() => {
				document.documentElement.style.removeProperty('--theme-transition')
			}, 300)

		} catch (error) {
			console.error('Failed to set theme:', error)
		}
	}

	const currentTheme = getTheme(themeId)
	const availableThemes = Object.values(themes)

	const contextValue: ThemeContextValue = {
		currentTheme,
		themeId,
		setTheme,
		availableThemes,
		isThemeLoading
	}

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	)
}

// Custom hook to use theme context
export const useTheme = (): ThemeContextValue => {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}

// Hook for getting theme-aware styles
export const useThemeStyles = () => {
	const { currentTheme } = useTheme()

	return {
		// Helper functions for commonly used theme values
		primary: currentTheme.colors.primary,
		secondary: currentTheme.colors.secondary,
		background: currentTheme.colors.background,
		surface: currentTheme.colors.surface,
		textPrimary: currentTheme.colors.textPrimary,
		textSecondary: currentTheme.colors.textSecondary,

		// Spacing helpers
		borderRadiusLarge: currentTheme.visuals.borderRadiusLarge,
		borderRadiusMedium: currentTheme.visuals.borderRadiusMedium,
		borderRadiusSmall: currentTheme.visuals.borderRadiusSmall,

		// Typography helpers
		fontHeading: currentTheme.typography.fontFamilyHeading,
		fontBody: currentTheme.typography.fontFamilyBody,

		// Get CSS custom property reference
		cssVar: (property: string) => `var(--${property})`,

		// Get full theme object
		theme: currentTheme
	}
}
