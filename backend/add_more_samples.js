import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMoreSampleData() {
	try {
		console.log('🌱 Adding more sample garments...')

		// Get the existing test user
		const testUser = await prisma.user.findFirst()
		if (!testUser) {
			console.log('❌ No test user found. Run simple_seed.js first.')
			return
		}

		console.log(`Adding garments for user: ${testUser.displayName}`)

		// Add more diverse garments for better testing
		const additionalGarments = [
			{
				name: 'Black Formal Trousers',
				description: 'Tailored black trousers for formal occasions',
				category: 'bottom',
				subcategory: 'trousers',
				brand: 'Formal Wear',
				images: ['/images/samples/black-trousers.jpg'],
				color: '#000000',
				pattern: 'solid',
				size: '32',
				material: 'Wool',
				care: 'Dry clean only',
				purchasePrice: 85.00,
				tags: ['formal', 'professional', 'elegant']
			},
			{
				name: 'White Button-Down Shirt',
				description: 'Classic white cotton button-down shirt',
				category: 'top',
				subcategory: 'button-down',
				brand: 'UniqU',
				images: ['/images/samples/white-button-down.jpg'],
				color: '#FFFFFF',
				pattern: 'solid',
				size: 'M',
				material: 'Cotton',
				care: 'Machine wash cold',
				purchasePrice: 45.00,
				tags: ['professional', 'versatile', 'classic']
			},
			{
				name: 'Navy Blue Blazer',
				description: 'Professional navy blazer with modern slim fit',
				category: 'outerwear',
				subcategory: 'blazer',
				brand: 'Business Elite',
				images: ['/images/samples/navy-blazer.jpg'],
				color: '#000080',
				pattern: 'solid',
				size: 'M',
				material: 'Wool Blend',
				care: 'Dry clean only',
				purchasePrice: 120.00,
				tags: ['professional', 'formal', 'structured']
			},
			{
				name: 'Red Casual Polo',
				description: 'Comfortable red cotton polo shirt',
				category: 'top',
				subcategory: 'polo',
				brand: 'Casual Sport',
				images: ['/images/samples/red-polo.jpg'],
				color: '#DC143C',
				pattern: 'solid',
				size: 'M',
				material: 'Cotton',
				care: 'Machine wash warm',
				purchasePrice: 35.00,
				tags: ['casual', 'sporty', 'comfortable']
			},
			{
				name: 'Brown Leather Belt',
				description: 'Classic brown leather belt with silver buckle',
				category: 'accessory',
				subcategory: 'belt',
				brand: 'Leather Goods Co.',
				images: ['/images/samples/brown-belt.jpg'],
				color: '#8B4513',
				pattern: 'solid',
				size: 'M',
				material: 'Leather',
				care: 'Condition leather monthly',
				purchasePrice: 40.00,
				tags: ['professional', 'accessory', 'leather']
			},
			{
				name: 'Khaki Chino Pants',
				description: 'Versatile khaki chino pants for smart casual looks',
				category: 'bottom',
				subcategory: 'chinos',
				brand: 'Smart Casual',
				images: ['/images/samples/khaki-chinos.jpg'],
				color: '#C3B091',
				pattern: 'solid',
				size: '32',
				material: 'Cotton',
				care: 'Machine wash cold',
				purchasePrice: 60.00,
				tags: ['smart-casual', 'versatile', 'professional']
			},
			{
				name: 'Black Dress Shoes',
				description: 'Classic black leather dress shoes',
				category: 'shoes',
				subcategory: 'dress-shoes',
				brand: 'Leather Craft',
				images: ['/images/samples/black-dress-shoes.jpg'],
				color: '#000000',
				pattern: 'solid',
				size: '10',
				material: 'Leather',
				care: 'Polish regularly',
				purchasePrice: 150.00,
				tags: ['formal', 'professional', 'leather']
			},
			{
				name: 'Gray Wool Sweater',
				description: 'Soft gray wool sweater for cooler weather',
				category: 'top',
				subcategory: 'sweater',
				brand: 'Cozy Knits',
				images: ['/images/samples/gray-sweater.jpg'],
				color: '#808080',
				pattern: 'solid',
				size: 'M',
				material: 'Wool',
				care: 'Hand wash cold',
				purchasePrice: 75.00,
				tags: ['casual', 'warm', 'comfortable']
			},
			{
				name: 'Denim Jacket',
				description: 'Classic blue denim jacket',
				category: 'outerwear',
				subcategory: 'jacket',
				brand: 'Denim Heritage',
				images: ['/images/samples/denim-jacket.jpg'],
				color: '#4169E1',
				pattern: 'solid',
				size: 'M',
				material: 'Cotton Denim',
				care: 'Machine wash cold',
				purchasePrice: 75.00,
				tags: ['casual', 'classic', 'denim']
			},
			{
				name: 'Black Watch',
				description: 'Classic black leather strap watch',
				category: 'accessory',
				subcategory: 'watch',
				brand: 'Time Piece',
				images: ['/images/samples/black-watch.jpg'],
				color: '#000000',
				pattern: 'solid',
				size: 'One Size',
				material: 'Stainless Steel',
				care: 'Wipe clean with soft cloth',
				purchasePrice: 120.00,
				tags: ['professional', 'accessory', 'elegant']
			}
		]

		for (const garmentData of additionalGarments) {
			try {
				const garment = await prisma.garment.create({
					data: {
						...garmentData,
						userId: testUser.id,
						purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
					}
				})
				console.log(`✅ Created garment: ${garment.name}`)
			} catch (error) {
				console.log(`⚠️  Skipped garment: ${garmentData.name} (may already exist)`)
			}
		}

		// Verify final count
		const finalGarmentCount = await prisma.garment.count()
		console.log(`🎉 Database now has ${finalGarmentCount} total garments`)

	} catch (error) {
		console.error('❌ Error adding sample data:', error)
	} finally {
		await prisma.$disconnect()
	}
}

addMoreSampleData()
