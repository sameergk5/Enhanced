import { AlertCircle, Camera, Check, Loader2, Upload, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { wardrobeService, type GarmentUploadData } from '../../services/wardrobe'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'

interface GarmentUploadModalProps {
	onComplete: () => void
	onCancel: () => void
}

const CATEGORIES = [
	{ id: 'top', name: 'Top', description: 'Shirts, blouses, sweaters' },
	{ id: 'bottom', name: 'Bottom', description: 'Pants, jeans, skirts' },
	{ id: 'dress', name: 'Dress', description: 'Dresses, jumpsuits' },
	{ id: 'shoes', name: 'Shoes', description: 'All types of footwear' },
	{ id: 'accessory', name: 'Accessory', description: 'Bags, jewelry, belts' },
	{ id: 'outerwear', name: 'Outerwear', description: 'Jackets, coats, blazers' }
]

const COLORS = [
	'black', 'white', 'gray', 'red', 'blue', 'green', 'yellow', 'orange',
	'purple', 'pink', 'brown', 'navy', 'beige', 'cream', 'gold', 'silver'
]

const GarmentUploadModal: React.FC<GarmentUploadModalProps> = ({ onComplete, onCancel }) => {
	const [step, setStep] = useState(1) // 1: Upload, 2: Metadata, 3: Processing
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	// uploading state removed (not yet implemented) to satisfy noUnusedLocals
	const [uploadProgress, setUploadProgress] = useState(0)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	// Metadata form
	const [metadata, setMetadata] = useState<GarmentUploadData>({
		name: '',
		category: 'top',
		primaryColor: '',
		colors: [],
		brand: '',
		description: '',
		tags: []
	})

	const [newTag, setNewTag] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Handle file selection
	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Validate file
		if (file.size > 10 * 1024 * 1024) {
			setError('File size must be less than 10MB')
			return
		}

		if (!file.type.startsWith('image/')) {
			setError('Please select an image file')
			return
		}

		setSelectedFile(file)
		setError(null)

		// Create preview
		const reader = new FileReader()
		reader.onload = (e) => {
			setPreviewUrl(e.target?.result as string)
		}
		reader.readAsDataURL(file)

		// Auto-populate name from filename
		if (!metadata.name) {
			const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
			setMetadata(prev => ({ ...prev, name: fileName }))
		}

		setStep(2)
	}

	// Handle drag and drop
	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault()
		const file = event.dataTransfer.files[0]
		if (file) {
			// Create a proper FileList
			const dataTransfer = new DataTransfer()
			dataTransfer.items.add(file)

			const syntheticEvent = {
				target: { files: dataTransfer.files }
			} as unknown as React.ChangeEvent<HTMLInputElement>
			handleFileSelect(syntheticEvent)
		}
	}

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault()
	}

	// Handle metadata changes
	const updateMetadata = (field: keyof GarmentUploadData, value: any) => {
		setMetadata(prev => ({ ...prev, [field]: value }))
	}

	// Handle color selection
	const toggleColor = (color: string) => {
		const colors = metadata.colors || []
		const newColors = colors.includes(color)
			? colors.filter(c => c !== color)
			: [...colors, color]

		updateMetadata('colors', newColors)

		// Set primary color if not set
		if (!metadata.primaryColor && newColors.length === 1) {
			updateMetadata('primaryColor', color)
		}
	}

	// Handle tag management
	const addTag = () => {
		if (newTag.trim() && !metadata.tags?.includes(newTag.trim())) {
			updateMetadata('tags', [...(metadata.tags || []), newTag.trim()])
			setNewTag('')
		}
	}

	const removeTag = (tagToRemove: string) => {
		updateMetadata('tags', metadata.tags?.filter(tag => tag !== tagToRemove) || [])
	}

	// Handle upload
	const handleUpload = async () => {
		if (!selectedFile) return

		try {
			// uploading indicator placeholder
			setError(null)
			setStep(3)

			// Simulate progress for user feedback
			const progressInterval = setInterval(() => {
				setUploadProgress(prev => Math.min(prev + 10, 90))
			}, 200)

			await wardrobeService.uploadGarment(selectedFile, metadata)

			clearInterval(progressInterval)
			setUploadProgress(100)
			setSuccess(true)

			// Show success for a moment then complete
			setTimeout(() => {
				onComplete()
			}, 1500)

		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed')
			setStep(2) // Go back to metadata step
		} finally {
			// uploading complete placeholder
		}
	}

	// Validation
	const canProceed = selectedFile && metadata.name && metadata.category

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Add New Garment</CardTitle>
							<CardDescription>
								Upload a photo and add details about your clothing item
							</CardDescription>
						</div>
						<Button variant="outline" size="sm" onClick={onCancel}>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Progress Indicator */}
					<div className="flex items-center gap-2 mt-4">
						<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
							}`}>
							1
						</div>
						<div className={`h-1 w-12 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
						<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
							}`}>
							2
						</div>
						<div className={`h-1 w-12 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`} />
						<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
							}`}>
							3
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Step 1: File Upload */}
					{step === 1 && (
						<div className="space-y-4">
							<div
								className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
								onDrop={handleDrop}
								onDragOver={handleDragOver}
								onClick={() => fileInputRef.current?.click()}
							>
								<Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									Choose a photo or drag it here
								</h3>
								<p className="text-gray-600 mb-4">
									Upload a clear photo of your garment. JPEG, PNG, or WebP up to 10MB.
								</p>
								<Button>
									<Camera className="h-4 w-4 mr-2" />
									Select Photo
								</Button>
							</div>

							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleFileSelect}
								className="hidden"
							/>

							{error && (
								<div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
									<AlertCircle className="h-4 w-4" />
									{error}
								</div>
							)}
						</div>
					)}

					{/* Step 2: Metadata */}
					{step === 2 && (
						<div className="space-y-6">
							{/* Preview */}
							{previewUrl && (
								<div className="flex justify-center">
									<img
										src={previewUrl}
										alt="Preview"
										className="w-32 h-32 object-cover rounded-lg border"
									/>
								</div>
							)}

							{/* Basic Info */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Item Name *
									</label>
									<Input
										value={metadata.name || ''}
										onChange={(e) => updateMetadata('name', e.target.value)}
										placeholder="e.g., Blue Cotton T-Shirt"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Brand
									</label>
									<Input
										value={metadata.brand || ''}
										onChange={(e) => updateMetadata('brand', e.target.value)}
										placeholder="e.g., Nike, H&M"
									/>
								</div>
							</div>

							{/* Category */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Category *
								</label>
								<div className="grid grid-cols-2 gap-2">
									{CATEGORIES.map((category) => (
										<button
											key={category.id}
											onClick={() => updateMetadata('category', category.id)}
											className={`p-3 text-left border rounded-lg transition-colors ${metadata.category === category.id
												? 'border-purple-500 bg-purple-50 text-purple-700'
												: 'border-gray-200 hover:border-gray-300'
												}`}
										>
											<div className="font-medium">{category.name}</div>
											<div className="text-xs text-gray-600">{category.description}</div>
										</button>
									))}
								</div>
							</div>

							{/* Colors */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Colors
								</label>
								<div className="grid grid-cols-8 gap-2 mb-2">
									{COLORS.map((color) => (
										<button
											key={color}
											onClick={() => toggleColor(color)}
											className={`w-8 h-8 rounded-full border-2 ${metadata.colors?.includes(color)
												? 'border-purple-500 ring-2 ring-purple-200'
												: 'border-gray-300'
												}`}
											style={{ backgroundColor: color }}
											title={color}
										/>
									))}
								</div>

								{/* Primary Color Selection */}
								{metadata.colors && metadata.colors.length > 1 && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Primary Color
										</label>
										<div className="flex gap-1">
											{metadata.colors.map((color) => (
												<button
													key={color}
													onClick={() => updateMetadata('primaryColor', color)}
													className={`px-3 py-1 text-xs rounded border ${metadata.primaryColor === color
														? 'border-purple-500 bg-purple-50 text-purple-700'
														: 'border-gray-200 hover:border-gray-300'
														}`}
												>
													{color}
												</button>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Description */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Description
								</label>
								<textarea
									value={metadata.description || ''}
									onChange={(e) => updateMetadata('description', e.target.value)}
									placeholder="Optional description..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
									rows={3}
								/>
							</div>

							{/* Tags */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Tags
								</label>
								<div className="flex gap-2 mb-2">
									<Input
										value={newTag}
										onChange={(e) => setNewTag(e.target.value)}
										placeholder="Add a tag..."
										onKeyPress={(e) => e.key === 'Enter' && addTag()}
									/>
									<Button type="button" onClick={addTag} variant="outline">
										Add
									</Button>
								</div>

								{metadata.tags && metadata.tags.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{metadata.tags.map((tag, index) => (
											<Badge
												key={index}
												variant="secondary"
												className="flex items-center gap-1"
											>
												{tag}
												<button onClick={() => removeTag(tag)}>
													<X className="h-3 w-3" />
												</button>
											</Badge>
										))}
									</div>
								)}
							</div>

							{error && (
								<div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
									<AlertCircle className="h-4 w-4" />
									{error}
								</div>
							)}

							<div className="flex gap-2 pt-4 border-t">
								<Button variant="outline" onClick={() => setStep(1)}>
									Back
								</Button>
								<Button
									onClick={handleUpload}
									disabled={!canProceed}
									className="flex-1"
								>
									Upload & Save
								</Button>
							</div>
						</div>
					)}

					{/* Step 3: Processing */}
					{step === 3 && (
						<div className="text-center py-8">
							{!success ? (
								<>
									<Loader2 className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-spin" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Uploading your garment...
									</h3>
									<p className="text-gray-600 mb-4">
										Processing image and extracting metadata with AI
									</p>
									<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
										<div
											className="bg-purple-600 h-2 rounded-full transition-all duration-300"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
									<p className="text-sm text-gray-500">{uploadProgress}% complete</p>
								</>
							) : (
								<>
									<Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Upload successful!
									</h3>
									<p className="text-gray-600">
										Your garment has been added to your wardrobe
									</p>
								</>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

export default GarmentUploadModal
