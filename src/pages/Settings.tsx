/**
 * Settings Page - Wardrobe AI
 * User settings including theme selection
 */

import React from 'react'
import { PermissionsForm } from '../components/settings/PermissionsForm'
import { ProfileSettingsForm } from '../components/settings/ProfileSettingsForm'
import { ThemeModeIndicator, ThemeSelector } from '../components/ThemeSelector'
import '../components/ThemeSelector.css'
import { useTheme } from '../contexts/ThemeContext'
import './Settings.css'

const Settings: React.FC = () => {
	const { currentTheme } = useTheme()

	return (
		<div className="settings-page">
			<div className="settings-header">
				<div className="header-content">
					<h1 className="page-title">Settings</h1>
					<ThemeModeIndicator className="current-mode" />
				</div>
				<p className="page-description">
					Customize your Wardrobe AI experience with personalized settings
				</p>
			</div>

			<div className="settings-content">
				{/* Theme Settings Section */}
				<section className="settings-section">
					<div className="section-header">
						<h2 className="section-title">Appearance</h2>
						<p className="section-description">
							Choose your preferred visual style and theme
						</p>
					</div>

					<div className="setting-group">
						<div className="setting-item">
							<div className="setting-label">
								<h3>Theme Selection</h3>
								<p>Select the visual style that best fits your personality</p>
							</div>
							<div className="setting-control">
								<ThemeSelector />
							</div>
						</div>

						<div className="setting-item">
							<div className="setting-label">
								<h3>Quick Theme Switch</h3>
								<p>Use the compact selector for quick theme changes</p>
							</div>
							<div className="setting-control">
								<ThemeSelector compact={true} />
							</div>
						</div>
					</div>
				</section>

				{/* Current Theme Preview */}
				<section className="settings-section">
					<div className="section-header">
						<h2 className="section-title">Theme Preview</h2>
						<p className="section-description">
							Preview of your current theme: {currentTheme.name}
						</p>
					</div>

					<div className="theme-preview-grid">
						{/* Color Palette Preview */}
						<div className="preview-card">
							<h4>Color Palette</h4>
							<div className="color-grid">
								<div className="color-item">
									<div
										className="color-sample"
										style={{ backgroundColor: currentTheme.colors.primary }}
									/>
									<span>Primary</span>
								</div>
								<div className="color-item">
									<div
										className="color-sample"
										style={{ backgroundColor: currentTheme.colors.secondary }}
									/>
									<span>Secondary</span>
								</div>
								<div className="color-item">
									<div
										className="color-sample"
										style={{ backgroundColor: currentTheme.colors.accent }}
									/>
									<span>Accent</span>
								</div>
								<div className="color-item">
									<div
										className="color-sample"
										style={{ backgroundColor: currentTheme.colors.background }}
									/>
									<span>Background</span>
								</div>
							</div>
						</div>

						{/* Typography Preview */}
						<div className="preview-card">
							<h4>Typography</h4>
							<div className="typography-samples">
								<div
									className="typography-sample heading"
									style={{ fontFamily: currentTheme.typography.fontFamilyHeading }}
								>
									Heading Font
								</div>
								<div
									className="typography-sample body"
									style={{ fontFamily: currentTheme.typography.fontFamilyBody }}
								>
									Body text sample with your selected font
								</div>
							</div>
						</div>

						{/* UI Elements Preview */}
						<div className="preview-card">
							<h4>UI Elements</h4>
							<div className="ui-samples">
								<button
									className="sample-button primary"
									style={{
										backgroundColor: currentTheme.colors.primary,
										borderRadius: currentTheme.visuals.borderRadiusMedium
									}}
								>
									Primary Button
								</button>
								<button
									className="sample-button secondary"
									style={{
										backgroundColor: currentTheme.colors.secondary,
										borderRadius: currentTheme.visuals.borderRadiusMedium
									}}
								>
									Secondary Button
								</button>
								<div
									className="sample-card"
									style={{
										backgroundColor: currentTheme.colors.surface,
										borderRadius: currentTheme.visuals.borderRadiusLarge,
										boxShadow: currentTheme.visuals.shadowElevation1
									}}
								>
									Sample Card Component
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Other Settings Sections */}
				<section className="settings-section">
					<div className="section-header">
						<h2 className="section-title">Account & Privacy</h2>
						<p className="section-description">
							Update profile details and control sharing & privacy preferences
						</p>
					</div>

					<div className="setting-group">
						<div className="setting-item">
							<div className="setting-label" style={{ flex: 1 }}>
								<h3>Profile Settings</h3>
								<p>Update your display name, bio and privacy preference</p>
								<ProfileSettingsForm />
							</div>
						</div>

						<div className="setting-item">
							<div className="setting-label" style={{ flex: 1 }}>
								<h3>Privacy & Sharing Permissions</h3>
								<p>Control visibility and community interaction capabilities</p>
								<PermissionsForm />
							</div>
						</div>
					</div>
				</section>

				<section className="settings-section">
					<div className="section-header">
						<h2 className="section-title">Notifications</h2>
						<p className="section-description">
							Customize when and how you receive notifications
						</p>
					</div>

					<div className="setting-group">
						<div className="setting-item">
							<div className="setting-label">
								<h3>Style Recommendations</h3>
								<p>Get notified about new style suggestions and trends</p>
							</div>
							<div className="setting-control">
								<label className="toggle-switch">
									<input type="checkbox" defaultChecked />
									<span className="toggle-slider"></span>
								</label>
							</div>
						</div>

						<div className="setting-item">
							<div className="setting-label">
								<h3>Wardrobe Updates</h3>
								<p>Receive notifications about new items and organization tips</p>
							</div>
							<div className="setting-control">
								<label className="toggle-switch">
									<input type="checkbox" defaultChecked />
									<span className="toggle-slider"></span>
								</label>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}

export default Settings
