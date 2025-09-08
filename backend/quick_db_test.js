import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickDbTest() {
	try {
		console.log('Testing database connection...')

		const userCount = await prisma.user.count()
		console.log(`Users in database: ${userCount}`)

		const garmentCount = await prisma.garment.count()
		console.log(`Garments in database: ${garmentCount}`)

		if (userCount === 0) {
			console.log('Database is empty. Need to run seeding.')
		} else {
			console.log('Database has data!')
		}

	} catch (error) {
		console.error('Database connection failed:', error.message)
	} finally {
		await prisma.$disconnect()
	}
}

quickDbTest()
