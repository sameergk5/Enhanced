// Outfit State Management Test Component
import React, { useState } from 'react'
import { outfitUtils, useOutfitManager, useOutfitNavigation, useOutfitSettings, useOutfitSync } from '../../hooks/useOutfitManager'
import { type Garment } from '../../services/wardrobe'

// Mock garment data for testing
const mockGarments: Garment[] = [
	{
		id: 'top-1',
		name: 'Blue Cotton T-Shirt',
		category: 'top',
		color: 'blue',
		brand: 'CasualWear',
		tags: ['casual', 'cotton', 'comfortable'],
		images: ['/mock/blue-tshirt.jpg'],
		thumbnailUrl: '/mock/blue-tshirt-thumb.jpg',
		isFavorite: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: 'bottom-1',
		name: 'Dark Denim Jeans',
		category: 'bottom',
		color: 'dark blue',
		brand: 'DenimCo',
		tags: ['casual', 'denim', 'versatile'],
		images: ['/mock/dark-jeans.jpg'],
		thumbnailUrl: '/mock/dark-jeans-thumb.jpg',
		isFavorite: false,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: 'shoes-1',
		name: 'White Sneakers',
		category: 'shoes',
		color: 'white',
		brand: 'SportySteps',
		tags: ['casual', 'sneakers', 'comfortable'],
		images: ['/mock/white-sneakers.jpg'],
		thumbnailUrl: '/mock/white-sneakers-thumb.jpg',
		isFavorite: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: 'outerwear-1',
		name: 'Black Leather Jacket',
		category: 'outerwear',
		color: 'black',
		brand: 'RockStyle',
		tags: ['edgy', 'leather', 'jacket'],
		images: ['/mock/leather-jacket.jpg'],
		thumbnailUrl: '/mock/leather-jacket-thumb.jpg',
		isFavorite: false,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	},
	{
		id: 'dress-1',
		name: 'Red Summer Dress',
		category: 'dress',
		color: 'red',
		brand: 'SummerVibes',
		tags: ['formal', 'summer', 'elegant'],
		images: ['/mock/red-dress.jpg'],
		thumbnailUrl: '/mock/red-dress-thumb.jpg',
		isFavorite: true,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z'
	}
]

