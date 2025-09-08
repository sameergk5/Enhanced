// Unit Tests for Rule-Based Item Pairing Engine
// Task 8.3: Testing the pairing logic with predefined item pairs

import { GarmentAttributes } from '../src/types/stylist'
import { ItemPairingEngine, PairingUtils } from '../src/utils/itemPairingEngine'

/**
 * Test suite for the Item Pairing Engine
 */
export class ItemPairingEngineTests {
	private engine: ItemPairingEngine

	constructor() {
		this.engine = new ItemPairingEngine()
	}

	/**
	 * Run all tests
	 */
	runAllTests(): void {
		console.log('🧪 Running Item Pairing Engine Tests...\n')

		this.testBasicCompatibility()
		this.testFormalityMatching()
		this.testPatternCompatibility()
		this.testStyleCoherence()
		this.testCompleteOutfitCreation()
		this.testUtilityFunctions()
		this.testRequiredTestCases()

		console.log('✅ All Item Pairing Engine tests completed!')
	}

	/**
	 * Test basic compatibility scoring
	 */
	private testBasicCompatibility(): void {
		console.log('📊 Testing Basic Compatibility...')

		// Create test items
		const blueCasualTShirt = this.createTestGarment({
			id: '1',
			name: 'Blue Casual T-Shirt',
			category: 'top',
			color: { colorFamily: 'blue', intensity: 'medium' },
			formality: 'casual',
			pattern: 'solid',
			styleKeywords: ['casual', 'basic'],
			fit: 'regular'
		})

		const jeans = this.createTestGarment({
			id: '2',
			name: 'Blue Jeans',
			category: 'bottom',
			color: { colorFamily: 'blue', intensity: 'dark' },
			formality: 'casual',
			pattern: 'solid',
			styleKeywords: ['casual', 'classic'],
			fit: 'regular'
		})

		const blackFormalTrousers = this.createTestGarment({
			id: '3',
			name: 'Black Formal Trousers',
			category: 'bottom',
			color: { colorFamily: 'black', intensity: 'dark' },
			formality: 'formal',
			pattern: 'solid',
			styleKeywords: ['formal', 'business'],
			fit: 'fitted'
		})

		// Test pairing
		const jeansResult = this.engine.evaluatePairing(blueCasualTShirt, jeans)
		const formalResult = this.engine.evaluatePairing(blueCasualTShirt, blackFormalTrousers)

		console.log(`  Blue T-Shirt + Jeans: ${jeansResult.compatibilityScore.toFixed(3)} (${jeansResult.recommendation})`)
		console.log(`  Blue T-Shirt + Formal Trousers: ${formalResult.compatibilityScore.toFixed(3)} (${formalResult.recommendation})`)

		// Verify results
		const jeansHigher = jeansResult.compatibilityScore > formalResult.compatibilityScore
		console.log(`  ✓ Jeans score higher than formal trousers: ${jeansHigher ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Test formality matching logic
	 */
	private testFormalityMatching(): void {
		console.log('👔 Testing Formality Matching...')

		const casualTop = this.createTestGarment({
			id: '4',
			name: 'Casual Polo',
			category: 'top',
			formality: 'casual',
			color: { colorFamily: 'white', intensity: 'light' },
			pattern: 'solid',
			styleKeywords: ['casual'],
			fit: 'regular'
		})

		const businessPants = this.createTestGarment({
			id: '5',
			name: 'Business Chinos',
			category: 'bottom',
			formality: 'business',
			color: { colorFamily: 'khaki', intensity: 'medium' },
			pattern: 'solid',
			styleKeywords: ['business'],
			fit: 'fitted'
		})

		const casualShorts = this.createTestGarment({
			id: '6',
			name: 'Casual Shorts',
			category: 'bottom',
			formality: 'casual',
			color: { colorFamily: 'khaki', intensity: 'medium' },
			pattern: 'solid',
			styleKeywords: ['casual'],
			fit: 'regular'
		})

		const businessResult = this.engine.evaluatePairing(casualTop, businessPants)
		const casualResult = this.engine.evaluatePairing(casualTop, casualShorts)

		console.log(`  Casual Polo + Business Chinos: ${businessResult.compatibilityScore.toFixed(3)}`)
		console.log(`  Casual Polo + Casual Shorts: ${casualResult.compatibilityScore.toFixed(3)}`)

		const casualBetter = casualResult.compatibilityScore > businessResult.compatibilityScore
		console.log(`  ✓ Same formality scores higher: ${casualBetter ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Test pattern compatibility
	 */
	private testPatternCompatibility(): void {
		console.log('🎨 Testing Pattern Compatibility...')

		const solidShirt = this.createTestGarment({
			id: '7',
			name: 'Solid White Shirt',
			category: 'top',
			pattern: 'solid',
			color: { colorFamily: 'white', intensity: 'light' },
			formality: 'smart-casual',
			styleKeywords: ['classic'],
			fit: 'regular'
		})

		const stripedPants = this.createTestGarment({
			id: '8',
			name: 'Striped Pants',
			category: 'bottom',
			pattern: 'stripes',
			color: { colorFamily: 'navy', intensity: 'dark' },
			formality: 'smart-casual',
			styleKeywords: ['classic'],
			fit: 'fitted'
		})

		const floralPants = this.createTestGarment({
			id: '9',
			name: 'Floral Pants',
			category: 'bottom',
			pattern: 'floral',
			color: { colorFamily: 'navy', intensity: 'dark' },
			formality: 'smart-casual',
			styleKeywords: ['feminine'],
			fit: 'fitted'
		})

		const stripedResult = this.engine.evaluatePairing(solidShirt, stripedPants)
		const floralResult = this.engine.evaluatePairing(solidShirt, floralPants)

		console.log(`  Solid Shirt + Striped Pants: ${stripedResult.compatibilityScore.toFixed(3)}`)
		console.log(`  Solid Shirt + Floral Pants: ${floralResult.compatibilityScore.toFixed(3)}`)

		const patternScoreAcceptable = stripedResult.compatibilityScore > 0.6 && floralResult.compatibilityScore > 0.6
		console.log(`  ✓ Solid pairs well with patterns: ${patternScoreAcceptable ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Test style coherence
	 */
	private testStyleCoherence(): void {
		console.log('✨ Testing Style Coherence...')

		const minimalistTop = this.createTestGarment({
			id: '10',
			name: 'Minimalist Sweater',
			category: 'top',
			styleKeywords: ['minimalist', 'modern'],
			color: { colorFamily: 'gray', intensity: 'medium' },
			formality: 'smart-casual',
			pattern: 'solid',
			fit: 'regular'
		})

		const minimalistPants = this.createTestGarment({
			id: '11',
			name: 'Minimalist Trousers',
			category: 'bottom',
			styleKeywords: ['minimalist', 'modern'],
			color: { colorFamily: 'black', intensity: 'dark' },
			formality: 'smart-casual',
			pattern: 'solid',
			fit: 'fitted'
		})

		const bohemianSkirt = this.createTestGarment({
			id: '12',
			name: 'Bohemian Skirt',
			category: 'bottom',
			styleKeywords: ['bohemian', 'vintage'],
			color: { colorFamily: 'brown', intensity: 'medium' },
			formality: 'casual',
			pattern: 'floral',
			fit: 'loose'
		})

		const matchingStyleResult = this.engine.evaluatePairing(minimalistTop, minimalistPants)
		const conflictingStyleResult = this.engine.evaluatePairing(minimalistTop, bohemianSkirt)

		console.log(`  Minimalist + Minimalist: ${matchingStyleResult.compatibilityScore.toFixed(3)}`)
		console.log(`  Minimalist + Bohemian: ${conflictingStyleResult.compatibilityScore.toFixed(3)}`)

		const styleMatching = matchingStyleResult.compatibilityScore > conflictingStyleResult.compatibilityScore
		console.log(`  ✓ Matching styles score higher: ${styleMatching ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Test complete outfit creation
	 */
	private testCompleteOutfitCreation(): void {
		console.log('👗 Testing Complete Outfit Creation...')

		const anchorDress = this.createTestGarment({
			id: '13',
			name: 'Black Cocktail Dress',
			category: 'dress',
			color: { colorFamily: 'black', intensity: 'dark' },
			formality: 'formal',
			pattern: 'solid',
			styleKeywords: ['elegant', 'classic'],
			fit: 'fitted',
			occasion: ['evening', 'formal'],
			season: ['fall', 'winter']
		})

		const wardrobe = [
			this.createTestGarment({
				id: '14',
				name: 'Black Heels',
				category: 'shoes',
				color: { colorFamily: 'black', intensity: 'dark' },
				formality: 'formal',
				styleKeywords: ['elegant'],
				occasion: ['formal', 'evening']
			}),
			this.createTestGarment({
				id: '15',
				name: 'Pearl Necklace',
				category: 'accessory',
				color: { colorFamily: 'white', intensity: 'light' },
				formality: 'formal',
				styleKeywords: ['classic', 'elegant'],
				occasion: ['formal']
			}),
			this.createTestGarment({
				id: '16',
				name: 'Casual Sneakers',
				category: 'shoes',
				color: { colorFamily: 'white', intensity: 'light' },
				formality: 'casual',
				styleKeywords: ['athletic', 'casual'],
				occasion: ['casual']
			})
		]

		const outfit = this.engine.createCompleteOutfit(anchorDress, wardrobe, {
			context: { occasion: 'formal', season: 'fall' }
		})

		console.log(`  Complete outfit items: ${outfit.length}`)
		console.log(`  Items: ${outfit.map(item => item.name).join(', ')}`)

		const hasAppropriateShoes = outfit.some(item => item.category === 'shoes' && item.formality === 'formal')
		const hasAccessory = outfit.some(item => item.category === 'accessory')

		console.log(`  ✓ Has appropriate formal shoes: ${hasAppropriateShoes ? 'PASS' : 'FAIL'}`)
		console.log(`  ✓ Includes accessories: ${hasAccessory ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Test utility functions
	 */
	private testUtilityFunctions(): void {
		console.log('🛠️ Testing Utility Functions...')

		const shirt = this.createTestGarment({
			id: '17',
			name: 'White Shirt',
			category: 'top',
			formality: 'business',
			color: { colorFamily: 'white', intensity: 'light' },
			pattern: 'solid',
			styleKeywords: ['classic'],
			fit: 'regular'
		})

		const dressPants = this.createTestGarment({
			id: '18',
			name: 'Dress Pants',
			category: 'bottom',
			formality: 'business',
			color: { colorFamily: 'black', intensity: 'dark' },
			pattern: 'solid',
			styleKeywords: ['classic'],
			fit: 'fitted'
		})

		// Test quick compatibility check
		const isCompatible = PairingUtils.quickCompatibilityCheck(shirt, dressPants)
		console.log(`  Quick compatibility (shirt + dress pants): ${isCompatible}`)

		// Test outfit validation
		const outfit = [shirt, dressPants]
		const validation = PairingUtils.validateOutfit(outfit)
		console.log(`  Outfit validation: ${validation.isValid} (score: ${validation.score.toFixed(3)})`)

		console.log(`  ✓ Business outfit is compatible: ${isCompatible ? 'PASS' : 'FAIL'}`)
		console.log(`  ✓ Outfit validation works: ${validation.isValid ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Test the specific required test cases from task specification
	 */
	private testRequiredTestCases(): void {
		console.log('📋 Testing Required Test Cases (Task Specification)...')

		// Required test: Blue casual t-shirt should score high with jeans, low with black formal trousers
		const blueCasualTShirt = this.createTestGarment({
			id: 'test1',
			name: 'Blue Casual T-Shirt',
			category: 'top',
			color: { colorFamily: 'blue', intensity: 'medium' },
			formality: 'casual',
			pattern: 'solid',
			styleKeywords: ['casual'],
			fit: 'regular'
		})

		const jeans = this.createTestGarment({
			id: 'test2',
			name: 'Jeans',
			category: 'bottom',
			color: { colorFamily: 'blue', intensity: 'dark' },
			formality: 'casual',
			pattern: 'solid',
			styleKeywords: ['casual'],
			fit: 'regular'
		})

		const blackFormalTrousers = this.createTestGarment({
			id: 'test3',
			name: 'Black Formal Trousers',
			category: 'bottom',
			color: { colorFamily: 'black', intensity: 'dark' },
			formality: 'formal',
			pattern: 'solid',
			styleKeywords: ['formal', 'business'],
			fit: 'fitted'
		})

		const jeansResult = this.engine.evaluatePairing(blueCasualTShirt, jeans)
		const formalResult = this.engine.evaluatePairing(blueCasualTShirt, blackFormalTrousers)

		console.log(`  📊 Required Test Results:`)
		console.log(`     Blue Casual T-Shirt + Jeans: ${jeansResult.compatibilityScore.toFixed(3)} (${jeansResult.recommendation})`)
		console.log(`     Blue Casual T-Shirt + Black Formal Trousers: ${formalResult.compatibilityScore.toFixed(3)} (${formalResult.recommendation})`)

		// Test assertions as specified
		const jeansHighScore = jeansResult.compatibilityScore >= 0.65 // Should be "good" or better
		const formalLowScore = formalResult.compatibilityScore <= 0.5 // Should be "fair" or worse
		const jeansVsFormalComparison = jeansResult.compatibilityScore > formalResult.compatibilityScore

		console.log(`  ✅ Assertions:`)
		console.log(`     ✓ Jeans get high compatibility score (≥0.65): ${jeansHighScore ? 'PASS' : 'FAIL'}`)
		console.log(`     ✓ Formal trousers get low score (≤0.5): ${formalLowScore ? 'PASS' : 'FAIL'}`)
		console.log(`     ✓ Jeans score higher than formal trousers: ${jeansVsFormalComparison ? 'PASS' : 'FAIL'}`)

		const allRequiredTestsPass = jeansHighScore && formalLowScore && jeansVsFormalComparison
		console.log(`  📋 Required test cases: ${allRequiredTestsPass ? 'ALL PASS' : 'SOME FAILED'}`)
		console.log('')

		// Additional style clash tests
		this.testStyleClashes()
	}

	/**
	 * Test style clashes as mentioned in task description
	 */
	private testStyleClashes(): void {
		console.log('⚡ Testing Style Clashes...')

		const formalTop = this.createTestGarment({
			id: 'clash1',
			name: 'Formal Dress Shirt',
			category: 'top',
			formality: 'formal',
			color: { colorFamily: 'white', intensity: 'light' },
			pattern: 'solid',
			styleKeywords: ['formal', 'business'],
			fit: 'fitted'
		})

		const athleticShorts = this.createTestGarment({
			id: 'clash2',
			name: 'Athletic Shorts',
			category: 'bottom',
			formality: 'very-casual',
			color: { colorFamily: 'black', intensity: 'dark' },
			pattern: 'solid',
			styleKeywords: ['athletic', 'sporty'],
			fit: 'loose'
		})

		const clashResult = this.engine.evaluatePairing(formalTop, athleticShorts)
		console.log(`  Formal Top + Athletic Shorts: ${clashResult.compatibilityScore.toFixed(3)} (${clashResult.recommendation})`)

		const correctClashDetection = clashResult.compatibilityScore <= 0.4 // Should be "avoid"
		console.log(`  ✓ Style clash correctly detected: ${correctClashDetection ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Helper method to create test garments
	 */
	private createTestGarment(attributes: Partial<GarmentAttributes>): GarmentAttributes {
		return {
			id: attributes.id || 'test',
			name: attributes.name || 'Test Garment',
			category: attributes.category || 'top',
			color: attributes.color || { colorFamily: 'white', intensity: 'medium' },
			pattern: attributes.pattern || 'solid',
			formality: attributes.formality || 'casual',
			styleKeywords: attributes.styleKeywords || ['basic'],
			fit: attributes.fit || 'regular',
			material: attributes.material || 'cotton',
			occasion: attributes.occasion || ['casual'],
			season: attributes.season || ['all-season'],
			brand: attributes.brand || 'Test Brand',
			size: attributes.size || 'M',
			condition: attributes.condition || 'excellent',
			isFavorite: attributes.isFavorite || false,
			wearCount: attributes.wearCount || 0,
			lastWorn: attributes.lastWorn,
			purchaseDate: attributes.purchaseDate,
			care: attributes.care || ['machine-wash'],
			versatility: attributes.versatility || 5,
			trendiness: attributes.trendiness || 'classic',
			imageUrl: attributes.imageUrl
		}
	}
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
	const tests = new ItemPairingEngineTests()
	tests.runAllTests()
}

export default ItemPairingEngineTests
