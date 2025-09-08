// Test database connections
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import Redis from 'redis';

dotenv.config();

const prisma = new PrismaClient();
const redis = Redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const mongoClient = new MongoClient(process.env.MONGODB_URL || 'mongodb://wardrobe:wardrobe123@localhost:27017/wardrobe_ai_metadata');

async function testConnections() {
	console.log('🔗 Testing all database connections...\n');

	try {
		// Test PostgreSQL connection
		console.log('1. Testing PostgreSQL connection...');
		const userCount = await prisma.user.count();
		console.log(`✅ PostgreSQL connected successfully! Current user count: ${userCount}`);

		// Test basic CRUD operations on PostgreSQL
		console.log('\n2. Testing PostgreSQL CRUD operations...');

		// Create a test user
		const testUser = await prisma.user.create({
			data: {
				email: 'test@wardrobeai.com',
				username: 'testuser',
				displayName: 'Test User',
				bio: 'Test user for database validation'
			}
		});
		console.log(`✅ Created test user: ${testUser.username} (ID: ${testUser.id})`);

		// Read the test user
		const foundUser = await prisma.user.findUnique({
			where: { email: 'test@wardrobeai.com' }
		});
		console.log(`✅ Found test user: ${foundUser.displayName}`);

		// Update the test user
		const updatedUser = await prisma.user.update({
			where: { id: testUser.id },
			data: { bio: 'Updated test user for database validation' }
		});
		console.log(`✅ Updated test user bio: ${updatedUser.bio}`);

		// Delete the test user
		await prisma.user.delete({
			where: { id: testUser.id }
		});
		console.log(`✅ Deleted test user successfully`);

		// Test Redis connection
		console.log('\n3. Testing Redis connection...');
		await redis.connect();
		await redis.set('test_key', 'Hello from WardrobeAI!');
		const value = await redis.get('test_key');
		console.log(`✅ Redis connected successfully! Test value: ${value}`);
		await redis.del('test_key');
		await redis.disconnect();

		// Test MongoDB connection
		console.log('\n4. Testing MongoDB connection...');
		await mongoClient.connect();
		const db = mongoClient.db('wardrobe_ai_metadata');

		// Test avatar metadata collection
		const avatarCollection = db.collection('avatar_metadata');
		await avatarCollection.insertOne({
			userId: 'test-user-123',
			avatarId: 'test-avatar-456',
			hunyuanMetadata: {
				modelId: 'test-model',
				processingTime: 25000,
				confidence: 0.95,
				meshQuality: 'high'
			},
			createdAt: new Date(),
			updatedAt: new Date()
		});
		console.log(`✅ MongoDB connected successfully! Inserted test avatar metadata`);

		// Verify the insertion
		const count = await avatarCollection.countDocuments();
		console.log(`✅ Avatar metadata collection count: ${count}`);

		// Clean up test data
		await avatarCollection.deleteOne({ userId: 'test-user-123' });
		console.log(`✅ Cleaned up test data from MongoDB`);

		// Test analytics collection
		const analyticsCollection = db.collection('user_analytics');
		await analyticsCollection.insertOne({
			userId: 'test-user-123',
			eventType: 'avatar_create',
			sessionId: 'test-session-789',
			metadata: { testRun: true },
			timestamp: new Date()
		});
		console.log(`✅ User analytics collection working correctly`);
		await analyticsCollection.deleteOne({ userId: 'test-user-123' });

		await mongoClient.close();

		console.log('\n🎉 All database connections successful!');
		console.log('📊 Database infrastructure is fully ready for WardrobeAI');
		console.log('✨ PostgreSQL: Structured user data ✓');
		console.log('✨ MongoDB: Unstructured metadata ✓');
		console.log('✨ Redis: Caching layer ✓');

	} catch (error) {
		console.error('❌ Database connection failed:', error.message);
		console.error('Stack trace:', error.stack);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
		if (redis.isOpen) await redis.disconnect();
		if (mongoClient) await mongoClient.close();
	}
}

testConnections();