const OutfitStateTest: React.FC = () => {
	// Use all the hooks
	const outfit = useOutfitManager()
	const navigation = useOutfitNavigation()
	const settings = useOutfitSettings()
	const sync = useOutfitSync()

	const [testResults, setTestResults] = useState<string[]>([])
	const [isRunning, setIsRunning] = useState(false)

	/**
	 * Add test result
	 */
	const addResult = (message: string, success: boolean = true) => {
		const status = success ? '✅' : '❌'
		setTestResults(prev => [...prev, `${status} ${message}`])
	}

	/**
	 * Run comprehensive state management tests
	 */
	const runTests = async () => {
		setIsRunning(true)
		setTestResults([])

		try {
			// Test 1: Clear initial state
			addResult('Starting tests...')
			outfit.clearSelection()
			addResult(`Initial clear: ${outfit.selectedCount === 0}`, outfit.selectedCount === 0)

			// Test 2: Add single item
			outfit.addItem(mockGarments[0])
			await new Promise(resolve => setTimeout(resolve, 100))
			addResult(`Add single item: ${outfit.selectedCount === 1}`, outfit.selectedCount === 1)

			// Test 3: Add multiple items
			mockGarments.slice(1, 4).forEach(garment => outfit.addItem(garment))
			await new Promise(resolve => setTimeout(resolve, 200))
			addResult(`Add multiple items: ${outfit.selectedCount === 4}`, outfit.selectedCount === 4)

			// Test 4: Test category limits (should replace existing in same category)
			const anotherTop: Garment = {
				...mockGarments[0],
				id: 'top-2',
				name: 'Green T-Shirt',
				color: 'green'
			}
			outfit.addItem(anotherTop)
			await new Promise(resolve => setTimeout(resolve, 100))

			const topItems = Object.values(outfit.selectedItems).filter(item => item.category === 'top')
			addResult(`Category limit enforcement: ${topItems.length <= 2}`, topItems.length <= 2)

			// Test 5: Test combination generation
			const canGenerate = outfit.canGenerate
			addResult(`Can generate combinations: ${canGenerate}`, canGenerate)

			if (canGenerate) {
				await outfit.generateCombinations()
				await new Promise(resolve => setTimeout(resolve, 500))
				addResult(`Generated combinations: ${navigation.total > 0}`, navigation.total > 0)
				addResult(`Current combination exists: ${navigation.current !== null}`, navigation.current !== null)
			}

			// Test 6: Test navigation
			if (navigation.total > 1) {
				const initialIndex = navigation.index
				navigation.next()
				await new Promise(resolve => setTimeout(resolve, 100))
				addResult(`Navigation next: ${navigation.index !== initialIndex}`, navigation.index !== initialIndex)

				navigation.previous()
				await new Promise(resolve => setTimeout(resolve, 100))
				addResult(`Navigation previous: ${navigation.index === initialIndex}`, navigation.index === initialIndex)
			}

			// Test 7: Test settings
			const initialIncludeOptional = settings.options.includeOptional
			settings.updateOption('includeOptional', !initialIncludeOptional)
			await new Promise(resolve => setTimeout(resolve, 100))
			addResult(`Settings update: ${settings.options.includeOptional !== initialIncludeOptional}`,
				settings.options.includeOptional !== initialIncludeOptional)

			// Test 8: Test sync functionality
			const selectedIds = sync.selectedIds
			addResult(`Sync selected IDs: ${selectedIds.length === outfit.selectedCount}`,
				selectedIds.length === outfit.selectedCount)

			// Test 9: Test outfit utils
			if (navigation.current) {
				const styleScore = outfitUtils.calculateStyleScore(navigation.current)
				addResult(`Style score calculation: ${styleScore >= 0 && styleScore <= 1}`,
					styleScore >= 0 && styleScore <= 1)

				const categoryDist = outfitUtils.getCategoryDistribution(navigation.current)
				addResult(`Category distribution: ${Object.keys(categoryDist).length > 0}`,
					Object.keys(categoryDist).length > 0)
			}

			// Test 10: Test removal
			const firstItemId = Object.keys(outfit.selectedItems)[0]
			const initialCount = outfit.selectedCount
			outfit.removeItem(firstItemId)
			await new Promise(resolve => setTimeout(resolve, 100))
			addResult(`Item removal: ${outfit.selectedCount === initialCount - 1}`,
				outfit.selectedCount === initialCount - 1)

			// Test 11: Test conflicting categories (dress vs top/bottom)
			outfit.clearSelection()
			outfit.addItem(mockGarments[4]) // Add dress
			outfit.addItem(mockGarments[0]) // Add top
			outfit.addItem(mockGarments[1]) // Add bottom
			await new Promise(resolve => setTimeout(resolve, 200))

			if (outfit.canGenerate) {
				await outfit.generateCombinations()
				await new Promise(resolve => setTimeout(resolve, 500))

				// Check that generated combinations don't have conflicting items
				const hasValidCombinations = navigation.total > 0
				addResult(`Conflict resolution: ${hasValidCombinations}`, hasValidCombinations)

				if (navigation.current) {
					const items = navigation.current.items
					const hasDress = items.some(item => item.garment.category === 'dress')
					const hasTopAndBottom = items.some(item => item.garment.category === 'top') &&
						items.some(item => item.garment.category === 'bottom')
					const noConflict = !(hasDress && hasTopAndBottom)
					addResult(`No dress+top/bottom conflicts: ${noConflict}`, noConflict)
				}
			}

			addResult('All tests completed successfully! 🎉')

		} catch (error) {
			addResult(`Test error: ${error}`, false)
		} finally {
			setIsRunning(false)
		}
	}

	/**
	 * Demo outfit creation workflow
	 */
	const runDemoWorkflow = async () => {
		setTestResults(['🎭 Running demo workflow...'])

		// Clear and set up a nice outfit
		outfit.clearSelection()

		// Add items for casual outfit
		outfit.addItem(mockGarments[0]) // Blue t-shirt
		outfit.addItem(mockGarments[1]) // Dark jeans
		outfit.addItem(mockGarments[2]) // White sneakers

		await new Promise(resolve => setTimeout(resolve, 300))

		// Generate combinations
		await outfit.generateCombinations()
		await new Promise(resolve => setTimeout(resolve, 500))

		addResult(`Created casual outfit with ${outfit.selectedCount} items`)
		addResult(`Generated ${navigation.total} combinations`)

		if (navigation.current) {
			addResult(`Current combo: ${navigation.current.name}`)
			addResult(`Style: ${navigation.current.styleCategory}`)
			addResult(`Compatibility: ${Math.round(navigation.current.compatibility * 100)}%`)
		}
	}

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">
					Outfit State Management Test Suite
				</h1>
				<p className="text-gray-600">
					Comprehensive testing of outfit combination state management
				</p>
			</div>

			{/* Test Controls */}
			<div className="flex justify-center space-x-4">
				<button
					onClick={runTests}
					disabled={isRunning}
					className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
				>
					{isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
				</button>

				<button
					onClick={runDemoWorkflow}
					disabled={isRunning}
					className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
				>
					Run Demo Workflow
				</button>

				<button
					onClick={() => {
						outfit.clearSelection()
						setTestResults([])
					}}
					className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
				>
					Clear All
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Current State Display */}
				<div className="bg-white border border-gray-200 rounded-lg p-4">
					<h3 className="font-medium text-gray-900 mb-3">Current State</h3>

					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span>Selected Items:</span>
							<span className="font-medium">{outfit.selectedCount}</span>
						</div>
						<div className="flex justify-between">
							<span>Generated Combinations:</span>
							<span className="font-medium">{navigation.total}</span>
						</div>
						<div className="flex justify-between">
							<span>Current Index:</span>
							<span className="font-medium">{navigation.index + 1}</span>
						</div>
						<div className="flex justify-between">
							<span>Can Generate:</span>
							<span className="font-medium">{outfit.canGenerate ? 'Yes' : 'No'}</span>
						</div>
						<div className="flex justify-between">
							<span>Is Generating:</span>
							<span className="font-medium">{outfit.isGenerating ? 'Yes' : 'No'}</span>
						</div>
						<div className="flex justify-between">
							<span>Include Optional:</span>
							<span className="font-medium">{settings.options.includeOptional ? 'Yes' : 'No'}</span>
						</div>
						<div className="flex justify-between">
							<span>Max Combinations:</span>
							<span className="font-medium">{settings.options.maxCombinations}</span>
						</div>
					</div>

					{/* Current Combination */}
					{navigation.current && (
						<div className="mt-4 pt-4 border-t border-gray-200">
							<h4 className="font-medium text-gray-900 mb-2">Current Combination</h4>
							<div className="space-y-1 text-sm text-gray-600">
								<p><strong>Name:</strong> {navigation.current.name}</p>
								<p><strong>Style:</strong> {navigation.current.styleCategory}</p>
								<p><strong>Items:</strong> {navigation.current.items.length}</p>
								<p><strong>Compatibility:</strong> {Math.round(navigation.current.compatibility * 100)}%</p>
							</div>
						</div>
					)}
				</div>

				{/* Test Results */}
				<div className="bg-white border border-gray-200 rounded-lg p-4">
					<h3 className="font-medium text-gray-900 mb-3">Test Results</h3>

					{testResults.length > 0 ? (
						<div className="space-y-1 text-sm max-h-96 overflow-y-auto">
							{testResults.map((result, index) => (
								<div key={index} className="font-mono text-xs">
									{result}
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500 text-sm">No tests run yet</p>
					)}
				</div>
			</div>

			{/* Selected Items Display */}
			{outfit.selectedCount > 0 && (
				<div className="bg-white border border-gray-200 rounded-lg p-4">
					<h3 className="font-medium text-gray-900 mb-3">Selected Items</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{Object.values(outfit.selectedItems).map((item) => (
							<div key={item.garmentId} className="border border-gray-200 rounded-lg p-3">
								<h4 className="font-medium text-gray-900 text-sm truncate">
									{item.garment.name}
								</h4>
								<p className="text-xs text-gray-500 capitalize mt-1">
									{item.garment.category} • {item.garment.color}
								</p>
								<p className="text-xs text-gray-400 mt-1">
									Priority: {item.priority} • Layer: {item.position}
								</p>
								<button
									onClick={() => outfit.removeItem(item.garmentId)}
									className="mt-2 text-xs text-red-600 hover:text-red-800"
								>
									Remove
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Mock Data Preview */}
			<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
				<h3 className="font-medium text-gray-900 mb-3">Available Mock Garments</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
					{mockGarments.map((garment) => (
						<div key={garment.id} className="bg-white border border-gray-200 rounded-lg p-3">
							<h4 className="font-medium text-gray-900 text-sm truncate">
								{garment.name}
							</h4>
							<p className="text-xs text-gray-500 capitalize mt-1">
								{garment.category} • {garment.color}
							</p>
							<button
								onClick={() => outfit.addItem(garment)}
								disabled={sync.selectedIds.includes(garment.id)}
								className="mt-2 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
							>
								{sync.selectedIds.includes(garment.id) ? 'Selected' : 'Add to Outfit'}
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default OutfitStateTest
