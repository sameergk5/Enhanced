// Main Outfit Selection Interface - Complete Try-On Experience
import { ArrowLeftIcon, EyeIcon, SaveIcon, SparklesIcon } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { virtualTryOnService, type OutfitCombination, type OutfitItem } from '../../services/virtualTryOn'
import { Avatar3DViewer } from '../avatar/Avatar3DViewer'
import { OutfitBuilder, WardrobeItemSelection } from '../wardrobe'

export interface OutfitSelectionInterfaceProps {
	onOutfitSave?: (outfit: OutfitCombination) => void
	onBack?: () => void
	className?: string
}

type ViewMode = 'browse' | 'build' | 'preview'

const OutfitSelectionInterface: React.FC<OutfitSelectionInterfaceProps> = ({
	onOutfitSave,
	onBack,
	className = ''
}) => {
	const [currentView, setCurrentView] = useState<ViewMode>('browse')
	const [selectedItems, setSelectedItems] = useState<string[]>([])
	const [previewOutfit, setPreviewOutfit] = useState<OutfitItem[] | null>(null)
	const [savedOutfits, setSavedOutfits] = useState<OutfitCombination[]>([])
	const [loading, setLoading] = useState(false)

	/**
	 * Handle outfit creation from builder
	 */
	const handleOutfitCreate = useCallback((outfit: OutfitCombination) => {
		setSavedOutfits(prev => [...prev, outfit])
		if (onOutfitSave) {
			onOutfitSave(outfit)
		}
		// Return to browse view after saving
		setCurrentView('browse')
	}, [onOutfitSave])

	/**
	 * Handle preview request from builder
	 */
	const handlePreviewRequest = useCallback((outfitItems: OutfitItem[]) => {
		setPreviewOutfit(outfitItems)
		setCurrentView('preview')
	}, [])

	/**
	 * Quick try-on from browse mode
	 */
	const handleQuickTryOn = useCallback(async () => {
		if (selectedItems.length === 0) return

		try {
			setLoading(true)
			// Create a quick outfit from selected items
			const outfit = await virtualTryOnService.createCustomOutfit(selectedItems, 'Quick Try-On')
			setPreviewOutfit(outfit.items)
			setCurrentView('preview')
		} catch (err) {
			console.error('Failed to create quick try-on:', err)
		} finally {
			setLoading(false)
		}
	}, [selectedItems])

	/**
	 * Generate AI suggestions from current selection
	 */
	const handleAISuggestions = useCallback(async () => {
		if (selectedItems.length === 0) return

		try {
			setLoading(true)
			// Create a quick outfit first, then get suggestions
			const quickOutfit = await virtualTryOnService.createCustomOutfit(selectedItems, 'Quick Try-On')
			const suggestions = await virtualTryOnService.generateOutfitSuggestions(
				quickOutfit.items.map(item => item.garment)
			)

			if (suggestions.length > 0) {
				setPreviewOutfit(suggestions[0].items)
				setCurrentView('preview')
			}
		} catch (err) {
			console.error('Failed to generate AI suggestions:', err)
		} finally {
			setLoading(false)
		}
	}, [selectedItems])

	/**
	 * Render current view content
	 */
	const renderCurrentView = () => {
		switch (currentView) {
			case 'browse':
				return (
					<div className="space-y-6">
						{/* Browse Header */}
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold text-gray-900">Browse Wardrobe</h2>
								<p className="text-gray-600 mt-1">
									Select items to try on or build complete outfits
								</p>
							</div>

							{selectedItems.length > 0 && (
								<div className="flex space-x-3">
									<button
										onClick={handleQuickTryOn}
										disabled={loading}
										className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
									>
										<EyeIcon className="w-4 h-4 mr-2" />
										Quick Try-On
									</button>

									<button
										onClick={handleAISuggestions}
										disabled={loading}
										className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
									>
										<SparklesIcon className="w-4 h-4 mr-2" />
										AI Suggestions
									</button>

									<button
										onClick={() => setCurrentView('build')}
										className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
									>
										<SaveIcon className="w-4 h-4 mr-2" />
										Build Outfit
									</button>
								</div>
							)}
						</div>

						{/* Wardrobe Selection */}
						<WardrobeItemSelection
							selectedItems={selectedItems}
							onSelectionChange={setSelectedItems}
							maxSelections={10}
							allowMultiCategory={true}
						/>

						{/* Saved Outfits Section */}
						{savedOutfits.length > 0 && (
							<div className="mt-8">
								<h3 className="text-lg font-medium text-gray-900 mb-4">Saved Outfits</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{savedOutfits.map((outfit) => (
										<SavedOutfitCard
											key={outfit.id}
											outfit={outfit}
											onPreview={() => {
												setPreviewOutfit(outfit.items)
												setCurrentView('preview')
											}}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				)

			case 'build':
				return (
					<div className="space-y-6">
						{/* Build Header */}
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold text-gray-900">Build Outfit</h2>
								<p className="text-gray-600 mt-1">
									Select items from each category to create a complete look
								</p>
							</div>

							<button
								onClick={() => setCurrentView('browse')}
								className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
							>
								<ArrowLeftIcon className="w-4 h-4 mr-2" />
								Back to Browse
							</button>
						</div>

						{/* Outfit Builder */}
						<OutfitBuilder
							onOutfitCreate={handleOutfitCreate}
							onPreviewRequest={handlePreviewRequest}
						/>
					</div>
				)

			case 'preview':
				return (
					<div className="space-y-6">
						{/* Preview Header */}
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold text-gray-900">Outfit Preview</h2>
								<p className="text-gray-600 mt-1">
									See how your outfit looks on your avatar
								</p>
							</div>

							<button
								onClick={() => setCurrentView(selectedItems.length > 0 ? 'browse' : 'build')}
								className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
							>
								<ArrowLeftIcon className="w-4 h-4 mr-2" />
								Back
							</button>
						</div>

						{/* 3D Preview */}
						{previewOutfit && (
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* 3D Viewer */}
								<div className="lg:col-span-2">
									<Avatar3DViewer
										outfit={{
											id: 'preview',
											name: 'Preview',
											items: previewOutfit,
											compatibility: 1,
											styleCategory: 'casual',
											createdAt: new Date().toISOString()
										}}
										className="h-96 lg:h-[600px] bg-gray-100 rounded-lg"
									/>
								</div>

								{/* Outfit Details */}
								<div className="space-y-4">
									<div className="bg-white border border-gray-200 rounded-lg p-4">
										<h3 className="font-medium text-gray-900 mb-3">Outfit Details</h3>
										<div className="space-y-3">
											{previewOutfit.map((item, index) => (
												<div key={index} className="flex items-center space-x-3">
													<div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
														{item.garment.thumbnailUrl && (
															<img
																src={item.garment.thumbnailUrl}
																alt={item.garment.name}
																className="w-full h-full object-cover"
															/>
														)}
													</div>
													<div className="flex-1">
														<h4 className="text-sm font-medium text-gray-900">
															{item.garment.name}
														</h4>
														<p className="text-xs text-gray-500 capitalize">
															{item.garment.category} • {item.garment.color}
														</p>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Action Buttons */}
									<div className="space-y-3">
										<button
											onClick={() => setCurrentView('build')}
											className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
										>
											Modify Outfit
										</button>

										<button
											onClick={async () => {
												if (previewOutfit) {
													const garmentIds = previewOutfit.map(item => item.garmentId)
													const outfit = await virtualTryOnService.createCustomOutfit(garmentIds, 'Previewed Outfit')
													handleOutfitCreate(outfit)
												}
											}}
											className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
										>
											Save Outfit
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				)

			default:
				return null
		}
	}

	return (
		<div className={`outfit-selection-interface ${className}`}>
			{/* Back Button (if provided) */}
			{onBack && (
				<button
					onClick={onBack}
					className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
				>
					<ArrowLeftIcon className="w-4 h-4 mr-2" />
					Back
				</button>
			)}

			{/* Loading Overlay */}
			{loading && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 flex items-center space-x-3">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
						<span className="text-gray-700">Processing...</span>
					</div>
				</div>
			)}

			{/* Main Content */}
			{renderCurrentView()}
		</div>
	)
}

/**
 * Saved Outfit Card Component
 */
interface SavedOutfitCardProps {
	outfit: OutfitCombination
	onPreview: () => void
}

const SavedOutfitCard: React.FC<SavedOutfitCardProps> = ({ outfit, onPreview }) => {
	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
			<div className="flex items-center justify-between mb-3">
				<h4 className="font-medium text-gray-900 truncate">{outfit.name || 'Untitled Outfit'}</h4>
				<span className="text-xs text-gray-500 capitalize">{outfit.styleCategory}</span>
			</div>

			<div className="flex items-center space-x-2 mb-3">
				{outfit.items.slice(0, 3).map((item, index) => (
					<div key={index} className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
						{item.garment.thumbnailUrl && (
							<img
								src={item.garment.thumbnailUrl}
								alt={item.garment.name}
								className="w-full h-full object-cover"
							/>
						)}
					</div>
				))}
				{outfit.items.length > 3 && (
					<div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
						<span className="text-xs text-gray-600">+{outfit.items.length - 3}</span>
					</div>
				)}
			</div>

			<div className="flex items-center justify-between">
				<span className="text-xs text-gray-500">{outfit.items.length} items</span>
				<button
					onClick={onPreview}
					className="text-sm text-blue-600 hover:text-blue-800"
				>
					Preview
				</button>
			</div>
		</div>
	)
}

export default OutfitSelectionInterface
