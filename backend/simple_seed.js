import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function simpleSeed() {
	try {
		console.log('🌱 Starting simple database seeding...')

		// Create one test user
		console.log('Creating test user...')
		const hashedPassword = await bcrypt.hash('password123', 10)

		const user = await prisma.user.create({
			data: {
				email: 'test.user@example.com',
				username: 'testuser',
				displayName: 'Test User',
				profile: {
					create: {
						firstName: 'Test',
						lastName: 'User',
						gender: 'non-binary',
						height: 170
					}
				},
				styleProfile: {
					create: {
						preferredStyles: ['casual', 'smart_casual'],
						preferredColors: ['#000000', '#FFFFFF'],
						priceRange: { min: 20, max: 200 }
					}
				},
				avatars: {
					create: {
						name: 'Default Avatar',
						modelUrl: '/models/avatar-testuser.glb',
						thumbnailUrl: '/images/avatars/testuser-thumb.jpg',
						bodyType: 'athletic',
						skinTone: 'neutral',
						hairStyle: 'short',
						hairColor: 'brown',
						eyeColor: 'brown'
					}
				}
			}
		})

		console.log(`✅ Created user: ${user.displayName}`)

		// Create some basic garments
		console.log('Creating sample garments...')
		const sampleGarments = [
			{
				name: 'Blue Casual T-Shirt',
				description: 'Comfortable blue cotton t-shirt',
				category: 'top',
				subcategory: 't-shirt',
				brand: 'Casual Comfort',
				images: ['/images/samples/blue-tshirt.jpg'],
				color: '#4169E1',
				pattern: 'solid',
				size: 'M',
				material: 'Cotton',
				care: 'Machine wash',
				purchasePrice: 25.00,
				tags: ['casual', 'comfortable']
			},
			{
				name: 'Dark Blue Jeans',
				description: 'Classic straight-leg jeans',
				category: 'bottom',
				subcategory: 'jeans',
				brand: 'Denim Co.',
				images: ['/images/samples/dark-jeans.jpg'],
				color: '#191970',
				pattern: 'solid',
				size: '32',
				material: 'Denim',
				care: 'Machine wash cold',
				purchasePrice: 65.00,
				tags: ['casual', 'versatile']
			},
			{
				name: 'White Sneakers',
				description: 'Clean white sneakers',
				category: 'shoes',
				subcategory: 'sneakers',
				brand: 'Sport Style',
				images: ['/images/samples/white-sneakers.jpg'],
				color: '#FFFFFF',
				pattern: 'solid',
				size: '10',
				material: 'Synthetic',
				care: 'Wipe clean',
				purchasePrice: 75.00,
				tags: ['casual', 'sporty']
			}
		]

		for (const garmentData of sampleGarments) {
			const garment = await prisma.garment.create({
				data: {
					...garmentData,
					userId: user.id,
					purchaseDate: new Date()
				}
			})
			console.log(`✅ Created garment: ${garment.name}`)
		}

		console.log('🎉 Simple seeding completed!')

		// Verify the data
		const userCount = await prisma.user.count()
		const garmentCount = await prisma.garment.count()
		console.log(`📊 Database now has ${userCount} users and ${garmentCount} garments`)

	} catch (error) {
		console.error('❌ Seeding failed:', error)
	} finally {
		await prisma.$disconnect()
	}
}

simpleSeed()
