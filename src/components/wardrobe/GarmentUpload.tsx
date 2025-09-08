import { Camera, Eye, Package2, Palette, Shirt, Tag, TrendingUp, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

interface GarmentUploadProps {
	existingGarment?: any
	onComplete: () => void
	onCancel: () => void
}

interface GarmentMetadata {
	name: string
	description: string
	brand: string
	size: string
	price: string
	purchase_date: string
	tags: string[]
}

const GarmentUpload = ({ existingGarment: _existingGarment, onComplete, onCancel }: GarmentUploadProps) => {
	const [loading, setLoading] = useState(false)
	const [photo, setPhoto] = useState<File | null>(null)
	const [photoPreview, setPhotoPreview] = useState<string | null>(null)
	const [metadata, setMetadata] = useState<GarmentMetadata>({
		name: '',
		description: '',
		brand: '',
		size: '',
		price: '',
		purchase_date: '',
		tags: []
	})
	const [error, setError] = useState('')
	const [success, setSuccess] = useState(false)
	const [newTag, setNewTag] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			// Validate file size (10MB limit)
			if (file.size > 10 * 1024 * 1024) {
				setError('File size must be less than 10MB')
				return
			}

			// Validate file type
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
			if (!allowedTypes.includes(file.type)) {
				setError('Please upload a JPEG, PNG, or WebP image')
				return
			}

			setPhoto(file)
			setError('')

			// Create preview
			const reader = new FileReader()
			reader.onload = (e) => {
				if (e.target?.result && typeof e.target.result === 'string') {
					setPhotoPreview(e.target.result)
				}
			}
			reader.readAsDataURL(file)
		}
	}

	const handleMetadataChange = (field: keyof GarmentMetadata, value: string) => {
		setMetadata(prev => ({
			...prev,
			[field]: value
		}))
	}

	const addTag = () => {
		if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
			setMetadata(prev => ({
				...prev,
				tags: [...prev.tags, newTag.trim()]
			}))
			setNewTag('')
		}
	}

	const removeTag = (tagToRemove: string) => {
		setMetadata(prev => ({
			...prev,
			tags: prev.tags.filter(tag => tag !== tagToRemove)
		}))
	}

	const handleUpload = async () => {
		if (!photo) {
			setError('Please select a garment photo first')
			return
		}

		setLoading(true)
		setError('')

		try {
			const formData = new FormData()
			formData.append('garment_image', photo)
			formData.append('name', metadata.name)
			formData.append('description', metadata.description)
			formData.append('brand', metadata.brand)
			formData.append('size', metadata.size)
			formData.append('price', metadata.price)
			formData.append('purchase_date', metadata.purchase_date)
			formData.append('tags', JSON.stringify(metadata.tags))

			const response = await fetch('/api/garments/upload', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: formData
			})

			const data = await response.json()

			if (data.success) {
				setSuccess(true)
				setTimeout(() => {
					onComplete()
				}, 2000)
			} else {
				setError(data.message || 'Garment upload failed')
			}
		} catch (err) {
			setError('Network error. Please try again.')
			console.error('Garment upload error:', err)
		} finally {
			setLoading(false)
		}
	}

	if (success) {
		return (
			<div className="text-center p-8">
				<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Shirt className="w-8 h-8 text-green-600" />
				</div>
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					Garment Added Successfully!
				</h3>
				<p className="text-gray-600">
					Your garment has been analyzed and added to your wardrobe.
				</p>
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			{/* Header */}
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Add Garment to Wardrobe
				</h2>
				<p className="text-gray-600">
					Upload a photo and add details for AI-powered analysis
				</p>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
					<div className="flex items-center">
						<span className="text-red-500 mr-2">⚠️</span>
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			<div className="space-y-6">
				{/* Photo Upload Section */}
				<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
					<div className="text-center">
						{photoPreview ? (
							<div className="space-y-4">
								<img
									src={photoPreview}
									alt="Garment preview"
									className="w-48 h-48 object-cover rounded-lg mx-auto"
								/>
								<button
									onClick={() => fileInputRef.current?.click()}
									className="text-blue-600 hover:text-blue-700 font-medium"
								>
									Change Photo
								</button>
							</div>
						) : (
							<div
								className="cursor-pointer"
								onClick={() => fileInputRef.current?.click()}
							>
								<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-lg font-medium text-gray-900 mb-2">Upload Garment Photo</p>
								<p className="text-sm text-gray-500">
									JPEG, PNG, or WebP • Max 10MB
								</p>
							</div>
						)}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handlePhotoUpload}
							className="hidden"
						/>
					</div>
				</div>

				{/* Garment Details */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<Shirt className="w-4 h-4 inline mr-1" />
							Garment Name
						</label>
						<input
							type="text"
							value={metadata.name}
							onChange={(e) => handleMetadataChange('name', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., Blue Denim Jeans"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							<Package2 className="w-4 h-4 inline mr-1" />
							Brand
						</label>
						<input
							type="text"
							value={metadata.brand}
							onChange={(e) => handleMetadataChange('brand', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., Levi's"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Size
						</label>
						<input
							type="text"
							value={metadata.size}
							onChange={(e) => handleMetadataChange('size', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., M, L, 32"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Price
						</label>
						<input
							type="number"
							value={metadata.price}
							onChange={(e) => handleMetadataChange('price', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="0.00"
							min="0"
							step="0.01"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Purchase Date
						</label>
						<input
							type="date"
							value={metadata.purchase_date}
							onChange={(e) => handleMetadataChange('purchase_date', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
				</div>

				{/* Description */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Description
					</label>
					<textarea
						value={metadata.description}
						onChange={(e) => handleMetadataChange('description', e.target.value)}
						rows={3}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Additional details about this garment..."
					/>
				</div>

				{/* Tags */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						<Tag className="w-4 h-4 inline mr-1" />
						Tags
					</label>
					<div className="flex flex-wrap gap-2 mb-2">
						{metadata.tags.map((tag, index) => (
							<span
								key={index}
								className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
							>
								{tag}
								<button
									onClick={() => removeTag(tag)}
									className="ml-2 text-blue-600 hover:text-blue-800"
								>
									×
								</button>
							</span>
						))}
					</div>
					<div className="flex space-x-2">
						<input
							type="text"
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && addTag()}
							className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Add a tag..."
						/>
						<button
							onClick={addTag}
							className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
						>
							Add
						</button>
					</div>
				</div>

				{/* AI Analysis Preview */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<h4 className="font-medium text-blue-900 mb-2 flex items-center">
						<Camera className="w-4 h-4 mr-2" />
						AI Analysis Features
					</h4>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
						<div className="flex items-center">
							<Palette className="w-4 h-4 mr-1" />
							Color Detection
						</div>
						<div className="flex items-center">
							<Tag className="w-4 h-4 mr-1" />
							Auto Categorization
						</div>
						<div className="flex items-center">
							<Eye className="w-4 h-4 mr-1" />
							Style Analysis
						</div>
						<div className="flex items-center">
							<TrendingUp className="w-4 h-4 mr-1" />
							Outfit Suggestions
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-between pt-4">
					<button
						onClick={onCancel}
						className="px-6 py-2 text-gray-600 hover:text-gray-800"
					>
						Cancel
					</button>
					<button
						onClick={handleUpload}
						disabled={loading || !photo}
						className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 ${loading || !photo
							? 'bg-gray-300 text-gray-500 cursor-not-allowed'
							: 'bg-blue-600 text-white hover:bg-blue-700'
							}`}
					>
						{loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
						<span>{loading ? 'Analyzing...' : 'Add to Wardrobe'}</span>
					</button>
				</div>
			</div>
		</div>
	)
}

export default GarmentUpload
