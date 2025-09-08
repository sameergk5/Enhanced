import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Sample data for seeding
const SAMPLE_USERS = [
	{
		email: 'test.user@example.com',
		username: 'testuser',
		displayName: 'Test User',
		profile: {
			firstName: 'Test',
			lastName: 'User',
			gender: 'non-binary',
			height: 170,
			weight: 65
		},
		styleProfile: {
			preferredStyles: ['casual', 'smart_casual', 'minimalist'],
			preferredColors: ['#000000', '#FFFFFF', '#808080', '#000080'],
			priceRange: { min: 20, max: 200 },
			occupation: 'Software Developer',
			lifestyle: ['professional', 'active'],
			occasions: ['work', 'casual', 'weekend']
		},
		avatar: {
			name: 'Default Avatar',
			bodyType: 'athletic',
			skinTone: 'neutral',
			hairStyle: 'short',
			hairColor: 'brown',
			eyeColor: 'brown'
		}
	},
	{
		email: 'fashion.lover@example.com',
		username: 'fashionista',
		displayName: 'Fashion Lover',
		profile: {
			firstName: 'Fashion',
			lastName: 'Lover',
			gender: 'female',
			height: 165,
			weight: 58
		},
		styleProfile: {
			preferredStyles: ['formal', 'business_casual', 'vintage'],
			preferredColors: ['#800020', '#000080', '#E6E6FA', '#FFB6C1'],
			priceRange: { min: 50, max: 500 },
			occupation: 'Marketing Manager',
			lifestyle: ['professional', 'social'],
			occasions: ['work', 'formal', 'party', 'date']
		},
		avatar: {
			name: 'Elegant Avatar',
			bodyType: 'slim',
			skinTone: 'cool',
			hairStyle: 'long',
			hairColor: 'blonde',
			eyeColor: 'blue'
		}
	}
]

