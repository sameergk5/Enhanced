// Outfit Builder Component - Main interface for combining wardrobe items
import { EyeIcon, PlusIcon, SparklesIcon, X } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { virtualTryOnService, type OutfitCombination, type OutfitItem } from '../../services/virtualTryOn'
import { wardrobeService, type Garment } from '../../services/wardrobe'
import WardrobeItemSelection from './WardrobeItemSelection'

export interface OutfitBuilderProps {
	onOutfitCreate?: (outfit: OutfitCombination) => void
	onPreviewRequest?: (outfitItems: OutfitItem[]) => void
	className?: string
}

interface CategorySection {
	category: string
	displayName: string
	maxItems: number
	selectedItems: string[]
}

const OutfitBuilder: React.FC<OutfitBuilderProps> = ({
	onOutfitCreate,
	onPreviewRequest,
	className = ''
}) => {
	// State for outfit construction
	const [outfitName, setOutfitName] = useState('')
	const [selectedGarments, setSelectedGarments] = useState<Record<string, string[]>>({
		top: [],
		bottom: [],
		dress: [],
		shoes: [],
		outerwear: [],
		accessory: []
	})

	// UI state
	const [activeCategory, setActiveCategory] = useState<string>('top')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Garment data cache
	const [garmentCache, setGarmentCache] = useState<Record<string, Garment>>({})

	// Category configuration
	const categoryConfig: CategorySection[] = [
		{ category: 'top', displayName: 'Tops', maxItems: 2, selectedItems: selectedGarments.top },
		{ category: 'bottom', displayName: 'Bottoms', maxItems: 1, selectedItems: selectedGarments.bottom },
		{ category: 'dress', displayName: 'Dresses', maxItems: 1, selectedItems: selectedGarments.dress },
		{ category: 'shoes', displayName: 'Shoes', maxItems: 1, selectedItems: selectedGarments.shoes },
		{ category: 'outerwear', displayName: 'Outerwear', maxItems: 1, selectedItems: selectedGarments.outerwear },
		{ category: 'accessory', displayName: 'Accessories', maxItems: 3, selectedItems: selectedGarments.accessory }
	]

	/**
	 * Handle selection change for specific category
	 */
	const handleCategorySelection = useCallback((category: string, selectedIds: string[]) => {
		setSelectedGarments(prev => ({
			...prev,
			[category]: selectedIds
		}))

		// Cache garment data for selected items
		selectedIds.forEach(async (id) => {
			if (!garmentCache[id]) {
				try {
					const garment = await wardrobeService.getGarment(id)
					setGarmentCache(prev => ({ ...prev, [id]: garment }))
				} catch (err) {
					console.error('Failed to cache garment:', err)
				}
			}
		})
	}, [garmentCache])

	/**
	 * Get all selected garment IDs across categories
	 */
	const getAllSelectedIds = useCallback((): string[] => {
		return Object.values(selectedGarments).flat()
	}, [selectedGarments])

	/**
	 * Get total number of selected items
	 */
	const getTotalSelectedCount = useCallback((): number => {
		return getAllSelectedIds().length
	}, [getAllSelectedIds])

	/**
	 * Create outfit items from selected garments
	 */
	const createOutfitItems = useCallback((): OutfitItem[] => {
		const outfitItems: OutfitItem[] = []

		Object.entries(selectedGarments).forEach(([category, garmentIds]) => {
			garmentIds.forEach((garmentId, index) => {
				const garment = garmentCache[garmentId]
				if (garment) {
					outfitItems.push({
						garmentId,
						garment,
						layer: getLayerForCategory(category, index),
						position: getCategoryPosition(category)
					})
				}
			})
		})

		return outfitItems.sort((a, b) => a.layer - b.layer)
	}, [selectedGarments, garmentCache])

	/**
	 * Get layer order for category and item index
	 */
	const getLayerForCategory = (category: string, index: number): number => {
		const baseLayers: Record<string, number> = {
			dress: 0,
			bottom: 1,
			top: 2,
			outerwear: 4,
			shoes: 0,
			accessory: 5
		}
		return (baseLayers[category] || 0) + index
	}

	/**
	 * Get position mapping for category
	 */
	const getCategoryPosition = (category: string): OutfitItem['position'] => {
		const positionMap: Record<string, OutfitItem['position']> = {
			top: 'top',
			dress: 'top',
			bottom: 'bottom',
			shoes: 'feet',
			outerwear: 'outerwear',
			accessory: 'accessories'
		}
		return positionMap[category] || 'accessories'
	}

	/**
	 * Generate outfit suggestions using AI
	 */
	const generateOutfitSuggestions = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)

			const currentItems = createOutfitItems()
			if (currentItems.length === 0) {
				setError('Please select at least one item to generate suggestions')
				return
			}

			// Extract garments from outfit items for suggestions
			const garments = currentItems.map(item => item.garment)
			const suggestions = await virtualTryOnService.generateOutfitSuggestions(garments)

			if (suggestions.length > 0) {
				// Apply the first suggestion to current selection
				const suggestion = suggestions[0]
				const newSelection: Record<string, string[]> = {
					top: [],
					bottom: [],
					dress: [],
					shoes: [],
					outerwear: [],
					accessory: []
				}

				suggestion.items.forEach(item => {
					const category = item.garment.category
					if (newSelection[category]) {
						newSelection[category].push(item.garmentId)
					}
				})

				setSelectedGarments(newSelection)
				setOutfitName(suggestion.name || 'AI Suggested Outfit')
			}

		} catch (err) {
			console.error('Failed to generate suggestions:', err)
			setError(err instanceof Error ? err.message : 'Failed to generate suggestions')
		} finally {
			setLoading(false)
		}
	}, [createOutfitItems])

	/**
	 * Save current outfit
	 */
	const saveOutfit = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)

			const outfitItems = createOutfitItems()
			if (outfitItems.length === 0) {
				setError('Please select at least one item to save outfit')
				return
			}

			// Extract garment IDs for outfit creation
			const garmentIds = outfitItems.map(item => item.garmentId)
			const outfit = await virtualTryOnService.createCustomOutfit(garmentIds, outfitName || 'Custom Outfit')

			if (onOutfitCreate) {
				onOutfitCreate(outfit)
			}

			// Reset form
			setSelectedGarments({
				top: [],
				bottom: [],
				dress: [],
				shoes: [],
				outerwear: [],
				accessory: []
			})
			setOutfitName('')

		} catch (err) {
			console.error('Failed to save outfit:', err)
			setError(err instanceof Error ? err.message : 'Failed to save outfit')
		} finally {
			setLoading(false)
		}
	}, [createOutfitItems, outfitName, onOutfitCreate])

	/**
	 * Preview current outfit
	 */
	const previewOutfit = useCallback(() => {
		const outfitItems = createOutfitItems()
		if (outfitItems.length > 0 && onPreviewRequest) {
			onPreviewRequest(outfitItems)
		}
	}, [createOutfitItems, onPreviewRequest])

	/**
	 * Clear all selections
	 */
	const clearAll = useCallback(() => {
		setSelectedGarments({
			top: [],
			bottom: [],
			dress: [],
			shoes: [],
			outerwear: [],
			accessory: []
		})
		setOutfitName('')
		setError(null)
	}, [])

	/**
	 * Remove item from selection
	 */
	const removeItem = useCallback((category: string, garmentId: string) => {
		setSelectedGarments(prev => ({
			...prev,
			[category]: prev[category].filter(id => id !== garmentId)
		}))
	}, [])

	return (
		<div className={`outfit-builder ${className}`}>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Panel - Category Selection */}
				<div className="lg:col-span-2">
					{/* Category Tabs */}
					<div className="border-b mb-6" style={{ borderColor: 'var(--color-surface-variant)' }}>
						<nav className="-mb-px flex space-x-8 overflow-x-auto">
							{categoryConfig.map((config) => (
								<button
									key={config.category}
									onClick={() => setActiveCategory(config.category)}
									className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-theme ${activeCategory === config.category
										? 'border-[var(--color-primary)] text-primary'
										: 'border-transparent text-secondary hover:text-primary hover:border-[var(--color-surface-variant)]'
										}`}
								>
									{config.displayName}
									{config.selectedItems.length > 0 && (
										<span className="ml-2 py-0.5 px-2 rounded-full text-xs transition-theme bg-surface-variant text-primary">
											{config.selectedItems.length}
										</span>
									)}
								</button>
							))}
						</nav>
					</div>

					{/* Active Category Selection */}
					{categoryConfig.map((config) => (
						activeCategory === config.category && (
							<WardrobeItemSelection
								key={config.category}
								selectedItems={config.selectedItems}
								onSelectionChange={(selectedIds) => handleCategorySelection(config.category, selectedIds)}
								maxSelections={config.maxItems}
								allowMultiCategory={false}
								categoryRestriction={[config.category]}
								className="mb-6"
							/>
						)
					))}
				</div>

				{/* Right Panel - Outfit Summary and Actions */}
				<div className="space-y-6">
					{/* Outfit Summary */}
					<div className="bg-surface border rounded-lg p-4 elevation-1 transition-theme" style={{ borderColor: 'var(--color-surface-variant)' }}>
						<h3 className="font-medium text-primary mb-4">Current Outfit</h3>

						{/* Outfit Name */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-secondary mb-1">
								Outfit Name
							</label>
							<input
								type="text"
								value={outfitName}
								onChange={(e) => setOutfitName(e.target.value)}
								placeholder="Enter outfit name..."
								className="w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-transparent text-primary transition-theme border"
								style={{ borderColor: 'var(--color-surface-variant)' }}
							/>
						</div>

						{/* Selected Items Summary */}
						<div className="space-y-3 mb-4">
							{categoryConfig.map((config) => (
								config.selectedItems.length > 0 && (
									<div key={config.category} className="flex items-center justify-between">
										<span className="text-sm text-secondary">{config.displayName}:</span>
										<div className="flex items-center space-x-2">
											<span className="text-sm font-medium">{config.selectedItems.length}</span>
											{config.selectedItems.map((garmentId) => (
												<button
													key={garmentId}
													onClick={() => removeItem(config.category, garmentId)}
													className="w-6 h-6 bg-surface-variant hover:brightness-110 rounded-full flex items-center justify-center transition-theme"
												>
													<X className="w-3 h-3 text-secondary hover:text-[color:var(--color-error)] transition-theme" />
												</button>
											))}
										</div>
									</div>
								)
							))}

							{getTotalSelectedCount() === 0 && (
								<div className="text-center py-4 text-secondary text-sm">
									No items selected
								</div>
							)}
						</div>

						{/* Action Buttons */}
						<div className="space-y-3">
							{/* Preview Button */}
							<button
								onClick={previewOutfit}
								disabled={getTotalSelectedCount() === 0}
								className="w-full flex items-center justify-center px-4 py-2 rounded-md border transition-theme disabled:opacity-50 disabled:cursor-not-allowed bg-surface-variant text-primary hover:brightness-105"
								style={{ borderColor: 'var(--color-surface-variant)' }}
							>
								<EyeIcon className="w-4 h-4 mr-2" />
								Preview Outfit
							</button>

							{/* AI Suggestions Button */}
							<button
								onClick={generateOutfitSuggestions}
								disabled={loading || getTotalSelectedCount() === 0}
								className="w-full flex items-center justify-center px-4 py-2 rounded-md border transition-theme disabled:opacity-50 disabled:cursor-not-allowed bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/20"
								style={{ borderColor: 'var(--color-accent)' }}
							>
								<SparklesIcon className="w-4 h-4 mr-2" />
								{loading ? 'Generating...' : 'AI Suggestions'}
							</button>

							{/* Save Outfit Button */}
							<button
								onClick={saveOutfit}
								disabled={loading || getTotalSelectedCount() === 0}
								className="w-full flex items-center justify-center px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed btn-primary"
							>
								<PlusIcon className="w-4 h-4 mr-2" />
								{loading ? 'Saving...' : 'Save Outfit'}
							</button>

							{/* Clear All Button */}
							{getTotalSelectedCount() > 0 && (
								<button
									onClick={clearAll}
									className="w-full px-4 py-2 rounded-md border text-secondary hover:text-primary transition-theme hover:bg-surface-variant"
									style={{ borderColor: 'var(--color-surface-variant)' }}
								>
									Clear All
								</button>
							)}
						</div>

						{/* Error Display */}
						{error && (
							<div className="mt-4 p-3 rounded-md border transition-theme" style={{ background: 'rgba(255,0,0,0.08)', borderColor: 'var(--color-error)' }}>
								<p className="text-[color:var(--color-error)] text-sm">{error}</p>
							</div>
						)}
					</div>

					{/* Outfit Stats */}
					<div className="bg-surface border rounded-lg p-4 elevation-1 transition-theme" style={{ borderColor: 'var(--color-surface-variant)' }}>
						<h4 className="font-medium text-primary mb-2">Outfit Statistics</h4>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-secondary">Total Items:</span>
								<span className="font-medium">{getTotalSelectedCount()}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-secondary">Categories:</span>
								<span className="font-medium">
									{Object.values(selectedGarments).filter(items => items.length > 0).length}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default OutfitBuilder
