import { AlertCircle, Camera, Check, Upload, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'

interface SelfieUploadProps {
	onSelfieValidated: (file: File) => void
	isLoading?: boolean
}

interface ValidationResult {
	isValid: boolean
	message: string
	confidence?: number
}

const SelfieUpload: React.FC<SelfieUploadProps> = ({ onSelfieValidated, isLoading = false }) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [validation, setValidation] = useState<ValidationResult | null>(null)
	const [isValidating, setIsValidating] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const cameraInputRef = useRef<HTMLInputElement>(null)

	// Basic face detection using browser APIs (fallback validation)
	const validateImage = async (file: File): Promise<ValidationResult> => {
		return new Promise((resolve) => {
			const img = new Image()
			const canvas = document.createElement('canvas')
			const ctx = canvas.getContext('2d')

			img.onload = () => {
				canvas.width = img.width
				canvas.height = img.height
				ctx?.drawImage(img, 0, 0)

				// Basic validation checks
				const minWidth = 400
				const minHeight = 400
				const maxFileSize = 10 * 1024 * 1024 // 10MB

				if (file.size > maxFileSize) {
					resolve({
						isValid: false,
						message: 'Image file is too large. Please use an image smaller than 10MB.'
					})
					return
				}

				if (img.width < minWidth || img.height < minHeight) {
					resolve({
						isValid: false,
						message: 'Image resolution is too low. Please use an image at least 400x400 pixels.'
					})
					return
				}

				// Check aspect ratio (should be roughly square or portrait)
				const aspectRatio = img.width / img.height
				if (aspectRatio > 2 || aspectRatio < 0.5) {
					resolve({
						isValid: false,
						message: 'Image aspect ratio is not suitable. Please use a more square or portrait-oriented image.'
					})
					return
				}

				// Basic brightness check
				const imageData = ctx?.getImageData(0, 0, img.width, img.height)
				if (imageData) {
					let brightness = 0
					for (let i = 0; i < imageData.data.length; i += 4) {
						const r = imageData.data[i]
						const g = imageData.data[i + 1]
						const b = imageData.data[i + 2]
						brightness += (r + g + b) / 3
					}
					brightness = brightness / (imageData.data.length / 4)

					if (brightness < 50) {
						resolve({
							isValid: false,
							message: 'Image appears too dark. Please use a well-lit photo.'
						})
						return
					}

					if (brightness > 240) {
						resolve({
							isValid: false,
							message: 'Image appears overexposed. Please use a photo with better lighting.'
						})
						return
					}
				}

				// If all checks pass
				resolve({
					isValid: true,
					message: 'Image looks good! Ready for avatar generation.',
					confidence: 0.8
				})
			}

			img.onerror = () => {
				resolve({
					isValid: false,
					message: 'Unable to process image. Please try a different file.'
				})
			}

			img.src = URL.createObjectURL(file)
		})
	}

	const handleFileSelect = async (file: File) => {
		if (!file) return

		// Check file type
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file')
			return
		}

		setSelectedFile(file)
		setPreviewUrl(URL.createObjectURL(file))
		setValidation(null)
		setIsValidating(true)

		try {
			const result = await validateImage(file)
			setValidation(result)

			if (result.isValid) {
				toast.success(result.message)
			} else {
				toast.error(result.message)
			}
		} catch (error) {
			console.error('Validation error:', error)
			setValidation({
				isValid: false,
				message: 'Error validating image. Please try again.'
			})
			toast.error('Error validating image')
		} finally {
			setIsValidating(false)
		}
	}

	const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			handleFileSelect(file)
		}
	}

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		const file = event.dataTransfer.files?.[0]
		if (file) {
			handleFileSelect(file)
		}
	}

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
	}

	const clearSelection = () => {
		setSelectedFile(null)
		setPreviewUrl(null)
		setValidation(null)
		if (fileInputRef.current) fileInputRef.current.value = ''
		if (cameraInputRef.current) cameraInputRef.current.value = ''
	}

	const handleProceed = () => {
		if (selectedFile && validation?.isValid) {
			onSelfieValidated(selectedFile)
		}
	}

	return (
		<Card className="w-full max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Camera className="w-5 h-5" />
					Create Your Avatar
				</CardTitle>
				<CardDescription>
					Upload a clear selfie to generate your personalized 3D avatar
				</CardDescription>
			</CardHeader>
			<CardContent>
				{!selectedFile ? (
					<div
						className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
						onDrop={handleDrop}
						onDragOver={handleDragOver}
					>
						<div className="space-y-4">
							<div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
								<Upload className="w-8 h-8 text-gray-400" />
							</div>
							<div>
								<h3 className="text-lg font-medium">Upload your selfie</h3>
								<p className="text-gray-500 mt-1">
									Drag and drop or click to select a photo
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button
									onClick={() => fileInputRef.current?.click()}
									variant="outline"
									className="flex items-center gap-2"
								>
									<Upload className="w-4 h-4" />
									Choose from Gallery
								</Button>
								<Button
									onClick={() => cameraInputRef.current?.click()}
									className="flex items-center gap-2"
								>
									<Camera className="w-4 h-4" />
									Take Photo
								</Button>
							</div>
							<div className="text-xs text-gray-400 max-w-sm mx-auto">
								<p>For best results:</p>
								<ul className="list-disc list-inside mt-1 space-y-1">
									<li>Face clearly visible and well-lit</li>
									<li>Look directly at the camera</li>
									<li>Avoid sunglasses or face coverings</li>
									<li>Use good lighting (avoid shadows)</li>
								</ul>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						{/* Image Preview */}
						<div className="relative">
							<img
								src={previewUrl || ''}
								alt="Selected selfie"
								className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
							/>
							<button
								onClick={clearSelection}
								className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Validation Status */}
						{isValidating ? (
							<div className="flex items-center justify-center gap-2 text-blue-600">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
								<span>Validating image...</span>
							</div>
						) : validation ? (
							<div className={`flex items-center gap-2 p-3 rounded-md ${validation.isValid
									? 'bg-green-50 border border-green-200 text-green-700'
									: 'bg-red-50 border border-red-200 text-red-700'
								}`}>
								{validation.isValid ? (
									<Check className="w-5 h-5" />
								) : (
									<AlertCircle className="w-5 h-5" />
								)}
								<span className="text-sm">{validation.message}</span>
							</div>
						) : null}

						{/* Action Buttons */}
						<div className="flex gap-3 justify-center">
							<Button
								onClick={clearSelection}
								variant="outline"
							>
								Choose Different Photo
							</Button>
							<Button
								onClick={handleProceed}
								disabled={!validation?.isValid || isLoading}
								className="flex items-center gap-2"
							>
								{isLoading ? (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								) : (
									<Check className="w-4 h-4" />
								)}
								{isLoading ? 'Generating Avatar...' : 'Create Avatar'}
							</Button>
						</div>
					</div>
				)}

				{/* Hidden file inputs */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileInput}
					className="hidden"
				/>
				<input
					ref={cameraInputRef}
					type="file"
					accept="image/*"
					capture="user"
					onChange={handleFileInput}
					className="hidden"
				/>
			</CardContent>
		</Card>
	)
}

export default SelfieUpload
