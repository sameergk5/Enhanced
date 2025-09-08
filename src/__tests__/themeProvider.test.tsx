import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'

// Simple test component that reads a CSS variable after theme change
const Probe: React.FC = () => {
	const { setTheme } = useTheme()
	React.useEffect(() => {
		setTheme('bro')
	}, [setTheme])
	return <div data-testid="probe" />
}

describe('ThemeProvider', () => {
	it('applies core CSS variables when switching theme', async () => {
		render(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>
		)
		screen.getByTestId('probe')
		await waitFor(() => {
			const styles = getComputedStyle(document.documentElement)
			const primary = styles.getPropertyValue('--color-primary')
			const surface = styles.getPropertyValue('--color-surface')
			const textPrimary = styles.getPropertyValue('--color-text-primary')
			expect(primary.trim()).not.toEqual('')
			expect(surface.trim()).not.toEqual('')
			expect(textPrimary.trim()).not.toEqual('')
		})
	})
})
