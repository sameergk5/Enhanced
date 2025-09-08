/**
 * Theme Configuration - Wardrobe AI
 * Defines the theme export const bubblyTheme: Theme = {
	id: 'bubbly',
	name: 'Bubbly',
	description: 'Playful and energetic with bright colors and rounded elements',cts and TypeScript interfaces for the theming system
 */

export interface ThemeColors {
	primary: string
	primaryDark: string
	primaryLight: string
	secondary: string
	secondaryDark: string
	secondaryLight: string
	accent: string
	background: string
	surface: string
	surfaceVariant: string
	textPrimary: string
	textSecondary: string
	textDisabled: string
	success: string
	warning: string
	error: string
	info: string
}

export interface ThemeTypography {
	fontFamilyHeading: string
	fontFamilyBody: string
	fontSizeDisplay: string
	fontSizeH1: string
	fontSizeH2: string
	fontSizeH3: string
	fontSizeH4: string
	fontSizeH5: string
	fontSizeH6: string
	fontSizeBodyLarge: string
	fontSizeBody: string
	fontSizeBodySmall: string
	fontSizeCaption: string
}

export interface ThemeVisuals {
	borderRadiusLarge: string
	borderRadiusMedium: string
	borderRadiusSmall: string
	shadowElevation1: string
	shadowElevation2: string
	shadowElevation3: string
	transitionTiming: string
	transitionDuration: string
}

export interface Theme {
	id: string
	name: string
	description: string
	colors: ThemeColors
	typography: ThemeTypography
	visuals: ThemeVisuals
}

// Bubbly Theme
export const bubblyTheme: Theme = {
	id: 'bubbly',
	name: 'Bubbly',
	description: 'Playful and energetic with bright colors and rounded elements',
	colors: {
		primary: '#FF6B9D',
		primaryDark: '#E5458B',
		primaryLight: '#FF8AB8',
		secondary: '#4ECDC4',
		secondaryDark: '#3DBDB5',
		secondaryLight: '#70E0D9',
		accent: '#FFE66D',
		background: '#FFF8F3',
		surface: '#FFFFFF',
		surfaceVariant: '#FFF0F5',
		textPrimary: '#2D2D3A',
		textSecondary: '#6B6B7D',
		textDisabled: '#A8A8B6',
		success: '#4CAF50',
		warning: '#FF9800',
		error: '#F44336',
		info: '#2196F3'
	},
	typography: {
		fontFamilyHeading: '"Nunito", "Inter", -apple-system, sans-serif',
		fontFamilyBody: '"Inter", -apple-system, sans-serif',
		fontSizeDisplay: '3rem',
		fontSizeH1: '2.25rem',
		fontSizeH2: '1.75rem',
		fontSizeH3: '1.5rem',
		fontSizeH4: '1.25rem',
		fontSizeH5: '1.125rem',
		fontSizeH6: '1rem',
		fontSizeBodyLarge: '1rem',
		fontSizeBody: '0.875rem',
		fontSizeBodySmall: '0.75rem',
		fontSizeCaption: '0.6875rem'
	},
	visuals: {
		borderRadiusLarge: '16px',
		borderRadiusMedium: '12px',
		borderRadiusSmall: '8px',
		shadowElevation1: '0 2px 8px rgba(255, 107, 157, 0.15)',
		shadowElevation2: '0 4px 16px rgba(255, 107, 157, 0.2)',
		shadowElevation3: '0 8px 32px rgba(255, 107, 157, 0.25)',
		transitionTiming: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
		transitionDuration: '300ms'
	}
}

// Bro Theme
export const broTheme: Theme = {
	id: 'bro',
	name: 'Bro',
	description: 'Athletic and strong with bold contrasts and sharp angles',
	colors: {
		primary: '#1A1A2E',
		primaryDark: '#0F0F1A',
		primaryLight: '#2A2A3E',
		secondary: '#FF6B35',
		secondaryDark: '#E5522A',
		secondaryLight: '#FF8A5B',
		accent: '#00D4AA',
		background: '#F8F9FA',
		surface: '#FFFFFF',
		surfaceVariant: '#F1F3F4',
		textPrimary: '#1A1A2E',
		textSecondary: '#5F6368',
		textDisabled: '#9AA0A6',
		success: '#34A853',
		warning: '#FBBC04',
		error: '#EA4335',
		info: '#4285F4'
	},
	typography: {
		fontFamilyHeading: '"Inter", "Roboto", -apple-system, sans-serif',
		fontFamilyBody: '"Inter", -apple-system, sans-serif',
		fontSizeDisplay: '2.75rem',
		fontSizeH1: '2rem',
		fontSizeH2: '1.625rem',
		fontSizeH3: '1.375rem',
		fontSizeH4: '1.125rem',
		fontSizeH5: '1rem',
		fontSizeH6: '0.875rem',
		fontSizeBodyLarge: '1rem',
		fontSizeBody: '0.875rem',
		fontSizeBodySmall: '0.75rem',
		fontSizeCaption: '0.6875rem'
	},
	visuals: {
		borderRadiusLarge: '8px',
		borderRadiusMedium: '6px',
		borderRadiusSmall: '4px',
		shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.2)',
		shadowElevation2: '0 2px 6px rgba(0, 0, 0, 0.25)',
		shadowElevation3: '0 4px 12px rgba(0, 0, 0, 0.3)',
		transitionTiming: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		transitionDuration: '200ms'
	}
}

// Professional Theme
export const professionalTheme: Theme = {
	id: 'professional',
	name: 'Professional',
	description: 'Sophisticated and elegant with refined colors and clean lines',
	colors: {
		primary: '#1565C0',
		primaryDark: '#0D47A1',
		primaryLight: '#1976D2',
		secondary: '#37474F',
		secondaryDark: '#263238',
		secondaryLight: '#546E7A',
		accent: '#C9B037',
		background: '#FAFAFA',
		surface: '#FFFFFF',
		surfaceVariant: '#F5F5F5',
		textPrimary: '#212121',
		textSecondary: '#757575',
		textDisabled: '#BDBDBD',
		success: '#388E3C',
		warning: '#F57C00',
		error: '#D32F2F',
		info: '#1976D2'
	},
	typography: {
		fontFamilyHeading: '"Merriweather", "Georgia", serif',
		fontFamilyBody: '"Inter", -apple-system, sans-serif',
		fontSizeDisplay: '2.5rem',
		fontSizeH1: '1.875rem',
		fontSizeH2: '1.5rem',
		fontSizeH3: '1.25rem',
		fontSizeH4: '1.125rem',
		fontSizeH5: '1rem',
		fontSizeH6: '0.875rem',
		fontSizeBodyLarge: '1rem',
		fontSizeBody: '0.875rem',
		fontSizeBodySmall: '0.75rem',
		fontSizeCaption: '0.6875rem'
	},
	visuals: {
		borderRadiusLarge: '4px',
		borderRadiusMedium: '3px',
		borderRadiusSmall: '2px',
		shadowElevation1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
		shadowElevation2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
		shadowElevation3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
		transitionTiming: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
		transitionDuration: '250ms'
	}
}

// Available themes registry
export const themes: Record<string, Theme> = {
	bubbly: bubblyTheme,
	bro: broTheme,
	professional: professionalTheme
}

// Default theme
export const defaultTheme = bubblyTheme

// Theme validation
export const isValidThemeId = (themeId: string): boolean => {
	return themeId in themes
}

// Get theme by ID with fallback
export const getTheme = (themeId: string): Theme => {
	return themes[themeId] || defaultTheme
}
