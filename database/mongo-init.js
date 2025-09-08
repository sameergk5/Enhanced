// MongoDB initialization script for WardrobeAI
// This script sets up collections and indexes for unstructured data

print('🍃 Initializing MongoDB for WardrobeAI...');

// Switch to the wardrobe_ai_metadata database
db = db.getSiblingDB('wardrobe_ai_metadata');

// Create collections for avatar metadata
print('📦 Creating avatar_metadata collection...');
db.createCollection('avatar_metadata', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['userId', 'avatarId', 'createdAt'],
			properties: {
				userId: { bsonType: 'string' },
				avatarId: { bsonType: 'string' },
				hunyuanMetadata: {
					bsonType: 'object',
					properties: {
						modelId: { bsonType: 'string' },
						processingTime: { bsonType: 'number' },
						confidence: { bsonType: 'number' },
						meshQuality: { bsonType: 'string' }
					}
				},
				faceFeatures: {
					bsonType: 'object',
					properties: {
						landmarks: { bsonType: 'array' },
						emotions: { bsonType: 'object' },
						skinTone: { bsonType: 'string' },
						faceShape: { bsonType: 'string' }
					}
				},
				processingLogs: { bsonType: 'array' },
				createdAt: { bsonType: 'date' },
				updatedAt: { bsonType: 'date' }
			}
		}
	}
});

// Create collection for garment analysis metadata
print('👕 Creating garment_analysis collection...');
db.createCollection('garment_analysis', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['userId', 'garmentId', 'analysisType', 'createdAt'],
			properties: {
				userId: { bsonType: 'string' },
				garmentId: { bsonType: 'string' },
				analysisType: {
					bsonType: 'string',
					enum: ['color_extraction', 'style_classification', 'pattern_recognition', 'brand_detection']
				},
				confidence: { bsonType: 'number' },
				results: { bsonType: 'object' },
				processingTime: { bsonType: 'number' },
				createdAt: { bsonType: 'date' }
			}
		}
	}
});

// Create collection for user analytics
print('📊 Creating user_analytics collection...');
db.createCollection('user_analytics', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['userId', 'eventType', 'timestamp'],
			properties: {
				userId: { bsonType: 'string' },
				eventType: {
					bsonType: 'string',
					enum: ['login', 'avatar_create', 'garment_upload', 'outfit_try', 'share_look', 'ai_recommendation']
				},
				sessionId: { bsonType: 'string' },
				metadata: { bsonType: 'object' },
				timestamp: { bsonType: 'date' }
			}
		}
	}
});

// Create collection for AI model metadata
print('🤖 Creating ai_model_metadata collection...');
db.createCollection('ai_model_metadata', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['modelName', 'version', 'createdAt'],
			properties: {
				modelName: { bsonType: 'string' },
				version: { bsonType: 'string' },
				capabilities: { bsonType: 'array' },
				performance: { bsonType: 'object' },
				trainingData: { bsonType: 'object' },
				createdAt: { bsonType: 'date' }
			}
		}
	}
});

// Create indexes for better performance
print('🚀 Creating indexes...');

// Avatar metadata indexes
db.avatar_metadata.createIndex({ userId: 1, avatarId: 1 }, { unique: true });
db.avatar_metadata.createIndex({ createdAt: -1 });
db.avatar_metadata.createIndex({ 'hunyuanMetadata.modelId': 1 });

// Garment analysis indexes
db.garment_analysis.createIndex({ userId: 1, garmentId: 1, analysisType: 1 });
db.garment_analysis.createIndex({ analysisType: 1, createdAt: -1 });
db.garment_analysis.createIndex({ confidence: -1 });

// User analytics indexes
db.user_analytics.createIndex({ userId: 1, timestamp: -1 });
db.user_analytics.createIndex({ eventType: 1, timestamp: -1 });
db.user_analytics.createIndex({ sessionId: 1 });

// AI model metadata indexes
db.ai_model_metadata.createIndex({ modelName: 1, version: 1 }, { unique: true });
db.ai_model_metadata.createIndex({ createdAt: -1 });

// Insert sample AI model metadata
print('🧠 Inserting sample AI model configurations...');
db.ai_model_metadata.insertMany([
	{
		modelName: 'hunyuan3d',
		version: '1.0',
		capabilities: ['3d_avatar_generation', 'face_reconstruction'],
		performance: {
			averageProcessingTime: 30000,
			accuracyScore: 0.89,
			resourceUsage: 'high'
		},
		trainingData: {
			imageCount: 100000,
			ethnicDiversity: 'high',
			ageRange: '18-65'
		},
		createdAt: new Date()
	},
	{
		modelName: 'garment_classifier',
		version: '2.1',
		capabilities: ['category_detection', 'color_extraction', 'style_classification'],
		performance: {
			averageProcessingTime: 2000,
			accuracyScore: 0.94,
			resourceUsage: 'medium'
		},
		trainingData: {
			imageCount: 500000,
			categoryCount: 50,
			brandCount: 200
		},
		createdAt: new Date()
	}
]);

print('✅ MongoDB initialization completed successfully!');
print('📚 Collections created: avatar_metadata, garment_analysis, user_analytics, ai_model_metadata');
print('🔍 Indexes created for optimal query performance');
print('🎯 Ready for unstructured data storage!');
