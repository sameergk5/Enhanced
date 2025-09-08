import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed initial reward milestones and virtual items
 * Creates the foundational reward system for the MVP
 */
export async function seedRewardMilestones() {
	console.log('🎁 Seeding reward milestones and virtual items...')

	try {
		// Create virtual items
		const virtualItems = [
			{
				itemType: 'accessory',
				itemId: 'goggles_aviator_gold',
				name: 'Golden Aviator Goggles',
				description: 'Stylish golden aviator goggles for the dedicated fashion enthusiast',
				imageUrl: '/images/rewards/goggles_aviator_gold.png',
				rarity: 'rare',
				category: 'goggles',
				metadata: {
					color: '#FFD700',
					style: 'aviator',
					material: 'metal',
					theme: 'luxury'
				}
			},
			{
				itemType: 'badge',
				itemId: 'streak_warrior_10',
				name: 'Streak Warrior Badge',
				description: 'A badge of honor for maintaining a 10-day streak',
				imageUrl: '/images/rewards/badge_streak_warrior.png',
				rarity: 'uncommon',
				category: 'badge',
				metadata: {
					achievement: 'streak_10',
					color: '#FF6B35',
					iconStyle: 'flame'
				}
			},
			{
				itemType: 'accessory',
				itemId: 'hat_fashionista_beret',
				name: 'Fashionista Beret',
				description: 'A chic beret for the sophisticated wardrobe curator',
				imageUrl: '/images/rewards/hat_fashionista_beret.png',
				rarity: 'epic',
				category: 'hat',
				metadata: {
					color: '#8B4513',
					style: 'french',
					material: 'wool'
				}
			},
			{
				itemType: 'accessory',
				itemId: 'glasses_trendy_frames',
				name: 'Trendy Designer Frames',
				description: 'Fashionable glasses for the style-conscious user',
				imageUrl: '/images/rewards/glasses_trendy_frames.png',
				rarity: 'common',
				category: 'glasses',
				metadata: {
					color: '#000000',
					style: 'modern',
					frameType: 'rectangular'
				}
			}
		]

		// Insert virtual items
		const createdItems = []
		for (const item of virtualItems) {
			const existing = await prisma.virtualItem.findUnique({
				where: {
					itemType_itemId: {
						itemType: item.itemType,
						itemId: item.itemId
					}
				}
			})

			if (!existing) {
				const created = await prisma.virtualItem.create({
					data: item
				})
				createdItems.push(created)
				console.log(`  ✅ Created virtual item: ${item.name}`)
			} else {
				createdItems.push(existing)
				console.log(`  ⏭️  Virtual item already exists: ${item.name}`)
			}
		}

		// Create reward milestones
		const milestones = [
			{
				milestoneType: 'streak',
				threshold: 3,
				virtualItemId: createdItems.find(item => item.itemId === 'glasses_trendy_frames').id,
				title: 'Fashion Rookie',
				description: 'Awarded for maintaining a 3-day engagement streak'
			},
			{
				milestoneType: 'streak',
				threshold: 7,
				virtualItemId: createdItems.find(item => item.itemId === 'streak_warrior_10').id,
				title: 'Weekly Warrior',
				description: 'Awarded for maintaining a 7-day engagement streak'
			},
			{
				milestoneType: 'streak',
				threshold: 10,
				virtualItemId: createdItems.find(item => item.itemId === 'goggles_aviator_gold').id,
				title: '10-Day Champion',
				description: 'Awarded for maintaining a 10-day engagement streak'
			},
			{
				milestoneType: 'streak',
				threshold: 30,
				virtualItemId: createdItems.find(item => item.itemId === 'hat_fashionista_beret').id,
				title: 'Fashion Devotee',
				description: 'Awarded for maintaining a 30-day engagement streak'
			}
		]

		// Insert reward milestones
		for (const milestone of milestones) {
			const existing = await prisma.rewardMilestone.findUnique({
				where: {
					milestoneType_threshold: {
						milestoneType: milestone.milestoneType,
						threshold: milestone.threshold
					}
				}
			})

			if (!existing) {
				await prisma.rewardMilestone.create({
					data: milestone
				})
				console.log(`  ✅ Created milestone: ${milestone.title} (${milestone.threshold}-day streak)`)
			} else {
				console.log(`  ⏭️  Milestone already exists: ${milestone.title}`)
			}
		}

		console.log('🎉 Reward milestone seeding completed!')

		// Return summary
		return {
			virtualItems: virtualItems.length,
			milestones: milestones.length,
			success: true
		}

	} catch (error) {
		console.error('❌ Error seeding reward milestones:', error)
		throw error
	}
}

/**
 * Standalone seeding script
 */
async function runSeeding() {
	try {
		const result = await seedRewardMilestones()
		console.log(`\n📊 Seeding Summary:`)
		console.log(`   Virtual Items: ${result.virtualItems}`)
		console.log(`   Milestones: ${result.milestones}`)
		console.log(`   Status: ✅ SUCCESS`)
	} catch (error) {
		console.error('Seeding failed:', error)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
	}
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runSeeding()
}
