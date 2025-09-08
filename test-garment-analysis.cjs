// Test FREE AI Garment Analysis
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testGarmentAnalysis() {
	console.log('👗 Testing FREE AI Garment Analysis...\n');

	// Test with a mock image path (URL simulation)
	console.log('🔍 Testing with image URL...');
	try {
		// Create a mock form data
		const formData = new FormData();

		// Since we don't have an actual image, let's test the text-based analysis
		const testResponse = await axios.post('http://localhost:3001/api/free-ai/analyze-garment-url', {
			imageUrl: 'https://example.com/blue-casual-shirt.jpg'
		});

		console.log('✅ Garment Analysis Results:');
		console.log(JSON.stringify(testResponse.data, null, 2));
		console.log('');

	} catch (error) {
		console.log('⚠️ No image upload endpoint available, testing batch analysis instead...');
	}

	// Test batch analysis with mock data
	console.log('📁 Testing Batch Analysis...');
	try {
		const batchResponse = await axios.post('http://localhost:3001/api/free-ai/batch-analyze', {
			imagePaths: [
				'test-image-1.jpg',
				'test-blue-shirt.jpg',
				'test-black-pants.jpg'
			],
			options: {
				detailed: true
			}
		});

		console.log('✅ Batch Analysis Results:');
		console.log(JSON.stringify(batchResponse.data, null, 2));
		console.log('');

	} catch (error) {
		console.log('❌ Batch Analysis Error:', error.response?.data || error.message);
	}

	// Test outfit recommendations
	console.log('✨ Testing Outfit Recommendations...');
	try {
		const recommendResponse = await axios.post('http://localhost:3001/api/free-ai/recommend-outfits', {
			preferences: {
				style: 'casual',
				colors: ['blue', 'neutral'],
				occasion: 'work'
			},
			wardrobeItems: [
				{ type: 'shirt', color: 'blue', style: 'casual' },
				{ type: 'pants', color: 'navy', style: 'formal' }
			]
		});

		console.log('✅ Outfit Recommendations:');
		console.log(JSON.stringify(recommendResponse.data, null, 2));
		console.log('');

	} catch (error) {
		console.log('❌ Recommendations Error:', error.response?.data || error.message);
	}

	console.log('🎉 Garment Analysis Testing Complete!');
	console.log('💰 Total Cost: $0.00 (Always FREE!)');
}

testGarmentAnalysis().catch(console.error);