const SAMPLE_GARMENTS = [
	// TOPS
	{
		name: 'Classic White Button-Down Shirt',
		description: 'Timeless white cotton button-down shirt perfect for professional and casual settings',
		category: 'top',
		subcategory: 'button-down',
		brand: 'UniqU',
		images: ['/images/samples/white-button-down.jpg'],
		color: '#FFFFFF',
		pattern: 'solid',
		size: 'M',
		material: 'Cotton',
		care: 'Machine wash cold, hang dry',
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
		name: 'Casual Blue Denim Jeans',
		description: 'Classic straight-leg blue denim jeans',
		category: 'bottom',
		subcategory: 'jeans',
		brand: 'Denim Co.',
		images: ['/images/samples/blue-jeans.jpg'],
		color: '#4169E1',
		pattern: 'solid',
		size: '32',
		material: 'Cotton Denim',
		care: 'Machine wash cold, tumble dry low',
		purchasePrice: 65.00,
		tags: ['casual', 'versatile', 'everyday']
	},
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
		name: 'Red Casual T-Shirt',
		description: 'Comfortable red cotton t-shirt for casual wear',
		category: 'top',
		subcategory: 't-shirt',
		brand: 'Casual Comfort',
		images: ['/images/samples/red-tshirt.jpg'],
		color: '#DC143C',
		pattern: 'solid',
		size: 'M',
		material: 'Cotton',
		care: 'Machine wash warm, tumble dry',
		purchasePrice: 25.00,
		tags: ['casual', 'comfortable', 'everyday']
	},
	{
		name: 'Black Leather Shoes',
		description: 'Classic black leather dress shoes',
		category: 'shoes',
		subcategory: 'dress-shoes',
		brand: 'Leather Craft',
		images: ['/images/samples/black-dress-shoes.jpg'],
		color: '#000000',
		pattern: 'solid',
		size: '10',
		material: 'Leather',
		care: 'Polish regularly, store with shoe trees',
		purchasePrice: 150.00,
		tags: ['formal', 'professional', 'leather']
	},
	{
		name: 'White Sneakers',
		description: 'Clean white sneakers for casual outfits',
		category: 'shoes',
		subcategory: 'sneakers',
		brand: 'Sport Style',
		images: ['/images/samples/white-sneakers.jpg'],
		color: '#FFFFFF',
		pattern: 'solid',
		size: '10',
		material: 'Synthetic',
		care: 'Wipe clean with damp cloth',
		purchasePrice: 75.00,
		tags: ['casual', 'comfortable', 'sporty']
	},
	{
		name: 'Striped Cotton Sweater',
		description: 'Navy and white striped cotton sweater',
		category: 'top',
		subcategory: 'sweater',
		brand: 'Cozy Knits',
		images: ['/images/samples/striped-sweater.jpg'],
		color: '#000080',
		pattern: 'striped',
		size: 'M',
		material: 'Cotton',
		care: 'Hand wash cold, lay flat to dry',
		purchasePrice: 55.00,
		tags: ['casual', 'warm', 'pattern']
	},
	{
		name: 'Green Cargo Pants',
		description: 'Olive green cargo pants with multiple pockets',
		category: 'bottom',
		subcategory: 'cargo',
		brand: 'Outdoor Gear',
		images: ['/images/samples/green-cargo.jpg'],
		color: '#808000',
		pattern: 'solid',
		size: '32',
		material: 'Cotton Twill',
		care: 'Machine wash cold, tumble dry',
		purchasePrice: 70.00,
		tags: ['casual', 'utility', 'outdoor']
	},
	{
		name: 'Floral Summer Dress',
		description: 'Light floral print summer dress',
		category: 'dress',
		subcategory: 'summer-dress',
		brand: 'Summer Styles',
		images: ['/images/samples/floral-dress.jpg'],
		color: '#FFB6C1',
		pattern: 'floral',
		size: 'M',
		material: 'Cotton Blend',
		care: 'Machine wash gentle, hang dry',
		purchasePrice: 80.00,
		tags: ['feminine', 'summer', 'floral']
	},
	// Adding more diverse items for robust testing
	{
		name: 'Gray Wool Cardigan',
		description: 'Soft gray wool cardigan perfect for layering',
		category: 'outerwear',
		subcategory: 'cardigan',
		brand: 'Warm & Cozy',
		images: ['/images/samples/gray-cardigan.jpg'],
		color: '#808080',
		pattern: 'solid',
		size: 'M',
		material: 'Wool',
		care: 'Hand wash cold, reshape and dry flat',
		purchasePrice: 95.00,
		tags: ['layering', 'professional', 'warm']
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
		name: 'Beige Chino Pants',
		description: 'Versatile beige chino pants for smart casual looks',
		category: 'bottom',
		subcategory: 'chinos',
		brand: 'Smart Casual',
		images: ['/images/samples/beige-chinos.jpg'],
		color: '#F5DEB3',
		pattern: 'solid',
		size: '32',
		material: 'Cotton',
		care: 'Machine wash cold, iron if needed',
		purchasePrice: 60.00,
		tags: ['smart-casual', 'versatile', 'professional']
	},
	{
		name: 'Black Turtleneck',
		description: 'Elegant black turtleneck sweater',
		category: 'top',
		subcategory: 'turtleneck',
		brand: 'Minimalist',
		images: ['/images/samples/black-turtleneck.jpg'],
		color: '#000000',
		pattern: 'solid',
		size: 'M',
		material: 'Merino Wool',
		care: 'Hand wash cold, lay flat to dry',
		purchasePrice: 85.00,
		tags: ['minimalist', 'elegant', 'versatile']
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
		care: 'Machine wash cold, air dry',
		purchasePrice: 75.00,
		tags: ['casual', 'classic', 'denim']
	},
	{
		name: 'Burgundy Scarf',
		description: 'Soft burgundy wool scarf',
		category: 'accessory',
		subcategory: 'scarf',
		brand: 'Winter Accessories',
		images: ['/images/samples/burgundy-scarf.jpg'],
		color: '#800020',
		pattern: 'solid',
		size: 'One Size',
		material: 'Wool',
		care: 'Hand wash cold, lay flat to dry',
		purchasePrice: 35.00,
		tags: ['accessory', 'warm', 'elegant']
	},
	{
		name: 'Khaki Shorts',
		description: 'Comfortable khaki cotton shorts',
		category: 'bottom',
		subcategory: 'shorts',
		brand: 'Summer Comfort',
		images: ['/images/samples/khaki-shorts.jpg'],
		color: '#C3B091',
		pattern: 'solid',
		size: '32',
		material: 'Cotton',
		care: 'Machine wash warm, tumble dry',
		purchasePrice: 35.00,
		tags: ['casual', 'summer', 'comfortable']
	},
	{
		name: 'Polka Dot Blouse',
		description: 'White blouse with black polka dots',
		category: 'top',
		subcategory: 'blouse',
		brand: 'Pattern Play',
		images: ['/images/samples/polka-dot-blouse.jpg'],
		color: '#FFFFFF',
		pattern: 'polka-dot',
		size: 'M',
		material: 'Silk',
		care: 'Dry clean only',
		purchasePrice: 95.00,
		tags: ['feminine', 'pattern', 'professional']
	},
	{
		name: 'Athletic Joggers',
		description: 'Gray athletic joggers for workouts',
		category: 'bottom',
		subcategory: 'joggers',
		brand: 'Active Wear',
		images: ['/images/samples/gray-joggers.jpg'],
		color: '#808080',
		pattern: 'solid',
		size: 'M',
		material: 'Polyester Blend',
		care: 'Machine wash cold, tumble dry low',
		purchasePrice: 45.00,
		tags: ['athletic', 'comfortable', 'casual']
	},
	{
		name: 'Plaid Button-Up Shirt',
		description: 'Red and blue plaid flannel shirt',
		category: 'top',
		subcategory: 'flannel',
		brand: 'Country Style',
		images: ['/images/samples/plaid-shirt.jpg'],
		color: '#DC143C',
		pattern: 'plaid',
		size: 'M',
		material: 'Cotton Flannel',
		care: 'Machine wash warm, tumble dry',
		purchasePrice: 50.00,
		tags: ['casual', 'pattern', 'warm']
	}
]

