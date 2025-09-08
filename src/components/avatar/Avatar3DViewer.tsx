import { Camera, Download, Loader2, RotateCcw, Settings, Share2, ZoomIn, ZoomOut } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { avatarService } from '../../services/avatar'
import { buildCapturedAvatarImage } from '../../services/avatarCapture'
import { clothingRenderingEngine, type RenderingOptions, type RenderResult } from '../../services/clothingRenderer'
import { shareCapturedAvatar } from '../../services/shareAvatar'
import { type OutfitCombination } from '../../services/virtualTryOn'

export interface Avatar3DViewerProps {
	outfit: OutfitCombination | null
	onRenderComplete?: (result: RenderResult) => void
	onError?: (error: string) => void
	onCapture?: (data: { blob: Blob; url: string; fileName: string }) => void
	className?: string
	renderOptions?: Partial<RenderingOptions>
}

export const Avatar3DViewer: React.FC<Avatar3DViewerProps> = ({
	outfit,
	onRenderComplete,
	onError,
	onCapture,
	className = '',
	renderOptions = {}
}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [renderResult, setRenderResult] = useState<RenderResult | null>(null)
	const [showSettings, setShowSettings] = useState(false)
	const [capturing, setCapturing] = useState(false)
	const [zoom, setZoom] = useState(1)
	const [rotation, setRotation] = useState(0)
	const [captured, setCaptured] = useState<{ blob: Blob; url: string; fileName: string } | null>(null)
	const [sharing, setSharing] = useState(false)
	const [showShareFallback, setShowShareFallback] = useState(false)

	// Default rendering options
	const defaultOptions: RenderingOptions = {
		quality: 'medium',
		enableShadows: true,
		enablePostProcessing: false,
		outputFormat: 'webp',
		resolution: { width: 512, height: 512 },
		...renderOptions
	}

	useEffect(() => {
		if (outfit) {
			renderOutfit()
		}
	}, [outfit, defaultOptions])

	const renderOutfit = async () => {
		if (!outfit) return

		setIsLoading(true)
		setError(null)

		try {
			// Get user's avatar
			const avatars = await avatarService.getUserAvatars()
			if (avatars.length === 0) {
				throw new Error('No avatar found. Please create an avatar first.')
			}

			const avatar = avatars[0]
			if (!avatar.avatarUrl) {
				throw new Error('Avatar model not available.')
			}

			// Load avatar mesh
			const avatarMesh = await clothingRenderingEngine.loadAvatar(avatar.avatarUrl)

			// Apply clothing to avatar
			const renderData = await clothingRenderingEngine.applyClothingToAvatar(avatarMesh, outfit)

			// Render the scene
			const result = await clothingRenderingEngine.renderScene(renderData, defaultOptions)

			if (result.success) {
				setRenderResult(result)
				if (onRenderComplete) {
					onRenderComplete(result)
				}
			} else {
				throw new Error(result.error || 'Rendering failed')
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
			setError(errorMessage)
			if (onError) {
				onError(errorMessage)
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleZoomIn = () => {
		setZoom(prev => Math.min(prev + 0.1, 3))
	}

	const handleZoomOut = () => {
		setZoom(prev => Math.max(prev - 0.1, 0.5))
	}

	const handleRotate = () => {
		setRotation(prev => (prev + 90) % 360)
	}

	const handleRetry = () => {
		renderOutfit()
	}

	const captureImage = async () => {
		if (!containerRef.current) return
		if (!renderResult?.imageUrl) return
		setCapturing(true)
		try {
			// Fetch existing rendered image (already composed) and wrap as blob; could extend to canvas snapshot if WebGL present.
			const response = await fetch(renderResult.imageUrl)
			const blob = await response.blob()
			const fileName = `avatar-look-${Date.now()}.png`
			const url = URL.createObjectURL(blob)
			onCapture?.({ blob, url, fileName })
			setCaptured({ blob, url, fileName })
			// build captured wrapper for external consumer
			buildCapturedAvatarImage({ blob, url, fileName })
		} catch (e) {
			console.error('Capture failed', e)
			onError?.('Failed to capture image')
		} finally {
			setCapturing(false)
		}
	}

	const handleShare = async () => {
		if (!captured) return
		setSharing(true)
		const wrapped = buildCapturedAvatarImage(captured)
		const result = await shareCapturedAvatar(wrapped, { title: 'Wardrobe Look', text: 'Check out this AI-styled outfit!' })
		if (result.method === 'fallback') {
			setShowShareFallback(true)
		}
		setSharing(false)
	}

	return (
		<div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} ref={containerRef}>
			{/* 3D Viewer Container */}
			<div className="relative w-full h-64 md:h-96 flex items-center justify-center">
				{isLoading && (
					<div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
						<div className="text-center">
							<Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
							<p className="text-sm text-gray-600">Rendering 3D view...</p>
						</div>
					</div>
				)}

				{error && (
					<div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
						<div className="text-center p-4">
							<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
							</div>
							<h3 className="text-sm font-medium text-gray-900 mb-1">Rendering Error</h3>
							<p className="text-xs text-gray-600 mb-3">{error}</p>
							<button
								onClick={handleRetry}
								className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
							>
								Try Again
							</button>
						</div>
					</div>
				)}

				{renderResult && renderResult.success && (
					<div
						className="w-full h-full flex items-center justify-center"
						style={{
							transform: `scale(${zoom}) rotate(${rotation}deg)`,
							transition: 'transform 0.3s ease'
						}}
					>
						<img
							src={renderResult.imageUrl}
							alt="3D Avatar with Outfit"
							className="max-w-full max-h-full object-contain"
							style={{ imageRendering: 'auto' }}
						/>
					</div>
				)}

				{!outfit && !isLoading && !error && (
					<div className="text-center text-gray-500">
						<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
							<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<p className="text-sm">Select an outfit to see 3D preview</p>
					</div>
				)}
			</div>

			{/* Controls */}
			{renderResult && renderResult.success && (
				<div className="absolute top-2 right-2 flex flex-col gap-1">
					<button
						onClick={handleZoomIn}
						className="p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
						title="Zoom In"
					>
						<ZoomIn size={16} />
					</button>
					<button
						onClick={handleZoomOut}
						className="p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
						title="Zoom Out"
					>
						<ZoomOut size={16} />
					</button>
					<button
						onClick={handleRotate}
						className="p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
						title="Rotate"
					>
						<RotateCcw size={16} />
					</button>
					<button
						onClick={() => setShowSettings(!showSettings)}
						className="p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
						title="Settings"
					>
						<Settings size={16} />
					</button>
					<button
						onClick={captureImage}
						className="p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all disabled:opacity-50"
						title={capturing ? 'Capturing...' : 'Capture Image'}
						disabled={capturing}
					>
						{capturing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
					</button>
					<button
						onClick={handleShare}
						className="p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-all disabled:opacity-50"
						title={sharing ? 'Sharing...' : 'Share'}
						disabled={!captured || sharing}
					>
						{sharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
					</button>
				</div>
			)}

			{/* Render Info */}
			{renderResult && renderResult.success && (
				<div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
					<div>Render time: {Math.round(renderResult.renderTime)}ms</div>
					<div>Meshes: {renderResult.meshCount} | Triangles: {renderResult.triangleCount.toLocaleString()}</div>
				</div>
			)}

			{/* Settings Panel */}
			{showSettings && (
				<div className="absolute top-12 right-2 bg-white rounded-lg shadow-lg p-4 min-w-48 z-20">
					<h3 className="font-medium mb-3">Render Settings</h3>

					<div className="space-y-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
							<select
								className="w-full text-xs border border-gray-300 rounded px-2 py-1"
								defaultValue={defaultOptions.quality}
							>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
							</select>
						</div>

						<div className="flex items-center">
							<input
								type="checkbox"
								id="shadows"
								className="mr-2"
								defaultChecked={defaultOptions.enableShadows}
							/>
							<label htmlFor="shadows" className="text-xs text-gray-700">Enable Shadows</label>
						</div>

						<div className="flex items-center">
							<input
								type="checkbox"
								id="postprocessing"
								className="mr-2"
								defaultChecked={defaultOptions.enablePostProcessing}
							/>
							<label htmlFor="postprocessing" className="text-xs text-gray-700">Post Processing</label>
						</div>

						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">Output Format</label>
							<select
								className="w-full text-xs border border-gray-300 rounded px-2 py-1"
								defaultValue={defaultOptions.outputFormat}
							>
								<option value="webp">WebP</option>
								<option value="png">PNG</option>
								<option value="jpg">JPEG</option>
							</select>
						</div>

						<button
							onClick={() => {
								setShowSettings(false)
								renderOutfit()
							}}
							className="w-full bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700"
						>
							Apply & Re-render
						</button>
					</div>
				</div>
			)}

			{/* Share Fallback Modal */}
			{showShareFallback && captured && (
				<div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
					<div className="bg-white rounded-lg p-5 w-full max-w-sm shadow-lg">
						<h3 className="text-sm font-semibold mb-2">Share This Look</h3>
						<p className="text-xs text-gray-600 mb-3">Your browser doesn't support native sharing. Download or copy the image URL below.</p>
						<div className="flex items-center gap-2 mb-3">
							<button
								className="flex-1 px-3 py-2 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
								onClick={() => {
									const a = document.createElement('a')
									a.href = captured.url
									a.download = captured.fileName
									a.click()
								}}
							>
								Download <Download size={12} className="inline ml-1" />
							</button>
							<button
								className="px-3 py-2 text-xs rounded bg-gray-200 hover:bg-gray-300"
								onClick={async () => {
									await navigator.clipboard.writeText(captured.url)
								}}
							>
								Copy URL
							</button>
						</div>
						<button
							className="w-full text-xs px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
							onClick={() => setShowShareFallback(false)}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
