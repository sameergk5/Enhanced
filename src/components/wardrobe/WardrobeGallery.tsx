import { Eye, Filter, Grid, Heart, List, Plus, RefreshCw, Search, Trash2, Upload } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { wardrobeService, type Garment, type GarmentFilters } from '../../services/wardrobe'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { Skeleton } from '../ui/Skeleton'
// import GarmentUploadModal from './GarmentUploadModal'
import { GarmentDetailModal } from './GarmentDetailModal'

interface WardrobeGalleryProps {
	className?: string
}

const CATEGORIES = [
	{ id: 'all', name: 'All Items', icon: Grid },
	{ id: 'top', name: 'Tops', icon: Grid },
	{ id: 'bottom', name: 'Bottoms', icon: Grid },
	{ id: 'dress', name: 'Dresses', icon: Grid },
	{ id: 'shoes', name: 'Shoes', icon: Grid },
	{ id: 'accessory', name: 'Accessories', icon: Grid },
	{ id: 'outerwear', name: 'Outerwear', icon: Grid }
]

const WardrobeGallery: React.FC<WardrobeGalleryProps> = ({ className }) => {
	const [garments, setGarments] = useState<Garment[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [refreshing, setRefreshing] = useState(false)

	// Filters and search
	const [filters] = useState<GarmentFilters>({}) // setFilters temporarily unused
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('all')

	// View modes and UI state
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
	const [showFilters, setShowFilters] = useState(false)

	// Modals
	// const [showUploadModal, setShowUploadModal] = useState(false) // Temporarily disabled
	const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null)
	const [showDetailModal, setShowDetailModal] = useState(false)

	// Statistics
	const [categoryStats, setCategoryStats] = useState<Record<string, number>>({})

	// Load garments with current filters
	const loadGarments = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)

			const currentFilters: GarmentFilters = {
				...filters,
				...(selectedCategory !== 'all' && { category: selectedCategory }),
				...(searchTerm && { search: searchTerm })
			}

			const data = await wardrobeService.getGarments(currentFilters)
			setGarments(data)

			// Calculate category statistics
			const stats = data.reduce((acc, garment) => {
				acc[garment.category] = (acc[garment.category] || 0) + 1
				return acc
			}, {} as Record<string, number>)
			setCategoryStats(stats)

		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load garments')
		} finally {
			setLoading(false)
		}
	}, [filters, selectedCategory, searchTerm])

	// Refresh data
	const handleRefresh = async () => {
		setRefreshing(true)
		await loadGarments()
		setRefreshing(false)
	}

	// Load data on mount and filter changes
	useEffect(() => {
		loadGarments()
	}, [loadGarments])

	// Handle search with debouncing
	useEffect(() => {
		const timer = setTimeout(() => {
			loadGarments()
		}, 300)

		return () => clearTimeout(timer)
	}, [searchTerm])

	// Handle category selection
	const handleCategorySelect = (categoryId: string) => {
		setSelectedCategory(categoryId)
	}

	// Handle garment upload completion
	// const handleUploadComplete = () => {
	//   setShowUploadModal(false)
	//   loadGarments()
	// }

	// Handle garment view
	const handleViewGarment = (garment: Garment) => {
		setSelectedGarment(garment)
		setShowDetailModal(true)
	}

	// Handle garment delete
	const handleDeleteGarment = async (garmentId: string) => {
		if (!confirm('Are you sure you want to delete this garment?')) return

		try {
			await wardrobeService.deleteGarment(garmentId)
			setGarments(prev => prev.filter(g => g.id !== garmentId))
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete garment')
		}
	}

	// Get category count
	const getCategoryCount = (categoryId: string) => {
		if (categoryId === 'all') {
			return Object.values(categoryStats).reduce((sum, count) => sum + count, 0)
		}
		return categoryStats[categoryId] || 0
	}

	// Filter garments based on current selection
	const filteredGarments = garments.filter(garment => {
		if (selectedCategory !== 'all' && garment.category !== selectedCategory) {
			return false
		}
		if (searchTerm) {
			const search = searchTerm.toLowerCase()
			return (
				garment.name.toLowerCase().includes(search) ||
				garment.category.toLowerCase().includes(search) ||
				garment.tags.some(tag => tag.toLowerCase().includes(search)) ||
				(garment.brand && garment.brand.toLowerCase().includes(search))
			)
		}
		return true
	})

	return (
		<div className={`min-h-screen bg-gray-50 ${className}`}>
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">My Wardrobe</h1>
							<p className="text-gray-600 mt-2">
								Organize and manage your clothing collection
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleRefresh}
								disabled={refreshing}
								className="flex items-center gap-2"
							>
								<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
								Refresh
							</Button>
							<Button
								onClick={() => {
									// Temporarily disabled - upload functionality
									console.log('Upload functionality temporarily disabled')
								}}
								className="flex items-center gap-2"
							>
								<Plus className="h-4 w-4" />
								Add Item
							</Button>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Sidebar - Categories */}
					<div className="lg:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Filter className="h-5 w-5" />
									Categories
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{CATEGORIES.map((category) => (
										<button
											key={category.id}
											onClick={() => handleCategorySelect(category.id)}
											className={`w-full text-left p-3 rounded-lg transition-colors ${selectedCategory === category.id
													? 'bg-purple-100 text-purple-700 border border-purple-200'
													: 'hover:bg-gray-100'
												}`}
										>
											<div className="flex justify-between items-center">
												<span className="font-medium">{category.name}</span>
												<Badge variant="secondary" className="text-xs">
													{getCategoryCount(category.id)}
												</Badge>
											</div>
										</button>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Quick Stats */}
						<Card className="mt-4">
							<CardHeader>
								<CardTitle className="text-lg">Quick Stats</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">Total Items</span>
									<span className="font-semibold">{garments.length}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Categories</span>
									<span className="font-semibold">{Object.keys(categoryStats).length}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Recently Added</span>
									<span className="font-semibold">
										{garments.filter(g => {
											const daysSince = (Date.now() - new Date(g.createdAt).getTime()) / (1000 * 60 * 60 * 24)
											return daysSince <= 7
										}).length}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Main Content */}
					<div className="lg:col-span-3">
						{/* Search and Controls */}
						<Card className="mb-6">
							<CardContent className="pt-6">
								<div className="flex gap-4 items-center">
									<div className="flex-1 relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											placeholder="Search your wardrobe..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10"
										/>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
											className="flex items-center gap-2"
										>
											{viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
											{viewMode === 'grid' ? 'List' : 'Grid'}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setShowFilters(!showFilters)}
											className="flex items-center gap-2"
										>
											<Filter className="h-4 w-4" />
											Filters
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Error Display */}
						{error && (
							<Card className="mb-6 border-red-200 bg-red-50">
								<CardContent className="pt-6">
									<p className="text-red-800">{error}</p>
									<Button
										variant="outline"
										size="sm"
										onClick={loadGarments}
										className="mt-2"
									>
										Try Again
									</Button>
								</CardContent>
							</Card>
						)}

						{/* Loading State */}
						{loading && (
							<Card>
								<CardContent className="pt-6">
									<div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
										{Array.from({ length: 8 }).map((_, i) => (
											<div key={i} className="space-y-3">
												<Skeleton className="h-48 w-full" />
												<Skeleton className="h-4 w-3/4" />
												<Skeleton className="h-3 w-1/2" />
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Garments Display */}
						{!loading && !error && (
							<Card>
								<CardHeader>
									<CardTitle>
										{selectedCategory === 'all' ? 'All Items' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
									</CardTitle>
									<CardDescription>
										{searchTerm ? (
											`${filteredGarments.length} results for "${searchTerm}"`
										) : (
											`${filteredGarments.length} items in your wardrobe`
										)}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{filteredGarments.length === 0 ? (
										<div className="text-center py-12">
											<Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
											<h3 className="text-lg font-medium text-gray-900 mb-2">
												{searchTerm ? 'No items found' : 'No items yet'}
											</h3>
											<p className="text-gray-600 mb-4">
												{searchTerm
													? 'Try adjusting your search terms or filters'
													: 'Start building your digital wardrobe by adding your first item'
												}
											</p>
											{!searchTerm && (
												<Button onClick={() => {
													// Temporarily disabled - upload functionality
													console.log('Upload functionality temporarily disabled')
												}}>
													Add Your First Item
												</Button>
											)}
										</div>
									) : viewMode === 'grid' ? (
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{filteredGarments.map((garment) => (
												<GarmentCard
													key={garment.id}
													garment={garment}
													onView={() => handleViewGarment(garment)}
													onDelete={() => handleDeleteGarment(garment.id)}
												/>
											))}
										</div>
									) : (
										<div className="space-y-3">
											{filteredGarments.map((garment) => (
												<GarmentListItem
													key={garment.id}
													garment={garment}
													onView={() => handleViewGarment(garment)}
													onDelete={() => handleDeleteGarment(garment.id)}
												/>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>

			{/* Modals */}
			{/* Upload Modal - Temporarily disabled due to import issue */}
			{/* {showUploadModal && (
        <GarmentUploadModal
          onComplete={handleUploadComplete}
          onCancel={() => setShowUploadModal(false)}
        />
      )} */}

			{showDetailModal && selectedGarment && (
				<GarmentDetailModal
					garment={selectedGarment}
					isOpen={showDetailModal}
					onClose={() => {
						setShowDetailModal(false)
						setSelectedGarment(null)
					}}
					onUpdate={loadGarments}
				/>
			)}
		</div>
	)
}

// Garment Card Component for Grid View
interface GarmentCardProps {
	garment: Garment
	onView: () => void
	onDelete: () => void
}

const GarmentCard: React.FC<GarmentCardProps> = ({ garment, onView, onDelete }) => {
	const [imageError, setImageError] = useState(false)

	return (
		<div className="group relative bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
			<div className="aspect-square relative overflow-hidden rounded-t-lg">
				{!imageError ? (
					<img
						src={garment.thumbnailUrl || garment.images[0]}
						alt={garment.name}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="w-full h-full bg-gray-200 flex items-center justify-center">
						<Upload className="h-8 w-8 text-gray-400" />
					</div>
				)}

				{/* Overlay Actions */}
				<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="secondary"
							onClick={onView}
							className="flex items-center gap-1"
						>
							<Eye className="h-4 w-4" />
							View
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={onDelete}
							className="flex items-center gap-1"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<div className="p-3">
				<h3 className="font-medium text-gray-900 truncate mb-1">{garment.name}</h3>
				<p className="text-sm text-gray-600 capitalize mb-2">{garment.category}</p>

				<div className="flex items-center justify-between">
					<div className="flex flex-wrap gap-1">
						<Badge variant="outline" className="text-xs">
							{garment.color}
						</Badge>
						{garment.brand && (
							<Badge variant="secondary" className="text-xs">
								{garment.brand}
							</Badge>
						)}
					</div>

					{garment.isFavorite && (
						<Heart className="h-4 w-4 text-red-500 fill-current" />
					)}
				</div>

				{garment.tags.length > 0 && (
					<div className="mt-2">
						<div className="flex flex-wrap gap-1">
							{garment.tags.slice(0, 2).map((tag, index) => (
								<Badge key={index} variant="outline" className="text-xs">
									{tag}
								</Badge>
							))}
							{garment.tags.length > 2 && (
								<Badge variant="outline" className="text-xs">
									+{garment.tags.length - 2}
								</Badge>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

// Garment List Item Component for List View
interface GarmentListItemProps {
	garment: Garment
	onView: () => void
	onDelete: () => void
}

const GarmentListItem: React.FC<GarmentListItemProps> = ({ garment, onView, onDelete }) => {
	const [imageError, setImageError] = useState(false)

	return (
		<div className="flex items-center p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow">
			<div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg mr-4">
				{!imageError ? (
					<img
						src={garment.thumbnailUrl || garment.images[0]}
						alt={garment.name}
						className="w-full h-full object-cover"
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="w-full h-full bg-gray-200 flex items-center justify-center">
						<Upload className="h-4 w-4 text-gray-400" />
					</div>
				)}
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between">
					<h3 className="font-medium text-gray-900 truncate">{garment.name}</h3>
					<div className="flex items-center gap-2 ml-4">
						{garment.isFavorite && (
							<Heart className="h-4 w-4 text-red-500 fill-current" />
						)}
						<Button size="sm" variant="outline" onClick={onView}>
							<Eye className="h-4 w-4" />
						</Button>
						<Button size="sm" variant="outline" onClick={onDelete}>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
					<span className="capitalize">{garment.category}</span>
					<span>{garment.color}</span>
					{garment.brand && <span>{garment.brand}</span>}
					{garment.wearCount && <span>Worn {garment.wearCount} times</span>}
				</div>

				{garment.tags.length > 0 && (
					<div className="mt-2 flex flex-wrap gap-1">
						{garment.tags.slice(0, 5).map((tag, index) => (
							<Badge key={index} variant="outline" className="text-xs">
								{tag}
							</Badge>
						))}
						{garment.tags.length > 5 && (
							<Badge variant="outline" className="text-xs">
								+{garment.tags.length - 5}
							</Badge>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default WardrobeGallery
