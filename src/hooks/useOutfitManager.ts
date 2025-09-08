// Outfit State Management Hooks and Utils
import { useCallback, useEffect } from 'react'
import { type OutfitCombination, type OutfitItem } from '../services/virtualTryOn'
import { type Garment } from '../services/wardrobe'
import { useOutfitStore, type OutfitGenerationOptions } from '../stores/outfitStore'

/**
 * Main hook for outfit management - provides high-level interface
 */
export function useOutfitManager() {
	const store = useOutfitStore()

	// Auto-generate combinations when selections change
	useEffect(() => {
		const { selectedItems, canGenerateCombinations, generatedCombinations } = store
		const hasSelections = Object.keys(selectedItems).length > 0
		const hasNoCombinations = generatedCombinations.length === 0

		if (hasSelections && hasNoCombinations && canGenerateCombinations()) {
			// Debounce generation to avoid excessive calls
			const timer = setTimeout(() => {
				store.generateCombinations()
			}, 500)

			return () => clearTimeout(timer)
		}
	}, [store.selectedItems, store])

	return {
		// State
		selectedItems: store.selectedItems,
		currentCombination: store.currentCombination,
		generatedCombinations: store.generatedCombinations,
		combinationIndex: store.combinationIndex,
		isGenerating: store.isGenerating,

		// Actions
		addItem: store.addItem,
		removeItem: store.removeItem,
		clearSelection: store.clearSelection,
		generateCombinations: store.generateCombinations,
		selectCombination: store.selectCombination,
		nextCombination: store.nextCombination,
		previousCombination: store.previousCombination,

		// Settings
		generationOptions: store.generationOptions,
		updateGenerationOptions: store.updateGenerationOptions,

		// Computed
		selectedCount: store.getTotalSelectedCount(),
		canGenerate: store.canGenerateCombinations(),
		hasValidCombinations: store.getValidCombinations().length > 0
	}
}

/**
 * Hook for managing selection by category
 */
export function useCategorySelection(category: string) {
	const store = useOutfitStore()

	const itemsInCategory = useCallback(() => {
		return store.getSelectedByCategory(category)
	}, [store, category])

	const addToCategory = useCallback((garment: Garment) => {
		if (garment.category === category) {
			store.addItem(garment)
		}
	}, [store, category])

	const removeFromCategory = useCallback((garmentId: string) => {
		const item = store.selectedItems[garmentId]
		if (item && item.category === category) {
			store.removeItem(garmentId)
		}
	}, [store, category])

	return {
		items: itemsInCategory(),
		addItem: addToCategory,
		removeItem: removeFromCategory,
		count: itemsInCategory().length
	}
}

/**
 * Hook for outfit combination navigation
 */
export function useOutfitNavigation() {
	const store = useOutfitStore()

	const hasNext = store.combinationIndex < store.generatedCombinations.length - 1
	const hasPrevious = store.combinationIndex > 0
	const totalCombinations = store.generatedCombinations.length

	return {
		current: store.currentCombination,
		index: store.combinationIndex,
		total: totalCombinations,
		hasNext,
		hasPrevious,
		next: store.nextCombination,
		previous: store.previousCombination,
		goTo: store.selectCombination
	}
}

/**
 * Hook for outfit generation settings
 */
export function useOutfitSettings() {
	const store = useOutfitStore()

	const updateSetting = useCallback(<K extends keyof OutfitGenerationOptions>(
		key: K,
		value: OutfitGenerationOptions[K]
	) => {
		store.updateGenerationOptions({ [key]: value })
	}, [store])

	return {
		options: store.generationOptions,
		rules: store.combinationRules,
		updateOption: updateSetting,
		updateOptions: store.updateGenerationOptions,
		addRule: store.addCombinationRule,
		removeRule: store.removeCombinationRule
	}
}

/**
 * Utility hook for outfit state synchronization with external components
 */
