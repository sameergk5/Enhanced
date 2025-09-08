// Outfit Combination Manager Component - State Management Demo
import {
	CheckIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	RefreshCcwIcon,
	SettingsIcon,
	ShuffleIcon,
	XIcon
} from 'lucide-react'
import React, { useState } from 'react'
import { useOutfitManager, useOutfitNavigation, useOutfitSettings, useOutfitSync } from '../../hooks/useOutfitManager'
import { wardrobeService, type Garment } from '../../services/wardrobe'

export interface OutfitCombinationManagerProps {
	onCombinationSelect?: (combination: any) => void
	onPreview?: (combination: any) => void
	className?: string
}

const OutfitCombinationManager: React.FC<OutfitCombinationManagerProps> = ({
	onCombinationSelect,
	onPreview,
	className = ''
}) => {
	// State management hooks
	const outfit = useOutfitManager()
	const navigation = useOutfitNavigation()
	const settings = useOutfitSettings()
	const sync = useOutfitSync()

	// UI state
	const [showSettings, setShowSettings] = useState(false)
	const [browseModeGarments, setBrowseModeGarments] = useState<Garment[]>([])
	const [loadingGarments, setLoadingGarments] = useState(false)

	/**
	 * Load sample garments for demonstration
	 */
	const loadSampleGarments = async () => {
		try {
			setLoadingGarments(true)
			const garments = await wardrobeService.getGarments({ search: '' })
			setBrowseModeGarments(garments.slice(0, 20)) // Limit for demo
		} catch (error) {
			console.error('Failed to load garments:', error)
		} finally {
			setLoadingGarments(false)
		}
	}

	// Load garments on mount
	React.useEffect(() => {
		loadSampleGarments()
	}, [])

	/**
	 * Handle combination selection
	 */
	const handleCombinationSelect = (combination: any) => {
		if (onCombinationSelect) {
			onCombinationSelect(combination)
		}
	}

	return (
		<div className={`outfit-combination-manager ${className}`}>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

				{/* Left Panel - Garment Selection */}
				<div className="lg:col-span-2 space-y-6">
					{/* Selection Header */}
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-medium text-gray-900">Select Items</h3>
							<p className="text-sm text-gray-600">
								{outfit.selectedCount} items selected • {navigation.total} combinations generated
							</p>
						</div>

						<div className="flex space-x-2">
							<button
								onClick={() => setShowSettings(!showSettings)}
								className={`p-2 rounded-lg border transition-colors ${showSettings
										? 'bg-blue-50 border-blue-300 text-blue-700'
										: 'border-gray-300 text-gray-700 hover:bg-gray-50'
									}`}
							>
								<SettingsIcon className="w-4 h-4" />
							</button>

							<button
								onClick={outfit.clearSelection}
								disabled={outfit.selectedCount === 0}
								className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
							>
								Clear All
							</button>
						</div>
					</div>

					{/* Settings Panel */}
					{showSettings && (
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
							<h4 className="font-medium text-gray-900">Generation Settings</h4>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<label className="flex items-center">
									<input
										type="checkbox"
										checked={settings.options.includeOptional}
										onChange={(e) => settings.updateOption('includeOptional', e.target.checked)}
										className="w-4 h-4 text-blue-600 border-gray-300 rounded mr-2"
									/>
									<span className="text-sm text-gray-700">Include Optional Items</span>
								</label>

								<label className="flex items-center">
									<input
										type="checkbox"
										checked={settings.options.prioritizeFavorites}
										onChange={(e) => settings.updateOption('prioritizeFavorites', e.target.checked)}
										className="w-4 h-4 text-blue-600 border-gray-300 rounded mr-2"
									/>
									<span className="text-sm text-gray-700">Prioritize Favorites</span>
								</label>

								<label className="flex items-center">
									<input
										type="checkbox"
										checked={settings.options.respectSeasonality}
										onChange={(e) => settings.updateOption('respectSeasonality', e.target.checked)}
										className="w-4 h-4 text-blue-600 border-gray-300 rounded mr-2"
									/>
									<span className="text-sm text-gray-700">Seasonal Matching</span>
								</label>

								<div>
									<label className="block text-sm text-gray-700 mb-1">Max Combinations</label>
									<input
										type="number"
										min="5"
										max="50"
										value={settings.options.maxCombinations}
										onChange={(e) => settings.updateOption('maxCombinations', parseInt(e.target.value))}
										className="w-full p-2 border border-gray-300 rounded text-sm"
									/>
								</div>
							</div>
						</div>
					)}

					{/* Garment Grid */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="font-medium text-gray-900">Available Items</h4>
							<button
								onClick={loadSampleGarments}
								disabled={loadingGarments}
								className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
							>
								{loadingGarments ? 'Loading...' : 'Refresh'}
							</button>
						</div>

						{browseModeGarments.length > 0 ? (
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
								{browseModeGarments.map((garment) => (
									<GarmentSelectionCard
										key={garment.id}
										garment={garment}
										isSelected={sync.selectedIds.includes(garment.id)}
										onToggle={() => {
											if (sync.selectedIds.includes(garment.id)) {
												outfit.removeItem(garment.id)
											} else {
												outfit.addItem(garment)
											}
										}}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-gray-500">
								{loadingGarments ? 'Loading garments...' : 'No garments available'}
							</div>
						)}
					</div>
				</div>

				{/* Right Panel - Combination Manager */}
				<div className="space-y-6">
					{/* Current Selection Summary */}
					<div className="bg-white border border-gray-200 rounded-lg p-4">
						<h4 className="font-medium text-gray-900 mb-3">Current Selection</h4>

						{outfit.selectedCount > 0 ? (
							<div className="space-y-2">
								{Object.values(outfit.selectedItems).map((item) => (
									<div key={item.garmentId} className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
												{item.garment.thumbnailUrl && (
													<img
														src={item.garment.thumbnailUrl}
														alt={item.garment.name}
														className="w-full h-full object-cover"
													/>
												)}
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900 truncate">
													{item.garment.name}
												</p>
												<p className="text-xs text-gray-500 capitalize">
													{item.garment.category}
												</p>
											</div>
										</div>

										<button
											onClick={() => outfit.removeItem(item.garmentId)}
											className="w-6 h-6 text-gray-400 hover:text-red-600"
										>
											<XIcon className="w-4 h-4" />
										</button>
									</div>
								))}

								{outfit.canGenerate && (
									<button
										onClick={outfit.generateCombinations}
										disabled={outfit.isGenerating}
										className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
									>
										{outfit.isGenerating ? (
											<>
												<RefreshCcwIcon className="w-4 h-4 mr-2 animate-spin" />
												Generating...
											</>
										) : (
											<>
												<ShuffleIcon className="w-4 h-4 mr-2" />
												Generate Combos
											</>
										)}
									</button>
								)}
							</div>
						) : (
							<p className="text-sm text-gray-500 text-center py-4">
								Select items to create outfits
							</p>
						)}
					</div>

					{/* Combination Navigation */}
					{navigation.total > 0 && (
						<div className="bg-white border border-gray-200 rounded-lg p-4">
							<div className="flex items-center justify-between mb-3">
								<h4 className="font-medium text-gray-900">Generated Combinations</h4>
								<span className="text-sm text-gray-500">
									{navigation.index + 1} of {navigation.total}
								</span>
							</div>

							{/* Navigation Controls */}
							<div className="flex items-center justify-center space-x-2 mb-4">
								<button
									onClick={navigation.previous}
									disabled={!navigation.hasPrevious}
									className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
								>
									<ChevronLeftIcon className="w-4 h-4" />
								</button>

								<span className="px-3 py-1 bg-gray-100 rounded text-sm">
									{navigation.index + 1}
								</span>

								<button
									onClick={navigation.next}
									disabled={!navigation.hasNext}
									className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
								>
									<ChevronRightIcon className="w-4 h-4" />
								</button>
							</div>

							{/* Current Combination Details */}
							{navigation.current && (
								<div className="space-y-3">
									<div className="text-center">
										<h5 className="font-medium text-gray-900">{navigation.current.name}</h5>
										<p className="text-sm text-gray-500 capitalize">
											{navigation.current.styleCategory} • {navigation.current.items.length} items
										</p>
										<div className="mt-2">
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div
													className="bg-blue-600 h-2 rounded-full"
													style={{ width: `${navigation.current.compatibility * 100}%` }}
												></div>
											</div>
											<p className="text-xs text-gray-500 mt-1">
												{Math.round(navigation.current.compatibility * 100)}% compatibility
											</p>
										</div>
									</div>

									{/* Combination Items */}
									<div className="space-y-2">
										{navigation.current.items.map((item, index) => (
											<div key={index} className="flex items-center space-x-2">
												<div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
													{item.garment.thumbnailUrl && (
														<img
															src={item.garment.thumbnailUrl}
															alt={item.garment.name}
															className="w-full h-full object-cover"
														/>
													)}
												</div>
												<div className="flex-1">
													<p className="text-sm font-medium text-gray-900 truncate">
														{item.garment.name}
													</p>
													<p className="text-xs text-gray-500 capitalize">
														{item.garment.category} • Layer {item.layer}
													</p>
												</div>
											</div>
										))}
									</div>

									{/* Action Buttons */}
									<div className="flex space-x-2 pt-3 border-t border-gray-200">
										<button
											onClick={() => handleCombinationSelect(navigation.current)}
											className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
										>
											<CheckIcon className="w-4 h-4 mr-1 inline" />
											Select
										</button>

										{onPreview && (
											<button
												onClick={() => onPreview?.(navigation.current)}
												className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
											>
												Preview
											</button>
										)}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Generation Stats */}
					{outfit.selectedCount > 0 && (
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
							<h5 className="text-sm font-medium text-gray-900 mb-2">Generation Stats</h5>
							<div className="space-y-1 text-xs text-gray-600">
								<div className="flex justify-between">
									<span>Selected Items:</span>
									<span>{outfit.selectedCount}</span>
								</div>
								<div className="flex justify-between">
									<span>Generated Combinations:</span>
									<span>{navigation.total}</span>
								</div>
								<div className="flex justify-between">
									<span>Can Generate:</span>
									<span>{outfit.canGenerate ? 'Yes' : 'No'}</span>
								</div>
								{outfit.isGenerating && (
									<div className="flex justify-between">
										<span>Status:</span>
										<span className="text-blue-600">Generating...</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

/**
 * Individual Garment Selection Card
 */
interface GarmentSelectionCardProps {
	garment: Garment
	isSelected: boolean
	onToggle: () => void
}

const GarmentSelectionCard: React.FC<GarmentSelectionCardProps> = ({
	garment,
	isSelected,
	onToggle
}) => {
	const [imageError, setImageError] = useState(false)
	const imageUrl = garment.thumbnailUrl || garment.images[0]

	return (
		<div
			className={`relative cursor-pointer transition-all duration-200 ${isSelected
					? 'ring-2 ring-blue-500 ring-offset-1 transform scale-105'
					: 'hover:shadow-md hover:scale-102'
				}`}
			onClick={onToggle}
		>
			{/* Selection Indicator */}
			{isSelected && (
				<div className="absolute top-1 left-1 z-10 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
					<CheckIcon className="w-3 h-3 text-white" />
				</div>
			)}

			<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
				{/* Image */}
				<div className="aspect-square bg-gray-100 relative">
					{imageUrl && !imageError ? (
						<img
							src={imageUrl}
							alt={garment.name}
							className="w-full h-full object-cover"
							onError={() => setImageError(true)}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-gray-400">
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
							</svg>
						</div>
					)}
				</div>

				{/* Info */}
				<div className="p-2">
					<h4 className="text-xs font-medium text-gray-900 truncate">{garment.name}</h4>
					<p className="text-xs text-gray-500 capitalize mt-1">{garment.category}</p>
				</div>
			</div>
		</div>
	)
}

export default OutfitCombinationManager
