// Database configuration and connection management for WardrobeAI
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import Redis from 'redis';

dotenv.config();

// PostgreSQL (Primary Database) - Prisma Client
export const prisma = new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
	errorFormat: 'colorless'
});

// Redis (Caching Layer)
export const redis = Redis.createClient({
	url: process.env.REDIS_URL || 'redis://localhost:6379',
	retry_strategy: (options) => {
		if (options.error && options.error.code === 'ECONNREFUSED') {
			return new Error('The server refused the connection');
		}
		if (options.total_retry_time > 1000 * 60 * 60) {
			return new Error('Retry time exhausted');
		}
		if (options.attempt > 10) {
			return undefined;
		}
		return Math.min(options.attempt * 100, 3000);
	}
});

// MongoDB (Unstructured Data)
export const mongoClient = new MongoClient(
	process.env.MONGODB_URL || 'mongodb://localhost:27017/wardrobe_ai_metadata',
	{
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	}
);

// Database connection management
export class DatabaseManager {
	static async connect() {
		try {
			console.log('🔗 Connecting to databases...');

			// Test PostgreSQL connection
			await prisma.$connect();
			console.log('✅ PostgreSQL connected');

			// Connect to Redis
			if (!redis.isOpen) {
				await redis.connect();
				console.log('✅ Redis connected');
			}

			// Connect to MongoDB
			await mongoClient.connect();
			console.log('✅ MongoDB connected');

			console.log('🎉 All databases connected successfully!');
			return true;
		} catch (error) {
			console.error('❌ Database connection failed:', error.message);
			throw error;
		}
	}

	static async disconnect() {
		try {
			console.log('🔌 Disconnecting from databases...');

			await prisma.$disconnect();
			console.log('✅ PostgreSQL disconnected');

			if (redis.isOpen) {
				await redis.disconnect();
				console.log('✅ Redis disconnected');
			}

			await mongoClient.close();
			console.log('✅ MongoDB disconnected');

			console.log('👋 All database connections closed');
		} catch (error) {
			console.error('❌ Error during disconnection:', error.message);
		}
	}

	static async healthCheck() {
		const health = {
			postgresql: false,
			redis: false,
			mongodb: false,
			timestamp: new Date().toISOString()
		};

		try {
			// Check PostgreSQL
			await prisma.$queryRaw`SELECT 1`;
			health.postgresql = true;
		} catch (error) {
			console.error('PostgreSQL health check failed:', error.message);
		}

		try {
			// Check Redis
			await redis.ping();
			health.redis = true;
		} catch (error) {
			console.error('Redis health check failed:', error.message);
		}

		try {
			// Check MongoDB
			await mongoClient.db().admin().ping();
			health.mongodb = true;
		} catch (error) {
			console.error('MongoDB health check failed:', error.message);
		}

		return health;
	}
}

// MongoDB collections helpers
export const mongodb = {
	get avatarMetadata() {
		return mongoClient.db('wardrobe_ai_metadata').collection('avatar_metadata');
	},

	get garmentAnalysis() {
		return mongoClient.db('wardrobe_ai_metadata').collection('garment_analysis');
	},

	get userAnalytics() {
		return mongoClient.db('wardrobe_ai_metadata').collection('user_analytics');
	},

	get aiModelMetadata() {
		return mongoClient.db('wardrobe_ai_metadata').collection('ai_model_metadata');
	}
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
	console.log('\n🛑 Received SIGINT, gracefully shutting down...');
	await DatabaseManager.disconnect();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	console.log('\n🛑 Received SIGTERM, gracefully shutting down...');
	await DatabaseManager.disconnect();
	process.exit(0);
});

export default {
	prisma,
	redis,
	mongoClient,
	mongodb,
	DatabaseManager
};