export function useOutfitSync() {
	const store = useOutfitStore()

	// Sync selected items to external array format
	const getSelectedIds = useCallback((): string[] => {
		return Object.keys(store.selectedItems)
	}, [store.selectedItems])

	// Sync from external selection
	const syncFromIds = useCallback(async (garmentIds: string[], garments?: Garment[]) => {
		// Clear current selection
		store.clearSelection()

		// Add new items
		if (garments) {
			garments.forEach(garment => {
				if (garmentIds.includes(garment.id)) {
					store.addItem(garment)
				}
			})
		}
	}, [store])

	// Export current combination as outfit items
	const exportCurrentCombination = useCallback((): OutfitItem[] => {
		return store.currentCombination?.items || []
	}, [store.currentCombination])

	// Import outfit items as selection
	const importOutfitItems = useCallback((items: OutfitItem[]) => {
		store.clearSelection()
		items.forEach(item => {
			store.addItem(item.garment)
		})
	}, [store])

	return {
		selectedIds: getSelectedIds(),
		syncFromIds,
		exportCombination: exportCurrentCombination,
		importItems: importOutfitItems
	}
}

/**
 * Utility functions for outfit combination management
 */
export const outfitUtils = {
	/**
	 * Check if two combinations are similar
	 */
	areCombinationsSimilar(combo1: OutfitCombination, combo2: OutfitCombination): boolean {
		const ids1 = new Set(combo1.items.map(item => item.garmentId))
		const ids2 = new Set(combo2.items.map(item => item.garmentId))

		const intersection = new Set([...ids1].filter(id => ids2.has(id)))
		const union = new Set([...ids1, ...ids2])

		return intersection.size / union.size > 0.7 // 70% similarity threshold
	},

	/**
	 * Get category distribution for a combination
	 */
	getCategoryDistribution(combination: OutfitCombination): Record<string, number> {
		return combination.items.reduce((acc, item) => {
			acc[item.garment.category] = (acc[item.garment.category] || 0) + 1
			return acc
		}, {} as Record<string, number>)
	},

	/**
	 * Calculate style score for a combination
	 */
	calculateStyleScore(combination: OutfitCombination): number {
		// Consider factors like color harmony, category balance, etc.
		const categories = new Set(combination.items.map(item => item.garment.category))
		const colors = new Set(combination.items.map(item => item.garment.color.toLowerCase()))

		let score = combination.compatibility * 0.6 // Base compatibility

		// Category diversity bonus
		score += Math.min(categories.size / 4, 1) * 0.2

		// Color coordination bonus (fewer colors often better)
		score += Math.max(0, (4 - colors.size) / 4) * 0.2

		return Math.min(1, score)
	},

	/**
	 * Filter combinations by style preferences
	 */
	filterByStyle(
		combinations: OutfitCombination[],
		stylePreference: OutfitCombination['styleCategory']
	): OutfitCombination[] {
		return combinations.filter(combo => combo.styleCategory === stylePreference)
	},

	/**
	 * Sort combinations by various criteria
	 */
	sortCombinations(
		combinations: OutfitCombination[],
		sortBy: 'compatibility' | 'style' | 'recent' | 'category_count'
	): OutfitCombination[] {
		const sorted = [...combinations]

		switch (sortBy) {
			case 'compatibility':
				return sorted.sort((a, b) => b.compatibility - a.compatibility)

			case 'style':
				return sorted.sort((a, b) =>
					outfitUtils.calculateStyleScore(b) - outfitUtils.calculateStyleScore(a)
				)

			case 'recent':
				return sorted.sort((a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				)

			case 'category_count':
				return sorted.sort((a, b) => {
					const aCats = new Set(a.items.map(item => item.garment.category)).size
					const bCats = new Set(b.items.map(item => item.garment.category)).size
					return bCats - aCats
				})

			default:
				return sorted
		}
	}
}

/**
 * Custom hook for debounced outfit generation
 */
export function useDebouncedGeneration(delay: number = 500) {
	const store = useOutfitStore()

	const debouncedGenerate = useCallback(
		debounce(() => {
			if (store.canGenerateCombinations()) {
				store.generateCombinations()
			}
		}, delay),
		[store, delay]
	)

	return debouncedGenerate
}

/**
 * Simple debounce utility
 */
function debounce(func: Function, delay: number) {
	let timeoutId: NodeJS.Timeout
	return (...args: any[]) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => func.apply(null, args), delay)
	}
}

export default useOutfitManager