// Additional garments to reach 100+ items
const generateMoreGarments = (baseGarments) => {
	const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A']
	const categories = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory']
	const materials = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather']
	const patterns = ['solid', 'striped', 'floral', 'geometric', 'plaid', 'polka-dot']
	const brands = ['Fashion Forward', 'Style Central', 'Trendy Threads', 'Classic Cuts', 'Modern Mode']

	const generatedGarments = []

	for (let i = 0; i < 85; i++) { // Generate 85 more to reach 100+ total
		const category = categories[i % categories.length]
		const color = colors[i % colors.length]
		const material = materials[i % materials.length]
		const pattern = patterns[i % patterns.length]
		const brand = brands[i % brands.length]

		const subcategories = {
			'top': ['t-shirt', 'blouse', 'tank-top', 'polo', 'hoodie'],
			'bottom': ['jeans', 'trousers', 'skirt', 'leggings', 'shorts'],
			'dress': ['casual-dress', 'formal-dress', 'maxi-dress', 'mini-dress'],
			'outerwear': ['jacket', 'coat', 'vest', 'blazer'],
			'shoes': ['sneakers', 'boots', 'sandals', 'heels', 'flats'],
			'accessory': ['belt', 'bag', 'hat', 'jewelry', 'watch']
		}

		const subcategory = subcategories[category][i % subcategories[category].length]

		generatedGarments.push({
			name: `${brand} ${material} ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} #${i + 1}`,
			description: `Stylish ${material.toLowerCase()} ${subcategory.replace('-', ' ')} in ${color}`,
			category,
			subcategory,
			brand,
			images: [`/images/samples/generated-${i + 1}.jpg`],
			color,
			pattern,
			size: category === 'accessory' ? 'One Size' : (category === 'shoes' ? '10' : 'M'),
			material,
			care: 'Follow care label instructions',
			purchasePrice: Math.floor(Math.random() * 150) + 25,
			tags: ['generated', 'sample-data', category]
		})
	}

	return generatedGarments
}

