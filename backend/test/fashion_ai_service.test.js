/**
 * Fashion AI Service Unit Tests (Task 8.4)
 * 
 * This file tests the Fashion AI service logic to ensure proper integration
 * of color matching and item pairing algorithms.
 */

import { jest } from '@jest/globals'
import { FashionAIService } from '../src/services/fashionAI.js'

// Mock Prisma Client
const mockPrisma = {
  garment: {
    findMany: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  }
}

// Mock the Prisma import
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}))

describe('Fashion AI Service (Task 8.4)', () => {
  let fashionAI

  beforeEach(() => {
    fashionAI = new FashionAIService()
    jest.clearAllMocks()
  })

  describe('Color Matching Integration', () => {
    it('should analyze skin tone compatibility correctly', () => {
      const skinToneColorMatcher = fashionAI.skinToneColorMatcher
      
      // Test cool skin tone analysis
      const coolAnalysis = skinToneColorMatcher.analyzeSkinTone({ skinTone: 'cool' })
      expect(coolAnalysis.primaryTone).toBe('cool')
      expect(coolAnalysis.undertone).toBe('pink/blue')
      expect(coolAnalysis.recommendations.excellent).toBeDefined()
      expect(coolAnalysis.recommendations.excellent.length).toBeGreaterThan(0)
      
      // Test warm skin tone analysis
      const warmAnalysis = skinToneColorMatcher.analyzeSkinTone({ skinTone: 'warm' })
      expect(warmAnalysis.primaryTone).toBe('warm')
      expect(warmAnalysis.undertone).toBe('yellow/golden')
      
      // Test neutral skin tone analysis
      const neutralAnalysis = skinToneColorMatcher.analyzeSkinTone({ skinTone: 'neutral' })
      expect(neutralAnalysis.primaryTone).toBe('neutral')
      expect(neutralAnalysis.undertone).toBe('balanced')
    })

    it('should calculate color compatibility scores correctly', () => {
      const skinToneColorMatcher = fashionAI.skinToneColorMatcher
      
      // Test cool skin tone with blue garment (should score high)
      const blueGarment = { primaryColor: 'blue', colors: ['blue'] }
      const coolBlueScore = skinToneColorMatcher.getColorCompatibilityScore(blueGarment, 'cool')
      expect(coolBlueScore).toBeGreaterThan(0.7)
      
      // Test cool skin tone with orange garment (should score low)
      const orangeGarment = { primaryColor: 'orange', colors: ['orange'] }
      const coolOrangeScore = skinToneColorMatcher.getColorCompatibilityScore(orangeGarment, 'cool')
      expect(coolOrangeScore).toBeLessThan(0.5)
      
      // Test warm skin tone with golden yellow (should score high)
      const yellowGarment = { primaryColor: 'golden yellow', colors: ['golden yellow'] }
      const warmYellowScore = skinToneColorMatcher.getColorCompatibilityScore(yellowGarment, 'warm')
      expect(warmYellowScore).toBeGreaterThan(0.7)
    })
  })

  describe('Item Pairing Engine Integration', () => {
    it('should score garment pairings based on multiple factors', () => {
      const pairingEngine = fashionAI.itemPairingEngine
      
      // Create test garments
      const blueShirt = {
        id: '1',
        category: 'top',
        primaryColor: 'blue',
        style: 'casual',
        pattern: 'solid',
        formality: 3
      }
      
      const jeans = {
        id: '2',
        category: 'bottom',
        primaryColor: 'navy',
        style: 'casual',
        pattern: 'solid',
        formality: 2
      }
      
      const formalTrousers = {
        id: '3',
        category: 'bottom',
        primaryColor: 'black',
        style: 'formal',
        pattern: 'solid',
        formality: 5
      }
      
      // Test casual pairing (should score well)
      const casualPairing = pairingEngine.scorePairing(
        blueShirt,
        jeans,
        { occasion: 'casual' },
        'cool'
      )
      expect(casualPairing.score).toBeGreaterThan(0.6)
      expect(casualPairing.breakdown.formality).toBeDefined()
      expect(casualPairing.breakdown.colorHarmony).toBeDefined()
      expect(casualPairing.breakdown.styleCoherence).toBeDefined()
      expect(casualPairing.breakdown.patternCompatibility).toBeDefined()
      
      // Test formal mismatch (should score lower)
      const formalMismatch = pairingEngine.scorePairing(
        blueShirt,
        formalTrousers,
        { occasion: 'formal' },
        'cool'
      )
      expect(formalMismatch.score).toBeLessThan(casualPairing.score)
    })

    it('should prevent pairing items of the same category', () => {
      const pairingEngine = fashionAI.itemPairingEngine
      
      const shirt1 = {
        id: '1',
        category: 'top',
        primaryColor: 'blue',
        style: 'casual'
      }
      
      const shirt2 = {
        id: '2',
        category: 'top',
        primaryColor: 'white',
        style: 'casual'
      }
      
      const pairing = pairingEngine.scorePairing(shirt1, shirt2, {}, 'neutral')
      expect(pairing.score).toBe(0)
      expect(pairing.reason).toContain('Same category')
    })

    it('should generate ranked outfit recommendations', () => {
      const pairingEngine = fashionAI.itemPairingEngine
      
      // Create test wardrobe
      const wardrobe = [
        {
          id: '1',
          category: 'top',
          primaryColor: 'blue',
          style: 'casual',
          pattern: 'solid'
        },
        {
          id: '2',
          category: 'bottom',
          primaryColor: 'navy',
          style: 'casual',
          pattern: 'solid'
        },
        {
          id: '3',
          category: 'bottom',
          primaryColor: 'black',
          style: 'formal',
          pattern: 'solid'
        },
        {
          id: '4',
          category: 'shoes',
          primaryColor: 'white',
          style: 'casual',
          pattern: 'solid'
        }
      ]
      
      const recommendations = pairingEngine.generateOutfitRecommendations(
        wardrobe,
        { occasion: 'casual' },
        'cool',
        3
      )
      
      expect(recommendations).toBeInstanceOf(Array)
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.length).toBeLessThanOrEqual(3)
      
      // Verify recommendations are sorted by score
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].score).toBeGreaterThanOrEqual(recommendations[i + 1].score)
      }
      
      // Verify recommendation structure
      const rec = recommendations[0]
      expect(rec).toHaveProperty('items')
      expect(rec).toHaveProperty('score')
      expect(rec).toHaveProperty('breakdown')
      expect(rec).toHaveProperty('recommendation')
      expect(rec).toHaveProperty('rank')
      expect(rec).toHaveProperty('id')
    })
  })

  describe('Full Service Integration', () => {
    it('should fetch user wardrobe and generate recommendations', async () => {
      // Mock database responses
      const mockWardrobeItems = [
        {
          id: 'garment1',
          category: 'top',
          subcategory: 'shirt',
          primaryColor: 'blue',
          secondaryColors: ['white'],
          style: 'casual',
          pattern: 'solid',
          material: 'cotton',
          brand: 'TestBrand',
          formality: 3,
          season: 'all',
          metadata: {},
          imageUrl: 'https://example.com/shirt.jpg'
        },
        {
          id: 'garment2',
          category: 'bottom',
          subcategory: 'jeans',
          primaryColor: 'navy',
          secondaryColors: [],
          style: 'casual',
          pattern: 'solid',
          material: 'denim',
          brand: 'TestBrand',
          formality: 2,
          season: 'all',
          metadata: {},
          imageUrl: 'https://example.com/jeans.jpg'
        }
      ]

      const mockUser = {
        id: 'user1',
        skinTone: 'cool',
        stylePreferences: ['casual'],
        measurements: {}
      }

      mockPrisma.garment.findMany.mockResolvedValue(mockWardrobeItems)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await fashionAI.getOutfitRecommendations({
        userId: 'user1',
        occasion: 'casual',
        weather: 'mild',
        skinTone: 'cool',
        maxRecommendations: 3
      })

      expect(result.success).toBe(true)
      expect(result.recommendations).toBeInstanceOf(Array)
      expect(result.skinToneAnalysis).toBeDefined()
      expect(result.skinToneAnalysis.primaryTone).toBe('cool')
      expect(result.totalWardrobeItems).toBe(2)
      expect(result.generatedAt).toBeDefined()

      // Verify database was called correctly
      expect(mockPrisma.garment.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          AND: [
            { category: { not: null } },
            { primaryColor: { not: null } }
          ]
        },
        select: expect.any(Object)
      })

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        select: {
          skinTone: true,
          stylePreferences: true,
          measurements: true
        }
      })
    })

    it('should handle empty wardrobe gracefully', async () => {
      mockPrisma.garment.findMany.mockResolvedValue([])
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1' })

      const result = await fashionAI.getOutfitRecommendations({
        userId: 'user1',
        occasion: 'casual'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('No wardrobe items found')
      expect(result.recommendations).toEqual([])
    })

    it('should filter recommendations by specific item ID', async () => {
      const mockWardrobeItems = [
        {
          id: 'shirt1',
          category: 'top',
          primaryColor: 'blue',
          style: 'casual',
          pattern: 'solid'
        },
        {
          id: 'jeans1',
          category: 'bottom',
          primaryColor: 'navy',
          style: 'casual',
          pattern: 'solid'
        },
        {
          id: 'jeans2',
          category: 'bottom',
          primaryColor: 'black',
          style: 'formal',
          pattern: 'solid'
        }
      ]

      mockPrisma.garment.findMany.mockResolvedValue(mockWardrobeItems)
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', skinTone: 'cool' })

      const result = await fashionAI.getOutfitRecommendations({
        userId: 'user1',
        itemId: 'shirt1',
        occasion: 'casual',
        maxRecommendations: 5
      })

      expect(result.success).toBe(true)
      
      // All recommendations should include the specified shirt
      for (const recommendation of result.recommendations) {
        const includesShirt = recommendation.items.some(item => item.id === 'shirt1')
        expect(includesShirt).toBe(true)
      }
    })

    it('should adapt recommendations based on context', () => {
      // Test season detection
      expect(fashionAI.getCurrentSeason()).toMatch(/spring|summer|autumn|winter/)
      
      // Test time of day detection
      expect(fashionAI.getTimeOfDay()).toMatch(/morning|afternoon|evening|night/)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.garment.findMany.mockRejectedValue(new Error('Database error'))

      const result = await fashionAI.getOutfitRecommendations({
        userId: 'user1',
        occasion: 'casual'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to generate recommendations')
      expect(result.details).toBeDefined()
    })

    it('should handle missing user profile', async () => {
      mockPrisma.garment.findMany.mockResolvedValue([
        { id: '1', category: 'top', primaryColor: 'blue', style: 'casual' }
      ])
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await fashionAI.getOutfitRecommendations({
        userId: 'nonexistent-user',
        occasion: 'casual'
      })

      expect(result.success).toBe(true) // Should still work with default skin tone
      expect(result.skinToneAnalysis.primaryTone).toBe('neutral') // Default value
    })
  })
})

export default describe
