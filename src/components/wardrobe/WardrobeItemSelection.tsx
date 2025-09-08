// Wardrobe Item Selection Interface Component
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon, HeartIcon, SearchIcon } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { wardrobeService, type Garment, type GarmentFilters } from '../../services/wardrobe'

export interface WardrobeSelectionProps {
	selectedItems: string[] // Array of garment IDs
	onSelectionChange: (selectedIds: string[]) => void
	maxSelections?: number
	allowMultiCategory?: boolean
	categoryRestriction?: string[] // Restrict to specific categories
	className?: string
}

export interface FilterState {
	category: string
	color: string
	search: string
	tags: string[]
	showFavorites: boolean
}

const WardrobeItemSelection: React.FC<WardrobeSelectionProps> = ({
	selectedItems = [],
	onSelectionChange,
	maxSelections = 10,
	allowMultiCategory = true,
	categoryRestriction,
	className = ''
}) => {
	const [garments, setGarments] = useState<Garment[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Filtering and search state
	const [filters, setFilters] = useState<FilterState>({
		category: '',
		color: '',
		search: '',
		tags: [],
		showFavorites: false
	})

	// UI state
	const [showFilters, setShowFilters] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(12)

	// Available filter options
	const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([])
	const [colors, setColors] = useState<Array<{ color: string; count: number }>>([])

	/**
	 * Load wardrobe data and filter options
	 */
	const loadWardrobeData = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)

			// Build filters for API call
			const apiFilters: GarmentFilters = {}
			if (filters.category) apiFilters.category = filters.category
			if (filters.color) apiFilters.color = filters.color
			if (filters.search) apiFilters.search = filters.search
			if (filters.tags.length > 0) apiFilters.tags = filters.tags

			const [garmentsData, categoriesData, colorsData] = await Promise.all([
				wardrobeService.getGarments(apiFilters),
				wardrobeService.getCategories(),
				wardrobeService.getColorPalette()
			])

			// Apply category restrictions if specified
			let filteredGarments = garmentsData
			if (categoryRestriction && categoryRestriction.length > 0) {
				filteredGarments = garmentsData.filter((g: Garment) => categoryRestriction.includes(g.category))
			}

			// Apply favorites filter if enabled
			if (filters.showFavorites) {
				filteredGarments = filteredGarments.filter((g: Garment) => g.isFavorite)
			}

			setGarments(filteredGarments)
			setCategories(categoriesData)
			setColors(colorsData)

		} catch (err) {
			console.error('Failed to load wardrobe data:', err)
			setError(err instanceof Error ? err.message : 'Failed to load wardrobe')
		} finally {
			setLoading(false)
		}
	}, [filters, categoryRestriction])

	/**
	 * Handle item selection/deselection
	 */
	const handleItemSelection = useCallback((garmentId: string) => {
		const isSelected = selectedItems.includes(garmentId)
		let newSelection: string[]

		if (isSelected) {
			// Deselect item
			newSelection = selectedItems.filter(id => id !== garmentId)
		} else {
			// Check selection limits
			if (selectedItems.length >= maxSelections) {
				// Replace oldest selection or show warning
				newSelection = [...selectedItems.slice(1), garmentId]
			} else {
				// Add to selection
				newSelection = [...selectedItems, garmentId]
			}

			// Check category restrictions if not allowing multi-category
			if (!allowMultiCategory && selectedItems.length > 0) {
				const firstSelectedGarment = garments.find(g => g.id === selectedItems[0])
				const newGarment = garments.find(g => g.id === garmentId)

				if (firstSelectedGarment && newGarment && firstSelectedGarment.category !== newGarment.category) {
					// Replace with new category selection
					newSelection = [garmentId]
				}
			}
		}

		onSelectionChange(newSelection)
	}, [selectedItems, maxSelections, allowMultiCategory, garments, onSelectionChange])

	/**
	 * Handle filter changes
	 */
	const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }))
		setCurrentPage(1) // Reset to first page when filtering
	}, [])

	/**
	 * Clear all filters
	 */
	const clearFilters = useCallback(() => {
		setFilters({
			category: '',
			color: '',
			search: '',
			tags: [],
			showFavorites: false
		})
		setCurrentPage(1)
	}, [])

	/**
	 * Paginated garments
	 */
	const paginatedGarments = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage
		const endIndex = startIndex + itemsPerPage
		return garments.slice(startIndex, endIndex)
	}, [garments, currentPage, itemsPerPage])

	const totalPages = Math.ceil(garments.length / itemsPerPage)

	/**
	 * Toggle favorite status
	 */
	const handleToggleFavorite = useCallback(async (garmentId: string, event: React.MouseEvent) => {
		event.stopPropagation() // Prevent item selection
		try {
			await wardrobeService.toggleFavorite(garmentId)
			// Refresh data to show updated favorite status
			loadWardrobeData()
		} catch (err) {
			console.error('Failed to toggle favorite:', err)
		}
	}, [loadWardrobeData])

	// Load data on mount and filter changes
	useEffect(() => {
		loadWardrobeData()
	}, [loadWardrobeData])

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
				<span className="ml-2 text-secondary">Loading wardrobe...</span>
			</div>
		)
	}

	if (error) {
		return (
			<div className="rounded-lg p-4 border transition-theme" style={{ background: 'rgba(255,0,0,0.08)', borderColor: 'var(--color-error)' }}>
				<h3 className="font-medium text-[color:var(--color-error)]">Error Loading Wardrobe</h3>
				<p className="text-[color:var(--color-error)] text-sm mt-1">{error}</p>
				<button
					onClick={loadWardrobeData}
					className="mt-2 text-[color:var(--color-error)] hover:brightness-110 text-sm underline"
				>
					Try Again
				</button>
			</div>
		)
	}

	return (
		<div className={`wardrobe-selection ${className}`}>
			{/* Header and Controls */}
			<div className="flex flex-col space-y-4 mb-6">
				{/* Selection Status */}
				<div className="flex items-center justify-between">
					<div className="text-sm text-secondary">
						{selectedItems.length} of {maxSelections} items selected
						{garments.length > 0 && ` • ${garments.length} items available`}
					</div>
					{selectedItems.length > 0 && (
						<button
							onClick={() => onSelectionChange([])}
							className="text-sm text-primary hover:underline"
						>
							Clear Selection
						</button>
					)}
				</div>

				{/* Search and Filter Bar */}
				<div className="flex flex-col sm:flex-row gap-3">
					{/* Search Input */}
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
						<input
							type="text"
							placeholder="Search garments..."
							value={filters.search}
							onChange={(e) => handleFilterChange('search', e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-transparent text-primary transition-theme border"
							style={{ borderColor: 'var(--color-surface-variant)' }}
						/>
					</div>

					{/* Filter Toggle */}
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`flex items-center px-4 py-2 border rounded-lg transition-theme ${showFilters
							? 'bg-surface-variant text-primary'
							: 'text-secondary hover:bg-surface-variant'
							}`}
						style={{ borderColor: 'var(--color-surface-variant)' }}
					>
						<FilterIcon className="w-4 h-4 mr-2" />
						Filters
					</button>
				</div>

				{/* Filter Panel */}
				{showFilters && (
					<div className="bg-surface border rounded-lg p-4 space-y-4 transition-theme" style={{ borderColor: 'var(--color-surface-variant)' }}>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{/* Category Filter */}
							<div>
								<label className="block text-sm font-medium text-secondary mb-1">Category</label>
								<select
									value={filters.category}
									onChange={(e) => handleFilterChange('category', e.target.value)}
									className="w-full p-2 border rounded-md bg-transparent text-primary transition-theme"
									style={{ borderColor: 'var(--color-surface-variant)' }}
								>
									<option value="">All Categories</option>
									{categories.map(({ category, count }) => (
										<option key={category} value={category}>
											{category.charAt(0).toUpperCase() + category.slice(1)} ({count})
										</option>
									))}
								</select>
							</div>

							{/* Color Filter */}
							<div>
								<label className="block text-sm font-medium text-secondary mb-1">Color</label>
								<select
									value={filters.color}
									onChange={(e) => handleFilterChange('color', e.target.value)}
									className="w-full p-2 border rounded-md bg-transparent text-primary transition-theme"
									style={{ borderColor: 'var(--color-surface-variant)' }}
								>
									<option value="">All Colors</option>
									{colors.slice(0, 10).map(({ color, count }) => (
										<option key={color} value={color}>
											{color} ({count})
										</option>
									))}
								</select>
							</div>

							{/* Favorites Filter */}
							<div className="flex items-center">
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={filters.showFavorites}
										onChange={(e) => handleFilterChange('showFavorites', e.target.checked)}
										className="w-4 h-4 rounded border focus:ring-offset-0 focus:ring-[var(--color-primary)] text-[color:var(--color-primary)]"
										style={{ borderColor: 'var(--color-surface-variant)' }}
									/>
									<span className="ml-2 text-sm text-secondary">Favorites Only</span>
								</label>
							</div>

							{/* Clear Filters */}
							<div className="flex items-end">
								<button
									onClick={clearFilters}
									className="text-sm text-secondary hover:text-primary underline"
								>
									Clear Filters
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Garment Grid */}
			{garments.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-secondary text-lg mb-2">No garments found</div>
					<p className="text-secondary text-sm">
						{filters.search || filters.category || filters.color || filters.showFavorites
							? 'Try adjusting your filters'
							: 'Upload some garments to get started'
						}
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
						{paginatedGarments.map((garment) => (
							<GarmentCard
								key={garment.id}
								garment={garment}
								isSelected={selectedItems.includes(garment.id)}
								onSelect={() => handleItemSelection(garment.id)}
								onToggleFavorite={(e) => handleToggleFavorite(garment.id, e)}
							/>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-center space-x-2 mt-6">
							<button
								onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
								disabled={currentPage === 1}
								className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-variant transition-theme"
								style={{ borderColor: 'var(--color-surface-variant)' }}
							>
								<ChevronLeftIcon className="w-4 h-4" />
							</button>

							<span className="px-3 py-2 text-sm text-secondary">
								Page {currentPage} of {totalPages}
							</span>

							<button
								onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
								disabled={currentPage === totalPages}
								className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-variant transition-theme"
								style={{ borderColor: 'var(--color-surface-variant)' }}
							>
								<ChevronRightIcon className="w-4 h-4" />
							</button>
						</div>
					)}
				</>
			)}
		</div>
	)
}

/**
 * Individual Garment Card Component
 */
interface GarmentCardProps {
	garment: Garment
	isSelected: boolean
	onSelect: () => void
	onToggleFavorite: (event: React.MouseEvent) => void
}

const GarmentCard: React.FC<GarmentCardProps> = ({
	garment,
	isSelected,
	onSelect,
	onToggleFavorite
}) => {
	const [imageError, setImageError] = useState(false)
	const imageUrl = garment.thumbnailUrl || garment.images[0]

	return (
		<div
			className={`relative group cursor-pointer transition-all duration-200 ${isSelected
				? 'ring-2 ring-[color:var(--color-primary)] ring-offset-2 transform scale-105'
				: 'hover:elevation-2 hover:scale-102'
				}`}
			onClick={onSelect}
		>
			{/* Selection Indicator */}
			{isSelected && (
				<div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
					</svg>
				</div>
			)}

			{/* Favorite Button */}
			<button
				onClick={onToggleFavorite}
				className={`absolute top-2 right-2 z-10 p-1 rounded-full transition-theme ${garment.isFavorite
					? 'bg-surface-variant text-accent'
					: 'bg-surface text-secondary hover:text-[color:var(--color-error)]'
					}`}
			>
				<HeartIcon className={`w-4 h-4 ${garment.isFavorite ? 'fill-current' : ''}`} />
			</button>

			<div className="bg-surface rounded-lg border overflow-hidden elevation-1 transition-theme" style={{ borderColor: 'var(--color-surface-variant)' }}>
				{/* Image */}
				<div className="aspect-square bg-surface-variant relative">
					{imageUrl && !imageError ? (
						<img
							src={imageUrl}
							alt={garment.name}
							className="w-full h-full object-cover"
							onError={() => setImageError(true)}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-secondary">
							<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
							</svg>
						</div>
					)}
				</div>

				{/* Info */}
				<div className="p-3">
					<h3 className="font-medium text-primary text-sm truncate">{garment.name}</h3>
					<div className="flex items-center justify-between mt-1">
						<span className="text-xs text-secondary capitalize">
							{garment.category}
						</span>
						<span
							className="text-xs px-2 py-1 rounded-full border"
							style={{
								backgroundColor: garment.color.toLowerCase().includes('#') ? garment.color : `${garment.color}20`,
								borderColor: garment.color.toLowerCase().includes('#') ? garment.color : garment.color
							}}
						>
							{garment.color}
						</span>
					</div>
					{garment.brand && (
						<p className="text-xs text-secondary mt-1 truncate">{garment.brand}</p>
					)}
				</div>
			</div>
		</div>
	)
}

export default WardrobeItemSelection
