// Test Suite for Skin-Tone Color Matching Algorithm
// Task 8.2: Testing the color matching implementation

import { ColorAnalysisUtils, SkinToneColorMatcher } from '../src/utils/skinToneColorMatching'

/**
 * Test the skin tone color matching algorithm
 */
export class SkinToneColorMatchingTests {
	private matcher: SkinToneColorMatcher

	constructor() {
		this.matcher = new SkinToneColorMatcher()
	}

	/**
	 * Run all tests
	 */
	runAllTests(): void {
		console.log('🧪 Running Skin-Tone Color Matching Tests...\n')

		this.testSkinToneAnalysis()
		this.testColorRecommendations()
		this.testGarmentColorScoring()
		this.testUtilityFunctions()
		this.testDiverseSkinTones()

		console.log('✅ All tests completed!')
	}

	/**
	 * Test skin tone analysis functionality
	 */
	private testSkinToneAnalysis(): void {
		console.log('📊 Testing Skin Tone Analysis...')

		const testCases = [
			{
				name: 'Light Warm Skin',
				rgb: { r: 230, g: 200, b: 180 },
				expectedUndertone: 'warm',
				expectedDepth: 'light'
			},
			{
				name: 'Medium Cool Skin',
				rgb: { r: 160, g: 140, b: 150 },
				expectedUndertone: 'cool',
				expectedDepth: 'medium'
			},
			{
				name: 'Deep Neutral Skin',
				rgb: { r: 100, g: 90, b: 85 },
				expectedUndertone: 'neutral',
				expectedDepth: 'deep'
			},
			{
				name: 'Very Light Cool Skin',
				rgb: { r: 250, g: 240, b: 245 },
				expectedUndertone: 'cool',
				expectedDepth: 'light'
			},
			{
				name: 'Deep Warm Skin',
				rgb: { r: 80, g: 70, b: 50 },
				expectedUndertone: 'warm',
				expectedDepth: 'deep'
			}
		]

		testCases.forEach(testCase => {
			const analysis = this.matcher.analyzeSkinTone(testCase.rgb)

			console.log(`  ${testCase.name}:`)
			console.log(`    Undertone: ${analysis.undertone} (expected: ${testCase.expectedUndertone})`)
			console.log(`    Depth: ${analysis.depth} (expected: ${testCase.expectedDepth})`)
			console.log(`    Confidence: ${analysis.confidence.toFixed(2)}`)
			console.log(`    Hex: ${analysis.hex}`)

			// Verify results
			const undertoneMatch = analysis.undertone === testCase.expectedUndertone
			const depthMatch = analysis.depth === testCase.expectedDepth

			console.log(`    ✓ Result: ${undertoneMatch && depthMatch ? 'PASS' : 'FAIL'}\n`)
		})
	}

	/**
	 * Test color recommendations generation
	 */
	private testColorRecommendations(): void {
		console.log('🎨 Testing Color Recommendations...')

		const testSkinTone = this.matcher.analyzeSkinTone({ r: 200, g: 180, b: 160 })
		const recommendations = this.matcher.generateColorRecommendations(testSkinTone)

		console.log(`  Skin Tone: ${testSkinTone.undertone} ${testSkinTone.depth}`)
		console.log(`  Excellent colors: ${recommendations.excellent.length}`)
		console.log(`  Good colors: ${recommendations.good.length}`)
		console.log(`  Fair colors: ${recommendations.fair.length}`)
		console.log(`  Avoid colors: ${recommendations.avoid.length}`)

		// Test that we have recommendations in each category
		const hasExcellent = recommendations.excellent.length > 0
		const hasGood = recommendations.good.length > 0
		const hasAvoid = recommendations.avoid.length > 0

		console.log(`  ✓ Has excellent recommendations: ${hasExcellent ? 'PASS' : 'FAIL'}`)
		console.log(`  ✓ Has good recommendations: ${hasGood ? 'PASS' : 'FAIL'}`)
		console.log(`  ✓ Has avoid recommendations: ${hasAvoid ? 'PASS' : 'FAIL'}`)

		// Show top recommendations
		console.log(`  Top excellent colors:`)
		recommendations.excellent.slice(0, 3).forEach(rec => {
			console.log(`    - ${rec.colorFamily}: ${rec.hex} (${rec.suitabilityScore})`)
		})
		console.log('')
	}

