import { BarChart3, Calendar, Edit3, Heart, Save, Trash2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { wardrobeService, type AIAnalysisStatus, type Garment } from '../../services/wardrobe'
import { Badge } from '../ui/Badge'
import { AIMetadataDisplay } from './AIMetadataDisplay'

interface GarmentDetailModalProps {
	garment: Garment | null
	isOpen: boolean
	onClose: () => void
	onUpdate?: (garment: Garment) => void
	onDelete?: (garmentId: string) => void
}

export const GarmentDetailModal: React.FC<GarmentDetailModalProps> = ({
	garment,
	isOpen,
	onClose,
	onUpdate,
	onDelete
}) => {
	const [isEditing, setIsEditing] = useState(false)
	const [isEditingAI, setIsEditingAI] = useState(false)
	const [editedGarment, setEditedGarment] = useState<Partial<Garment>>({})
	const [aiStatus, setAiStatus] = useState<AIAnalysisStatus | null>(null)
	const [isReanalyzing, setIsReanalyzing] = useState(false)

	useEffect(() => {
		if (garment && isOpen) {
			setEditedGarment(garment)
			loadAIStatus()
		}
	}, [garment, isOpen])

	const loadAIStatus = async () => {
		if (!garment?.id) return

		try {
			const status = await wardrobeService.getAIAnalysisStatus(garment.id)
			setAiStatus(status)
		} catch (error) {
			console.error('Failed to load AI status:', error)
		}
	}

	const handleAIReanalysis = async () => {
		if (!garment?.id) return

		setIsReanalyzing(true)
		try {
			await wardrobeService.reanalyzeGarment(garment.id)
			// Refresh AI status after triggering reanalysis
			setTimeout(loadAIStatus, 1000)
		} catch (error) {
			console.error('Failed to trigger reanalysis:', error)
		} finally {
			setIsReanalyzing(false)
		}
	}

	const handleSave = async () => {
		if (!garment?.id || !editedGarment) return

		try {
			const updatedGarment = await wardrobeService.updateGarment(garment.id, {
				name: editedGarment.name,
				category: editedGarment.category,
				primaryColor: editedGarment.color,
				brand: editedGarment.brand,
				description: editedGarment.description,
				tags: editedGarment.tags
			})

			if (onUpdate) {
				onUpdate(updatedGarment)
			}
			setIsEditing(false)
		} catch (error) {
			console.error('Failed to update garment:', error)
		}
	}

	const handleAISave = async (updatedMetadata: any) => {
		if (!garment?.id) return

		try {
			const updatedGarment = await wardrobeService.updateGarment(garment.id, {
				category: updatedMetadata.category,
				primaryColor: updatedMetadata.color,
				brand: updatedMetadata.brand,
				// Add other AI metadata fields as needed
			})

			if (onUpdate) {
				onUpdate(updatedGarment)
			}
			setIsEditingAI(false)
			loadAIStatus() // Refresh AI status
		} catch (error) {
			console.error('Failed to update AI metadata:', error)
		}
	}

	const handleToggleFavorite = async () => {
		if (!garment?.id) return

		try {
			const updatedGarment = await wardrobeService.toggleFavorite(garment.id)
			if (onUpdate) {
				onUpdate(updatedGarment)
			}
			setEditedGarment(prev => ({ ...prev, isFavorite: updatedGarment.isFavorite }))
		} catch (error) {
			console.error('Failed to toggle favorite:', error)
		}
	}

	const handleRecordWear = async () => {
		if (!garment?.id) return

		try {
			const updatedGarment = await wardrobeService.recordWear(garment.id)
			if (onUpdate) {
				onUpdate(updatedGarment)
			}
			setEditedGarment(prev => ({
				...prev,
				wearCount: updatedGarment.wearCount,
				lastWorn: updatedGarment.lastWorn
			}))
		} catch (error) {
			console.error('Failed to record wear:', error)
		}
	}

	const handleDelete = async () => {
		if (!garment?.id) return

		if (window.confirm('Are you sure you want to delete this garment? This action cannot be undone.')) {
			try {
				await wardrobeService.deleteGarment(garment.id)
				if (onDelete) {
					onDelete(garment.id)
				}
				onClose()
			} catch (error) {
				console.error('Failed to delete garment:', error)
			}
		}
	}

	const updateField = (field: keyof Garment, value: any) => {
		setEditedGarment(prev => ({ ...prev, [field]: value }))
	}

	if (!isOpen || !garment) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b">
					<h2 className="text-2xl font-bold text-gray-900">
						{isEditing ? (
							<input
								type="text"
								value={editedGarment.name || ''}
								onChange={(e) => updateField('name', e.target.value)}
								className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
								placeholder="Garment name"
							/>
						) : (
							garment.name
						)}
					</h2>

					<div className="flex items-center gap-2">
						{isEditing ? (
							<>
								<button
									onClick={handleSave}
									className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									<Save size={16} />
									Save
								</button>
								<button
									onClick={() => {
										setIsEditing(false)
										setEditedGarment(garment)
									}}
									className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
								>
									Cancel
								</button>
							</>
						) : (
							<button
								onClick={() => setIsEditing(true)}
								className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
							>
								<Edit3 size={16} />
								Edit
							</button>
						)}

						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-100 rounded-lg"
						>
							<X size={20} />
						</button>
					</div>
				</div>

				<div className="p-6 space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Image */}
						<div>
							<img
								src={garment.images[0] || '/api/placeholder/400/500'}
								alt={garment.name}
								className="w-full h-96 object-cover rounded-lg shadow-md"
							/>

							{garment.images.length > 1 && (
								<div className="flex gap-2 mt-4 overflow-x-auto">
									{garment.images.map((image, index) => (
										<img
											key={index}
											src={image}
											alt={`${garment.name} ${index + 1}`}
											className="w-16 h-16 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-75"
										/>
									))}
								</div>
							)}
						</div>

						{/* Details */}
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<button
									onClick={handleToggleFavorite}
									className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${garment.isFavorite
											? 'bg-red-100 text-red-700 hover:bg-red-200'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
								>
									<Heart size={16} className={garment.isFavorite ? 'fill-current' : ''} />
									{garment.isFavorite ? 'Favorited' : 'Add to Favorites'}
								</button>

								<button
									onClick={handleRecordWear}
									className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
								>
									<Calendar size={16} />
									Wear Today
								</button>
							</div>

							{/* Basic Info */}
							<div className="space-y-3">
								<div>
									<label className="text-sm font-medium text-gray-700">Category</label>
									{isEditing ? (
										<select
											value={editedGarment.category || ''}
											onChange={(e) => updateField('category', e.target.value)}
											className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="">Select category</option>
											<option value="top">Top</option>
											<option value="bottom">Bottom</option>
											<option value="dress">Dress</option>
											<option value="shoes">Shoes</option>
											<option value="accessory">Accessory</option>
											<option value="outerwear">Outerwear</option>
										</select>
									) : (
										<div className="mt-1">
											<Badge variant="outline" className="capitalize">{garment.category}</Badge>
										</div>
									)}
								</div>

								<div>
									<label className="text-sm font-medium text-gray-700">Color</label>
									{isEditing ? (
										<input
											type="text"
											value={editedGarment.color || ''}
											onChange={(e) => updateField('color', e.target.value)}
											className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Primary color"
										/>
									) : (
										<p className="mt-1 text-gray-900">{garment.color}</p>
									)}
								</div>

								{garment.brand && (
									<div>
										<label className="text-sm font-medium text-gray-700">Brand</label>
										{isEditing ? (
											<input
												type="text"
												value={editedGarment.brand || ''}
												onChange={(e) => updateField('brand', e.target.value)}
												className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												placeholder="Brand name"
											/>
										) : (
											<p className="mt-1 text-gray-900">{garment.brand}</p>
										)}
									</div>
								)}

								<div>
									<label className="text-sm font-medium text-gray-700">Description</label>
									{isEditing ? (
										<textarea
											value={editedGarment.description || ''}
											onChange={(e) => updateField('description', e.target.value)}
											className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows={3}
											placeholder="Description"
										/>
									) : (
										<p className="mt-1 text-gray-900">{garment.description || 'No description'}</p>
									)}
								</div>

								{/* Tags */}
								<div>
									<label className="text-sm font-medium text-gray-700">Tags</label>
									<div className="mt-1 flex flex-wrap gap-2">
										{garment.tags?.map((tag, index) => (
											<Badge key={index} variant="secondary">{tag}</Badge>
										))}
									</div>
								</div>

								{/* Wear Stats */}
								<div className="flex items-center gap-4 text-sm text-gray-600">
									{garment.wearCount !== undefined && (
										<div className="flex items-center gap-1">
											<BarChart3 size={16} />
											Worn {garment.wearCount} times
										</div>
									)}
									{garment.lastWorn && (
										<div className="flex items-center gap-1">
											<Calendar size={16} />
											Last worn: {new Date(garment.lastWorn).toLocaleDateString()}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* AI Metadata Display */}
					<AIMetadataDisplay
						metadata={{
							category: aiStatus?.category,
							subcategory: aiStatus?.subcategory,
							color: aiStatus?.primaryColor,
							pattern: aiStatus?.pattern,
							material: aiStatus?.material,
							brand: aiStatus?.brand,
							style: aiStatus?.style,
							confidence: aiStatus?.confidence,
							aiStatus: aiStatus?.status,
							lastAnalyzed: aiStatus?.lastUpdated,
							errorMessage: aiStatus?.error
						}}
						isEditing={isEditingAI}
						onEdit={() => setIsEditingAI(true)}
						onSave={handleAISave}
						onCancel={() => setIsEditingAI(false)}
						onReanalyze={handleAIReanalysis}
						isReanalyzing={isReanalyzing}
					/>

					{/* Actions */}
					<div className="flex justify-between pt-4 border-t">
						<button
							onClick={handleDelete}
							className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
						>
							<Trash2 size={16} />
							Delete Garment
						</button>

						<div className="text-sm text-gray-500">
							Added: {new Date(garment.createdAt).toLocaleDateString()}
							{garment.updatedAt !== garment.createdAt && (
								<span className="ml-2">
									• Updated: {new Date(garment.updatedAt).toLocaleDateString()}
								</span>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
