import { Edit3, Eye, Filter, Grid, Heart, List, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WardrobeGridGarment {
	id: string
	name: string
	category: string
	type: string
	primaryColor: string
	colors: string[]
	imageUrl: string
	thumbnailUrl: string
	isFavorite: boolean
	wearCount: number
	lastWorn: string | null
	createdAt: string
	updatedAt: string
}

interface WardrobeGridProps {
	onAddGarment: () => void
	onEditGarment: (garment: WardrobeGridGarment) => void
	onViewGarment: (garment: WardrobeGridGarment) => void
}

const WardrobeGrid = ({ onAddGarment, onEditGarment, onViewGarment }: WardrobeGridProps) => {
	const [garments, setGarments] = useState<WardrobeGridGarment[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('')
	const [colorFilter, setColorFilter] = useState('')
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const [showFilters, setShowFilters] = useState(false)
	const [statistics, setStatistics] = useState<any>(null)

	const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories']
	const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'navy', 'beige']

	useEffect(() => {
		loadGarments()
		loadStatistics()
	}, [categoryFilter, colorFilter])

	const loadGarments = async () => {
		try {
			setLoading(true)

			const params = new URLSearchParams()
			if (categoryFilter) params.append('category', categoryFilter)
			if (colorFilter) params.append('color', colorFilter)

			const response = await fetch(`/api/garments?${params.toString()}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			})

			const data = await response.json()

			if (data.success) {
				setGarments(data.garments)
			} else {
				setError(data.message || 'Failed to load garments')
			}
		} catch (err) {
			setError('Network error. Please try again.')
			console.error('Load garments error:', err)
		} finally {
			setLoading(false)
		}
	}

	const loadStatistics = async () => {
		try {
			const response = await fetch('/api/garments/statistics/wardrobe', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			})

			const data = await response.json()
			if (data.success) {
				setStatistics(data.statistics)
			}
		} catch (err) {
			console.error('Load statistics error:', err)
		}
	}

	const toggleFavorite = async (garmentId: string, currentFavorite: boolean) => {
		try {
			const response = await fetch(`/api/garments/${garmentId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({
					is_favorite: !currentFavorite
				})
			})

			const data = await response.json()
			if (data.success) {
				setGarments(prev =>
					prev.map(garment =>
						garment.id === garmentId
							? { ...garment, isFavorite: !currentFavorite }
							: garment
					)
				)
			}
		} catch (err) {
			console.error('Toggle favorite error:', err)
		}
	}

	const deleteGarment = async (garmentId: string) => {
		if (!confirm('Are you sure you want to delete this garment?')) {
			return
		}

		try {
			const response = await fetch(`/api/garments/${garmentId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			})

			const data = await response.json()
			if (data.success) {
				setGarments(prev => prev.filter(garment => garment.id !== garmentId))
				loadStatistics() // Refresh statistics
			}
		} catch (err) {
			console.error('Delete garment error:', err)
		}
	}

	const filteredGarments = garments.filter(garment =>
		garment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		garment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
		garment.type.toLowerCase().includes(searchTerm.toLowerCase())
	)

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
			</div>
		)
	}

	return (
		<div className="space-y-6 transition-theme">
			{/* Header with Statistics */}
			{statistics && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{[
						{ label: 'Total Items', value: statistics.total_garments, color: 'var(--color-primary)' },
						{ label: 'Favorites', value: statistics.favorites_count, color: 'var(--color-accent)' },
						{ label: 'Most Worn', value: statistics.most_worn?.wearCount || 0, extra: statistics.most_worn?.name || 'None', color: 'var(--color-success)' },
						{ label: 'Avg. Wear', value: statistics.average_wear_count, color: 'var(--color-warning)' }
					].map((card, idx) => (
						<div key={idx} className="p-4 rounded-lg bg-surface elevation-1 border transition-theme" style={{ borderColor: 'var(--color-surface-variant)' }}>
							<h3 className="text-lg font-semibold text-primary">{card.label}</h3>
							{card.extra && <p className="text-sm text-secondary truncate">{card.extra}</p>}
							<p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
						</div>
					))}
				</div>
			)}

			{/* Search and Filters */}
			<div className="bg-surface p-4 rounded-lg elevation-1 border transition-theme" style={{ borderColor: 'var(--color-surface-variant)' }}>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="flex-1 max-w-md">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
							<input
								type="text"
								placeholder="Search garments..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-transparent text-primary placeholder:text-secondary transition-theme"
								style={{ borderColor: 'var(--color-surface-variant)' }}
							/>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-theme ${showFilters ? 'btn-primary' : 'bg-surface-variant text-secondary hover:brightness-105'}`}
						>
							<Filter className="w-4 h-4" />
							<span>Filters</span>
						</button>

						<div className="flex rounded-lg border" style={{ borderColor: 'var(--color-surface-variant)' }}>
							<button
								onClick={() => setViewMode('grid')}
								className={`p-2 rounded-l-lg transition-theme ${viewMode === 'grid' ? 'btn-primary' : 'text-secondary hover:bg-surface-variant'}`}
							>
								<Grid className="w-4 h-4" />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`p-2 rounded-r-lg transition-theme ${viewMode === 'list' ? 'btn-primary' : 'text-secondary hover:bg-surface-variant'}`}
							>
								<List className="w-4 h-4" />
							</button>
						</div>

						<button
							onClick={onAddGarment}
							className="px-4 py-2 btn-primary rounded-lg flex items-center space-x-2"
						>
							<Plus className="w-4 h-4" />
							<span>Add Garment</span>
						</button>
					</div>
				</div>

				{/* Filter Options */}
				{showFilters && (
					<div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-surface-variant)' }}>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-secondary mb-1">Category</label>
								<select
									value={categoryFilter}
									onChange={(e) => setCategoryFilter(e.target.value)}
									className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-transparent text-primary transition-theme"
									style={{ borderColor: 'var(--color-surface-variant)' }}
								>
									<option value="">All Categories</option>
									{categories.map(category => (
										<option key={category} value={category}>
											{category.charAt(0).toUpperCase() + category.slice(1)}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-secondary mb-1">Color</label>
								<select
									value={colorFilter}
									onChange={(e) => setColorFilter(e.target.value)}
									className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-transparent text-primary transition-theme"
									style={{ borderColor: 'var(--color-surface-variant)' }}
								>
									<option value="">All Colors</option>
									{colors.map(color => (
										<option key={color} value={color}>
											{color.charAt(0).toUpperCase() + color.slice(1)}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				)}
			</div>

			{error && (
				<div className="rounded-lg p-4 border transition-theme" style={{ background: 'rgba(255,0,0,0.08)', borderColor: 'var(--color-error)' }}>
					<p className="text-[color:var(--color-error)]">{error}</p>
				</div>
			)}

			{/* Garment Grid/List */}
			{filteredGarments.length === 0 ? (
				<div className="text-center py-12 transition-theme">
					<div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
						<Plus className="w-8 h-8 text-secondary" />
					</div>
					<h3 className="text-lg font-medium text-primary mb-2">No garments found</h3>
					<p className="text-secondary mb-4">
						{searchTerm || categoryFilter || colorFilter
							? 'Try adjusting your search or filters'
							: 'Start building your wardrobe by adding your first garment'
						}
					</p>
					<button
						onClick={onAddGarment}
						className="px-6 py-2 btn-primary rounded-lg transition-theme"
					>
						Add Your First Garment
					</button>
				</div>
			) : (
				<div className={viewMode === 'grid'
					? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
					: 'space-y-4'
				}>
					{filteredGarments.map((garment) => (
						<div
							key={garment.id}
							className={`bg-surface rounded-lg elevation-1 border hover:elevation-2 transition-theme${viewMode === 'list' ? ' flex items-center p-4' : ' overflow-hidden'}`}
							style={{ borderColor: 'var(--color-surface-variant)' }}
						>
							{viewMode === 'grid' ? (
								<>
									<div className="relative">
										<img
											src={garment.thumbnailUrl || '/placeholder-garment.jpg'}
											alt={garment.name}
											className="w-full h-48 object-cover cursor-pointer"
											onClick={() => onViewGarment(garment)}
										/>
										<button
											onClick={() => toggleFavorite(garment.id, garment.isFavorite)}
											className={`absolute top-2 right-2 p-2 rounded-full transition-theme ${garment.isFavorite ? 'bg-surface-variant text-accent' : 'bg-surface text-secondary'} hover:scale-110 transition-transform`}
										>
											<Heart className={`w-4 h-4 ${garment.isFavorite ? 'fill-current' : ''}`} />
										</button>
									</div>
									<div className="p-4">
										<h3 className="font-medium text-primary truncate">{garment.name}</h3>
										<p className="text-sm text-secondary capitalize">{garment.category} • {garment.type}</p>
										<div className="flex items-center justify-between mt-2">
											<div className="flex space-x-1">
												{garment.colors.slice(0, 3).map((color, index) => (
													<div
														key={index}
														className="w-4 h-4 rounded-full border"
														// Use themed surface variant instead of hardcoded fallback for white swatch
														style={{ backgroundColor: color === 'white' ? 'var(--color-surface-variant)' : color, borderColor: 'var(--color-surface-variant)' }}
														title={color}
													/>
												))}
											</div>
											<span className="text-xs text-secondary">Worn {garment.wearCount}x</span>
										</div>
										<div className="flex items-center justify-between mt-3">
											<button
												onClick={() => onViewGarment(garment)}
												className="flex items-center space-x-1 text-primary hover:underline transition-theme"
											>
												<Eye className="w-4 h-4" />
												<span className="text-sm">View</span>
											</button>
											<div className="flex items-center space-x-2">
												<button
													onClick={() => onEditGarment(garment)}
													className="text-secondary hover:text-primary transition-theme"
												>
													<Edit3 className="w-4 h-4" />
												</button>
												<button
													onClick={() => deleteGarment(garment.id)}
													className="text-[color:var(--color-error)] hover:brightness-110 transition-theme"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</div>
									</div>
								</>
							) : (
								<>
									<img
										src={garment.thumbnailUrl || '/placeholder-garment.jpg'}
										alt={garment.name}
										className="w-16 h-16 object-cover rounded-lg cursor-pointer"
										onClick={() => onViewGarment(garment)}
									/>
									<div className="flex-1 ml-4">
										<h3 className="font-medium text-primary">{garment.name}</h3>
										<p className="text-sm text-secondary capitalize">{garment.category} • {garment.type}</p>
										<div className="flex items-center space-x-4 mt-1">
											<div className="flex space-x-1">
												{garment.colors.slice(0, 3).map((color, index) => (
													<div
														key={index}
														className="w-3 h-3 rounded-full border"
														// Use themed surface variant instead of hardcoded fallback for white swatch
														style={{ backgroundColor: color === 'white' ? 'var(--color-surface-variant)' : color, borderColor: 'var(--color-surface-variant)' }}
														title={color}
													/>
												))}
											</div>
											<span className="text-xs text-secondary">Worn {garment.wearCount}x</span>
											{garment.isFavorite && (
												<Heart className="w-3 h-3 text-accent fill-current" />
											)}
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() => onViewGarment(garment)}
											className="p-2 text-primary hover:underline rounded-lg transition-theme"
										>
											<Eye className="w-4 h-4" />
										</button>
										<button
											onClick={() => onEditGarment(garment)}
											className="p-2 text-secondary hover:text-primary rounded-lg transition-theme"
										>
											<Edit3 className="w-4 h-4" />
										</button>
										<button
											onClick={() => deleteGarment(garment.id)}
											className="p-2 text-[color:var(--color-error)] hover:brightness-110 rounded-lg transition-theme"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default WardrobeGrid