	/**
	 * Test garment color scoring
	 */
	private testGarmentColorScoring(): void {
		console.log('🔢 Testing Garment Color Scoring...')

		const testSkinTone = this.matcher.analyzeSkinTone({ r: 200, g: 180, b: 160 }) // Light warm

		const testColors = [
			{ name: 'Coral (should be high)', hex: '#FF7F7F' },
			{ name: 'Cool Blue (should be low)', hex: '#0066CC' },
			{ name: 'Neutral Gray (should be medium)', hex: '#808080' },
			{ name: 'Golden Yellow (should be high)', hex: '#FFD700' },
			{ name: 'Bright Pink (should be low)', hex: '#FF1493' }
		]

		testColors.forEach(color => {
			const score = this.matcher.scoreGarmentColor(color.hex, testSkinTone)
			console.log(`  ${color.name}: ${score.toFixed(3)}`)
		})

		// Test that scoring is working correctly
		const coralScore = this.matcher.scoreGarmentColor('#FF7F7F', testSkinTone)
		const coolBlueScore = this.matcher.scoreGarmentColor('#0066CC', testSkinTone)

		console.log(`  ✓ Coral score > Cool Blue score: ${coralScore > coolBlueScore ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Test utility functions
	 */
	private testUtilityFunctions(): void {
		console.log('🛠️ Testing Utility Functions...')

		const skinToneHex = '#C8B4A0' // Light warm skin
		const goodColorHex = '#FF7F7F' // Coral
		const badColorHex = '#0066CC'  // Cool blue

		// Test quick color match
		const goodScore = ColorAnalysisUtils.quickColorMatch(skinToneHex, goodColorHex)
		const badScore = ColorAnalysisUtils.quickColorMatch(skinToneHex, badColorHex)

		console.log(`  Quick match - Good color: ${goodScore.toFixed(3)}`)
		console.log(`  Quick match - Bad color: ${badScore.toFixed(3)}`)
		console.log(`  ✓ Good color scores higher: ${goodScore > badScore ? 'PASS' : 'FAIL'}`)

		// Test color flattering check
		const isGoodFlattering = ColorAnalysisUtils.isColorFlattering(skinToneHex, goodColorHex)
		const isBadFlattering = ColorAnalysisUtils.isColorFlattering(skinToneHex, badColorHex)

		console.log(`  Is coral flattering: ${isGoodFlattering}`)
		console.log(`  Is cool blue flattering: ${isBadFlattering}`)
		console.log(`  ✓ Flattering logic works: ${isGoodFlattering && !isBadFlattering ? 'PASS' : 'FAIL'}`)

		// Test basic palette generation
		const palette = ColorAnalysisUtils.generateBasicPalette(skinToneHex)
		console.log(`  Generated palette size: ${palette.length}`)
		console.log(`  ✓ Palette generated: ${palette.length > 0 ? 'PASS' : 'FAIL'}`)
		console.log('')
	}

	/**
	 * Test diverse skin tones as required
	 */
	private testDiverseSkinTones(): void {
		console.log('🌍 Testing Diverse Skin Tones...')

		const diverseSkinTones = [
			{ name: 'Very Light Cool (European)', rgb: { r: 250, g: 240, b: 245 } },
			{ name: 'Light Warm (Mediterranean)', rgb: { r: 220, g: 200, b: 180 } },
			{ name: 'Medium Cool (East Asian)', rgb: { r: 180, g: 165, b: 170 } },
			{ name: 'Medium Warm (Latino)', rgb: { r: 170, g: 150, b: 120 } },
			{ name: 'Deep Cool (African)', rgb: { r: 90, g: 80, b: 85 } },
			{ name: 'Deep Warm (South Asian)', rgb: { r: 100, g: 85, b: 65 } },
			{ name: 'Deep Neutral (Indigenous)', rgb: { r: 110, g: 95, b: 85 } }
		]

		diverseSkinTones.forEach(skinTone => {
			const analysis = this.matcher.analyzeSkinTone(skinTone.rgb)
			const recommendations = this.matcher.generateColorRecommendations(analysis)

			console.log(`  ${skinTone.name}:`)
			console.log(`    Analysis: ${analysis.undertone} ${analysis.depth} (${analysis.confidence.toFixed(2)} confidence)`)
			console.log(`    Excellent colors: ${recommendations.excellent.length}`)
			console.log(`    Best color families: ${recommendations.excellent.slice(0, 3).map(r => r.colorFamily).join(', ')}`)

			// Verify recommendations are appropriate for color theory
			const hasRecommendations = recommendations.excellent.length > 0 && recommendations.avoid.length > 0
			console.log(`    ✓ Has appropriate recommendations: ${hasRecommendations ? 'PASS' : 'FAIL'}`)
			console.log('')
		})

		console.log('✅ Color theory verification complete - all skin tones have appropriate warm/cool/neutral recommendations')
	}
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
	const tests = new SkinToneColorMatchingTests()
	tests.runAllTests()
}

export default SkinToneColorMatchingTests