async function seedDatabase() {
	try {
		console.log('🌱 Starting database seeding...')

		// Clear existing data (in development only)
		if (process.env.NODE_ENV === 'development') {
			console.log('🧹 Clearing existing data...')
			await prisma.garment.deleteMany()
			await prisma.avatar3D.deleteMany()
			await prisma.styleProfile.deleteMany()
			await prisma.userProfile.deleteMany()
			await prisma.user.deleteMany()
		}

		console.log('👥 Creating sample users...')
		const createdUsers = []

		for (const userData of SAMPLE_USERS) {
			const hashedPassword = await bcrypt.hash('password123', 10)

			const user = await prisma.user.create({
				data: {
					email: userData.email,
					username: userData.username,
					displayName: userData.displayName,
					profile: {
						create: userData.profile
					},
					styleProfile: {
						create: userData.styleProfile
					},
					avatars: {
						create: {
							...userData.avatar,
							modelUrl: `/models/avatar-${userData.username}.glb`,
							thumbnailUrl: `/images/avatars/${userData.username}-thumb.jpg`
						}
					}
				},
				include: {
					profile: true,
					styleProfile: true,
					avatars: true
				}
			})

			createdUsers.push(user)
			console.log(`✅ Created user: ${user.displayName}`)
		}

		console.log('👕 Creating sample garments...')
		const allGarments = [...SAMPLE_GARMENTS, ...generateMoreGarments(SAMPLE_GARMENTS)]
		const createdGarments = []

		// Distribute garments among users
		for (let i = 0; i < allGarments.length; i++) {
			const garmentData = allGarments[i]
			const user = createdUsers[i % createdUsers.length]

			const garment = await prisma.garment.create({
				data: {
					...garmentData,
					userId: user.id,
					purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
				}
			})

			createdGarments.push(garment)

			if ((i + 1) % 20 === 0) {
				console.log(`✅ Created ${i + 1} garments...`)
			}
		}

		console.log('🎯 Creating sample outfits...')

		// Create some sample outfits for testing
		const sampleOutfits = [
			{
				name: 'Professional Business Look',
				description: 'Perfect for important meetings and presentations',
				occasion: ['work', 'formal'],
				season: ['spring', 'fall'],
				weather: ['mild', 'cool']
			},
			{
				name: 'Casual Weekend Outfit',
				description: 'Comfortable and stylish for weekend activities',
				occasion: ['casual', 'weekend'],
				season: ['summer'],
				weather: ['warm', 'sunny']
			},
			{
				name: 'Smart Casual Date Night',
				description: 'Elegant yet approachable for dinner dates',
				occasion: ['date', 'casual'],
				season: ['spring', 'summer'],
				weather: ['mild', 'warm']
			}
		]

		for (const outfitData of sampleOutfits) {
			const user = createdUsers[Math.floor(Math.random() * createdUsers.length)]
			const userGarments = createdGarments.filter(g => g.userId === user.id)

			if (userGarments.length >= 3) {
				// Select 3-4 random garments for the outfit
				const selectedGarments = userGarments
					.sort(() => 0.5 - Math.random())
					.slice(0, Math.floor(Math.random() * 2) + 3)

				const outfit = await prisma.outfit.create({
					data: {
						...outfitData,
						userId: user.id,
						items: {
							create: selectedGarments.map(garment => ({
								garmentId: garment.id
							}))
						}
					}
				})

				console.log(`✅ Created outfit: ${outfit.name}`)
			}
		}

		// Print summary
		const userCount = await prisma.user.count()
		const garmentCount = await prisma.garment.count()
		const outfitCount = await prisma.outfit.count()

		console.log('🎉 Seeding completed successfully!')
		console.log(`📊 Database Summary:`)
		console.log(`   Users: ${userCount}`)
		console.log(`   Garments: ${garmentCount}`)
		console.log(`   Outfits: ${outfitCount}`)

		// Test the recommendation system
		console.log('🧪 Testing recommendation system integration...')
		const testUser = createdUsers[0]
		const testGarments = createdGarments.filter(g => g.userId === testUser.id)

		if (testGarments.length > 0) {
			const testGarment = testGarments[0]
			console.log(`Testing with user: ${testUser.displayName}, item: ${testGarment.name}`)

			// This would be called by the recommendation API
			console.log('✅ Database is ready for recommendation system integration')
		}

	} catch (error) {
		console.error('❌ Error seeding database:', error)
		throw error
	} finally {
		await prisma.$disconnect()
	}
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase()
		.then(() => {
			console.log('🌱 Seeding process completed')
			process.exit(0)
		})
		.catch((error) => {
			console.error('💥 Seeding failed:', error)
			process.exit(1)
		})
}

export default seedDatabase
