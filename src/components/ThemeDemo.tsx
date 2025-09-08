/**
 * Theme Demo Component - Wardrobe AI
 * Demonstrates theme switching functionality
 */

import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import './ThemeDemo.css'
import { ThemeModeIndicator, ThemeSelector, ThemeToggleButton } from './ThemeSelector'

const ThemeDemo: React.FC = () => {
	const { currentTheme } = useTheme()

	return (
		<div className="theme-demo">
			<div className="demo-header">
				<h2>Theme System Demo</h2>
				<div className="header-controls">
					<ThemeModeIndicator />
					<ThemeToggleButton />
				</div>
			</div>

			<div className="demo-content">
				<div className="demo-section">
					<h3>Theme Selector</h3>
					<ThemeSelector />
				</div>

				<div className="demo-section">
					<h3>Compact Selector</h3>
					<ThemeSelector compact={true} />
				</div>

				<div className="demo-section">
					<h3>Current Theme Colors</h3>
					<div className="color-showcase">
						<div className="color-item">
							<div
								className="color-box"
								style={{ backgroundColor: currentTheme.colors.primary }}
							/>
							<span>Primary</span>
						</div>
						<div className="color-item">
							<div
								className="color-box"
								style={{ backgroundColor: currentTheme.colors.secondary }}
							/>
							<span>Secondary</span>
						</div>
						<div className="color-item">
							<div
								className="color-box"
								style={{ backgroundColor: currentTheme.colors.accent }}
							/>
							<span>Accent</span>
						</div>
					</div>
				</div>

				<div className="demo-section">
					<h3>UI Components</h3>
					<div className="ui-showcase">
						<button
							className="demo-button primary"
							style={{
								backgroundColor: currentTheme.colors.primary,
								borderRadius: currentTheme.visuals.borderRadiusMedium
							}}
						>
							Primary Button
						</button>
						<button
							className="demo-button secondary"
							style={{
								backgroundColor: currentTheme.colors.secondary,
								borderRadius: currentTheme.visuals.borderRadiusMedium
							}}
						>
							Secondary Button
						</button>
						<div
							className="demo-card"
							style={{
								backgroundColor: currentTheme.colors.surface,
								borderRadius: currentTheme.visuals.borderRadiusLarge,
								boxShadow: currentTheme.visuals.shadowElevation1,
								border: `1px solid ${currentTheme.colors.surfaceVariant}`
							}}
						>
							<h4 style={{ color: currentTheme.colors.textPrimary }}>
								Sample Card
							</h4>
							<p style={{ color: currentTheme.colors.textSecondary }}>
								This card demonstrates the current theme's styling with proper colors and typography.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ThemeDemo
