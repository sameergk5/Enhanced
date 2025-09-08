import { Camera, Check, Loader2, Settings, Upload, User, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface AvatarCreationProps {
	onAvatarCreated: (avatar: any) => void
	onCancel: () => void
}

interface Measurements {
	height: string
	weight: string
	chest: string
	waist: string
	hips: string
	shoulder_width: string
}

interface Preferences {
	build: string
	skin_tone: string
	hair_color: string
	eye_color: string
}

const AvatarCreation = ({ onAvatarCreated, onCancel }: AvatarCreationProps) => {
	const [step, setStep] = useState(1)
	const [loading, setLoading] = useState(false)
	const [photo, setPhoto] = useState<File | null>(null)
	const [photoPreview, setPhotoPreview] = useState<string | null>(null)
	const [measurements, setMeasurements] = useState<Measurements>({
		height: '',
		weight: '',
		chest: '',
		waist: '',
		hips: '',
		shoulder_width: ''
	})
	const [preferences, setPreferences] = useState<Preferences>({
		build: 'medium',
		skin_tone: 'medium',
		hair_color: 'brown',
		eye_color: 'brown'
	})
	const [error, setError] = useState('')
	const [success, setSuccess] = useState(false)
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

	const handleMeasurementChange = (field: keyof Measurements, value: string) => {
		setMeasurements(prev => ({
			...prev,
			[field]: value
		}))
	}

	const handlePreferenceChange = (field: keyof Preferences, value: string) => {
		setPreferences(prev => ({
			...prev,
			[field]: value
		}))
	}

	const handleCreateAvatar = async () => {
		if (!photo) {
			setError('Please upload a photo first')
			return
		}

		setLoading(true)
		setError('')

		try {
			const formData = new FormData()
			formData.append('photo', photo)

			// Add measurements if provided
			const validMeasurements = Object.fromEntries(
				Object.entries(measurements).filter(([, value]) => value !== '')
			)
			if (Object.keys(validMeasurements).length > 0) {
				formData.append('measurements', JSON.stringify(validMeasurements))
			}

			// Add preferences
			formData.append('preferences', JSON.stringify(preferences))

			const response = await fetch('/api/avatars/from-photo', {
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
					onAvatarCreated(data.avatar)
				}, 2000)
			} else {
				setError(data.message || 'Avatar creation failed')
			}
		} catch (err) {
			setError('Network error. Please try again.')
			console.error('Avatar creation error:', err)
		} finally {
			setLoading(false)
		}
	}

	if (success) {
		return (
			<div className="text-center p-8">
				<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Check className="w-8 h-8 text-green-600" />
				</div>
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					Avatar Created Successfully!
				</h3>
				<p className="text-gray-600">
					Your 3D avatar has been generated and is ready to use.
				</p>
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			{/* Header */}
			<div className="mb-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Create Your 3D Avatar
				</h2>
				<p className="text-gray-600">
					Upload a photo and customize your avatar settings
				</p>
			</div>

			{/* Progress Steps */}
			<div className="flex items-center justify-center mb-8">
				<div className="flex items-center space-x-4">
					<div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
						}`}>
						<Camera className="w-5 h-5" />
					</div>
					<div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
					<div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
						}`}>
						<User className="w-5 h-5" />
					</div>
					<div className={`h-1 w-16 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
					<div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
						}`}>
						<Settings className="w-5 h-5" />
					</div>
				</div>
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
					<div className="flex items-center">
						<X className="w-5 h-5 text-red-500 mr-2" />
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			{/* Step 1: Photo Upload */}
			{step === 1 && (
				<div className="space-y-6">
					<div className="text-center">
						<div
							className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer"
							onClick={() => fileInputRef.current?.click()}
						>
							{photoPreview ? (
								<div className="space-y-4">
									<img
										src={photoPreview}
										alt="Photo preview"
										className="w-32 h-32 object-cover rounded-lg mx-auto"
									/>
									<p className="text-sm text-gray-500">Click to change photo</p>
								</div>
							) : (
								<div className="space-y-4">
									<Upload className="w-12 h-12 text-gray-400 mx-auto" />
									<div>
										<p className="text-lg font-medium text-gray-900">Upload Your Photo</p>
										<p className="text-sm text-gray-500">
											JPEG, PNG, or WebP • Max 10MB
										</p>
									</div>
								</div>
							)}
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							onChange={handlePhotoUpload}
							className="hidden"
						/>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 className="font-medium text-blue-900 mb-2">Photo Tips:</h4>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• Use a clear, well-lit photo</li>
							<li>• Face the camera directly</li>
							<li>• Avoid sunglasses or face coverings</li>
							<li>• Higher resolution photos work better</li>
						</ul>
					</div>

					<div className="flex justify-between">
						<button
							onClick={onCancel}
							className="px-4 py-2 text-gray-600 hover:text-gray-800"
						>
							Cancel
						</button>
						<button
							onClick={() => setStep(2)}
							disabled={!photo}
							className={`px-6 py-2 rounded-lg font-medium ${photo
									? 'bg-blue-600 text-white hover:bg-blue-700'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}`}
						>
							Next: Measurements
						</button>
					</div>
				</div>
			)}

			{/* Step 2: Measurements */}
			{step === 2 && (
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Body Measurements (Optional)
						</h3>
						<p className="text-sm text-gray-600 mb-6">
							Provide measurements for a more accurate avatar. All fields are optional.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Height (cm)
							</label>
							<input
								type="number"
								value={measurements.height}
								onChange={(e) => handleMeasurementChange('height', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="170"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Weight (kg)
							</label>
							<input
								type="number"
								value={measurements.weight}
								onChange={(e) => handleMeasurementChange('weight', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="70"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Chest (cm)
							</label>
							<input
								type="number"
								value={measurements.chest}
								onChange={(e) => handleMeasurementChange('chest', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="90"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Waist (cm)
							</label>
							<input
								type="number"
								value={measurements.waist}
								onChange={(e) => handleMeasurementChange('waist', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="75"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Hips (cm)
							</label>
							<input
								type="number"
								value={measurements.hips}
								onChange={(e) => handleMeasurementChange('hips', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="95"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Shoulder Width (cm)
							</label>
							<input
								type="number"
								value={measurements.shoulder_width}
								onChange={(e) => handleMeasurementChange('shoulder_width', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="40"
							/>
						</div>
					</div>

					<div className="flex justify-between">
						<button
							onClick={() => setStep(1)}
							className="px-4 py-2 text-gray-600 hover:text-gray-800"
						>
							Back
						</button>
						<button
							onClick={() => setStep(3)}
							className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
						>
							Next: Preferences
						</button>
					</div>
				</div>
			)}

			{/* Step 3: Preferences */}
			{step === 3 && (
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Avatar Preferences
						</h3>
						<p className="text-sm text-gray-600 mb-6">
							Customize your avatar's appearance
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Build
							</label>
							<select
								value={preferences.build}
								onChange={(e) => handlePreferenceChange('build', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="slim">Slim</option>
								<option value="medium">Medium</option>
								<option value="athletic">Athletic</option>
								<option value="curvy">Curvy</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Skin Tone
							</label>
							<select
								value={preferences.skin_tone}
								onChange={(e) => handlePreferenceChange('skin_tone', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="light">Light</option>
								<option value="medium">Medium</option>
								<option value="medium_dark">Medium Dark</option>
								<option value="dark">Dark</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Hair Color
							</label>
							<select
								value={preferences.hair_color}
								onChange={(e) => handlePreferenceChange('hair_color', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="black">Black</option>
								<option value="brown">Brown</option>
								<option value="blonde">Blonde</option>
								<option value="red">Red</option>
								<option value="gray">Gray</option>
								<option value="white">White</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Eye Color
							</label>
							<select
								value={preferences.eye_color}
								onChange={(e) => handlePreferenceChange('eye_color', e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="brown">Brown</option>
								<option value="blue">Blue</option>
								<option value="green">Green</option>
								<option value="hazel">Hazel</option>
								<option value="gray">Gray</option>
							</select>
						</div>
					</div>

					<div className="flex justify-between">
						<button
							onClick={() => setStep(2)}
							className="px-4 py-2 text-gray-600 hover:text-gray-800"
						>
							Back
						</button>
						<button
							onClick={handleCreateAvatar}
							disabled={loading}
							className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 ${loading
									? 'bg-gray-400 text-white cursor-not-allowed'
									: 'bg-blue-600 text-white hover:bg-blue-700'
								}`}
						>
							{loading && <Loader2 className="w-4 h-4 animate-spin" />}
							<span>{loading ? 'Creating Avatar...' : 'Create Avatar'}</span>
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default AvatarCreation
