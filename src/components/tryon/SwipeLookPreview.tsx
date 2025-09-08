// Swipe-Style Look Preview UI - Main Try-On Interface
import {
	CameraIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	HeartIcon,
	InfoIcon,
	RefreshCcwIcon,
	SaveIcon,
	SettingsIcon,
	ShareIcon
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useOutfitManager, useOutfitNavigation } from '../../hooks/useOutfitManager'
import { usePermissions } from '../../hooks/usePermissions'
import { captureElementAsImage } from '../../utils/avatarCapture'
import { shareLook } from '../../utils/share'
import { Avatar3DViewer } from '../avatar/Avatar3DViewer'

export interface SwipeLookPreviewProps {
	onOutfitSave?: (outfit: any) => void
	onOutfitShare?: (outfit: any) => void
	onSettingsOpen?: () => void
	className?: string
}

interface SwipeState {
	isDragging: boolean
	startX: number
	currentX: number
	deltaX: number
}

const SwipeLookPreview: React.FC<SwipeLookPreviewProps> = ({
	onOutfitSave,
	onOutfitShare,
	onSettingsOpen,
	className = ''
}) => {
	// State management
	const outfit = useOutfitManager()
	const navigation = useOutfitNavigation()

	// UI state
	const [swipeState, setSwipeState] = useState<SwipeState>({
		isDragging: false,
		startX: 0,
		currentX: 0,
		deltaX: 0
	})
	const [showDetails, setShowDetails] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [favoriteAnimations, setFavoriteAnimations] = useState<Record<string, boolean>>({})

	// Permissions
	const { permissions } = usePermissions()

	// Refs
	const containerRef = useRef<HTMLDivElement>(null)
	const touchStartTime = useRef<number>(0)

	// Capture state
	const [isCapturing, setIsCapturing] = useState(false)

	// Constants
	const SWIPE_THRESHOLD = 50
	const TRANSITION_DURATION = 300

	/**
	 * Handle touch/mouse start
	 */
	const handleStart = useCallback((clientX: number) => {
		if (navigation.total <= 1) return

		setSwipeState(prev => ({
			...prev,
			isDragging: true,
			startX: clientX,
			currentX: clientX,
			deltaX: 0
		}))
		touchStartTime.current = Date.now()
	}, [navigation.total])

	/**
	 * Handle touch/mouse move
	 */
	const handleMove = useCallback((clientX: number) => {
		if (!swipeState.isDragging) return

		const deltaX = clientX - swipeState.startX
		setSwipeState(prev => ({
			...prev,
			currentX: clientX,
			deltaX
		}))
	}, [swipeState.isDragging, swipeState.startX])

	/**
	 * Handle touch/mouse end
	 */
	const handleEnd = useCallback(() => {
		if (!swipeState.isDragging) return

		const { deltaX } = swipeState
		const swipeDuration = Date.now() - touchStartTime.current
		const isQuickSwipe = swipeDuration < 300

		// Determine if swipe was significant enough
		const shouldSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || (isQuickSwipe && Math.abs(deltaX) > 30)

		if (shouldSwipe) {
			setIsTransitioning(true)

			if (deltaX > 0 && navigation.hasPrevious) {
				// Swipe right - go to previous
				navigation.previous()
			} else if (deltaX < 0 && navigation.hasNext) {
				// Swipe left - go to next
				navigation.next()
			}

			// Reset transition after animation
			setTimeout(() => {
				setIsTransitioning(false)
			}, TRANSITION_DURATION)
		}

		// Reset swipe state
		setSwipeState({
			isDragging: false,
			startX: 0,
			currentX: 0,
			deltaX: 0
		})
	}, [swipeState, navigation])

	/**
	 * Mouse event handlers
	 */
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		handleStart(e.clientX)
	}

	/**
	 * Touch event handlers
	 */
	const handleTouchStart = (e: React.TouchEvent) => {
		handleStart(e.touches[0].clientX)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		handleMove(e.touches[0].clientX)
	}

	const handleTouchEnd = () => {
		handleEnd()
	}

	/**
	 * Keyboard navigation
	 */
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if (navigation.total <= 1) return

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault()
				if (navigation.hasPrevious) navigation.previous()
				break
			case 'ArrowRight':
				e.preventDefault()
				if (navigation.hasNext) navigation.next()
				break
			case ' ':
				e.preventDefault()
				setShowDetails(!showDetails)
				break
		}
	}, [navigation, showDetails])

	// Add keyboard listeners
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [handleKeyDown])

	// Add global mouse listeners when dragging
	useEffect(() => {
		if (swipeState.isDragging) {
			const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e.clientX)
			const handleGlobalMouseUp = () => handleEnd()

			window.addEventListener('mousemove', handleGlobalMouseMove)
			window.addEventListener('mouseup', handleGlobalMouseUp)

			return () => {
				window.removeEventListener('mousemove', handleGlobalMouseMove)
				window.removeEventListener('mouseup', handleGlobalMouseUp)
			}
		}
	}, [swipeState.isDragging, handleMove, handleEnd])

	/**
	 * Handle favorite toggle with animation
	 */
	const handleFavoriteToggle = useCallback(async () => {
		if (!navigation.current) return

		const outfitId = navigation.current.id
		setFavoriteAnimations(prev => ({ ...prev, [outfitId]: true }))

		try {
			// Here you would implement favorite toggle logic
			// For now, we'll simulate it
			await new Promise(resolve => setTimeout(resolve, 300))

			// Remove animation after completion
			setTimeout(() => {
				setFavoriteAnimations(prev => ({ ...prev, [outfitId]: false }))
			}, 600)
		} catch (error) {
			console.error('Failed to toggle favorite:', error)
			setFavoriteAnimations(prev => ({ ...prev, [outfitId]: false }))
		}
	}, [navigation.current])

	/**
	 * Calculate transform for swipe animation
	 */
	const getSwipeTransform = () => {
		if (!swipeState.isDragging) return 'translateX(0)'

		// Limit the swipe distance for better UX
		const maxSwipe = 100
		const limitedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, swipeState.deltaX))
		return `translateX(${limitedDelta}px)`
	}

	/**
	 * Get swipe resistance for edge cases
	 */
	/** Capture current avatar area and optionally share */
	const handleCapture = useCallback(async (shareAfter = false) => {
		if (!containerRef.current) return
		try {
			setIsCapturing(true)
			const blob = await captureElementAsImage(containerRef.current, { mimeType: 'image/png' })
			if (shareAfter && permissions?.allowOutfitSharing) {
				try {
					await shareLook({ file: blob, fileName: 'wardrobe-look.png' })
				} catch (err) {
					// Fallback to download if share fails
					const link = document.createElement('a')
					link.href = URL.createObjectURL(blob)
					link.download = 'wardrobe-look.png'
					document.body.appendChild(link)
					link.click()
					document.body.removeChild(link)
				}
			} else {
				const link = document.createElement('a')
				link.href = URL.createObjectURL(blob)
				link.download = 'wardrobe-look.png'
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
			}
		} catch (err) {
			console.error('Capture failed', err)
		} finally {
			setIsCapturing(false)
		}
	}, [permissions])

	const getSwipeOpacity = () => {
		if (!swipeState.isDragging) return 1

		const { deltaX } = swipeState
		const maxDelta = 150
		const resistance = 1 - Math.min(Math.abs(deltaX) / maxDelta, 0.3)

		// Add resistance at edges
		if (deltaX > 0 && !navigation.hasPrevious) return resistance
		if (deltaX < 0 && !navigation.hasNext) return resistance

		return 1
	}

	// If no outfit combinations are available
	if (navigation.total === 0) {
		return (
			<div className={`swipe-look-preview ${className}`}>
				<div className="h-full flex items-center justify-center bg-gray-50">
					<div className="text-center p-8">
						<div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
							<InfoIcon className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">No Outfits to Preview</h3>
						<p className="text-gray-600 text-sm mb-4">
							Select some garments and generate outfit combinations to start previewing looks.
						</p>
						<button
							onClick={outfit.generateCombinations}
							disabled={!outfit.canGenerate}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{outfit.canGenerate ? 'Generate Outfits' : 'Select Items First'}
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={`swipe-look-preview h-full ${className}`}>
			<div className="h-full flex flex-col bg-gray-900">

				{/* Header */}
				<div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
					<div className="flex items-center space-x-3">
						<div className="text-white">
							<h2 className="font-medium">Look Preview</h2>
							<p className="text-sm text-gray-300">
								{navigation.index + 1} of {navigation.total}
							</p>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						{onSettingsOpen && (
							<button
								onClick={onSettingsOpen}
								className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
							>
								<SettingsIcon className="w-5 h-5" />
							</button>
						)}

						<button
							onClick={() => setShowDetails(!showDetails)}
							className={`p-2 rounded-lg transition-colors ${showDetails
								? 'text-white bg-white/20'
								: 'text-white/70 hover:text-white hover:bg-white/10'
								}`}
						>
							<InfoIcon className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Main Preview Area */}
				<div className="flex-1 relative overflow-hidden">
					{/* 3D Avatar Viewer */}
					<div
						ref={containerRef}
						className="h-full relative"
						style={{
							transform: getSwipeTransform(),
							opacity: getSwipeOpacity(),
							transition: isTransitioning ? `all ${TRANSITION_DURATION}ms ease-out` : 'none'
						}}
						onMouseDown={handleMouseDown}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
					>
						{navigation.current && (
							<Avatar3DViewer
								outfit={navigation.current}
								className="h-full w-full"
							/>
						)}

						{/* Swipe Indicators */}
						{navigation.total > 1 && (
							<>
								{/* Left Indicator */}
								{navigation.hasPrevious && (
									<div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${swipeState.isDragging && swipeState.deltaX > 0 ? 'opacity-100' : 'opacity-0'
										}`}>
										<div className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white">
											<ChevronLeftIcon className="w-6 h-6" />
										</div>
									</div>
								)}

								{/* Right Indicator */}
								{navigation.hasNext && (
									<div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${swipeState.isDragging && swipeState.deltaX < 0 ? 'opacity-100' : 'opacity-0'
										}`}>
										<div className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white">
											<ChevronRightIcon className="w-6 h-6" />
										</div>
									</div>
								)}
							</>
						)}

						{/* Progress Dots */}
						{navigation.total > 1 && (
							<div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
								<div className="flex space-x-2">
									{Array.from({ length: Math.min(navigation.total, 10) }, (_, i) => (
										<button
											key={i}
											onClick={() => navigation.goTo(i)}
											className={`w-2 h-2 rounded-full transition-all duration-200 ${i === navigation.index
												? 'bg-white scale-125'
												: 'bg-white/40 hover:bg-white/60'
												}`}
										/>
									))}
									{navigation.total > 10 && (
										<div className="text-white/60 text-xs ml-2">
											+{navigation.total - 10}
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Navigation Arrows (Desktop) */}
					{navigation.total > 1 && (
						<>
							<button
								onClick={navigation.previous}
								disabled={!navigation.hasPrevious}
								className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hidden md:block"
							>
								<ChevronLeftIcon className="w-6 h-6" />
							</button>

							<button
								onClick={navigation.next}
								disabled={!navigation.hasNext}
								className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hidden md:block"
							>
								<ChevronRightIcon className="w-6 h-6" />
							</button>
						</>
					)}
				</div>

				{/* Bottom Action Bar */}
				<div className="p-4 bg-black/20 backdrop-blur-sm">
					{navigation.current && (
						<div className="flex items-center justify-between">
							{/* Outfit Info */}
							<div className="flex-1">
								<h3 className="text-white font-medium text-sm">
									{navigation.current.name}
								</h3>
								<p className="text-gray-300 text-xs capitalize">
									{navigation.current.styleCategory} • {navigation.current.items.length} items
								</p>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center space-x-3">
								{/* Capture (download only) */}
								<button
									onClick={() => handleCapture(false)}
									disabled={isCapturing}
									className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-40"
									title="Download snapshot"
								>
									<CameraIcon className="w-5 h-5" />
								</button>

								{/* Capture & Share */}
								{permissions?.allowOutfitSharing && (
									<button
										onClick={() => handleCapture(true)}
										disabled={isCapturing}
										className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-40"
										title="Share snapshot"
									>
										<ShareIcon className="w-5 h-5" />
									</button>
								)}
								<button
									onClick={handleFavoriteToggle}
									className={`p-2 rounded-full transition-all duration-300 ${favoriteAnimations[navigation.current.id]
										? 'bg-red-500 scale-125'
										: 'text-white/70 hover:text-red-400 hover:bg-white/10'
										}`}
								>
									<HeartIcon className={`w-5 h-5 ${favoriteAnimations[navigation.current.id] ? 'fill-current' : ''
										}`} />
								</button>

								{onOutfitShare && (
									<button
										onClick={() => onOutfitShare(navigation.current)}
										className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
									>
										<ShareIcon className="w-5 h-5" />
									</button>
								)}

								{onOutfitSave && (
									<button
										onClick={() => onOutfitSave(navigation.current)}
										className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
									>
										<SaveIcon className="w-4 h-4 mr-2 inline" />
										Save Look
									</button>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Outfit Details Overlay */}
				{showDetails && navigation.current && (
					<div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end">
						<div className="w-full bg-gray-900 rounded-t-3xl p-6 transform transition-transform duration-300">
							<div className="w-12 h-1 bg-gray-600 rounded mx-auto mb-6"></div>

							<div className="space-y-4">
								<div>
									<h3 className="text-white text-xl font-medium mb-2">
										{navigation.current.name}
									</h3>
									<div className="flex items-center space-x-4 text-sm text-gray-300">
										<span className="capitalize">{navigation.current.styleCategory}</span>
										<span>•</span>
										<span>{navigation.current.items.length} items</span>
										<span>•</span>
										<span>{Math.round(navigation.current.compatibility * 100)}% match</span>
									</div>
								</div>

								{/* Compatibility Score */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-gray-300 text-sm">Style Compatibility</span>
										<span className="text-white text-sm">
											{Math.round(navigation.current.compatibility * 100)}%
										</span>
									</div>
									<div className="w-full bg-gray-700 rounded-full h-2">
										<div
											className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
											style={{ width: `${navigation.current.compatibility * 100}%` }}
										></div>
									</div>
								</div>

								{/* Items List */}
								<div>
									<h4 className="text-white font-medium mb-3">Items in this look</h4>
									<div className="grid grid-cols-2 gap-3">
										{navigation.current.items.map((item, index) => (
											<div key={index} className="flex items-center space-x-3 bg-gray-800 rounded-lg p-3">
												<div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden">
													{item.garment.thumbnailUrl && (
														<img
															src={item.garment.thumbnailUrl}
															alt={item.garment.name}
															className="w-full h-full object-cover"
														/>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<h5 className="text-white text-sm font-medium truncate">
														{item.garment.name}
													</h5>
													<p className="text-gray-400 text-xs capitalize">
														{item.garment.category}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Close Button */}
								<button
									onClick={() => setShowDetails(false)}
									className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors mt-6"
								>
									Close Details
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Loading State */}
				{outfit.isGenerating && (
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
						<div className="bg-gray-900 rounded-2xl p-6 flex items-center space-x-3">
							<RefreshCcwIcon className="w-6 h-6 text-blue-400 animate-spin" />
							<span className="text-white">Generating new looks...</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default SwipeLookPreview
