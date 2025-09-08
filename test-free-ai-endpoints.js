// FREE AI Testing Script
const axios = require('axios');

async function testFreeAI() {
	console.log('🧪 Testing FREE AI Capabilities...\n');

	// Test 1: Text Analysis
	console.log('🔍 Testing Text Analysis...');
	try {
		const textResponse = await axios.post('http://localhost:3001/api/free-ai/analyze-preferences', {
			text: "I love wearing casual, comfortable clothes with blue and neutral colors for work and weekend activities"
		});

		console.log('✅ Text Analysis Results:');
		console.log(JSON.stringify(textResponse.data, null, 2));
		console.log(`Processing time: ${textResponse.data.processingTime}ms`);
		console.log(`Cost: $${textResponse.data.cost}`);
		console.log('');

	} catch (error) {
		console.log('❌ Text Analysis Error:', error.response?.data || error.message);
	}

	// Test 2: Check server health
	console.log('🏥 Testing Server Health...');
	try {
		const healthResponse = await axios.get('http://localhost:3001/health');
		console.log('✅ Server Health:', healthResponse.data);
		console.log('');
	} catch (error) {
		console.log('❌ Health Check Error:', error.message);
	}

	// Test 3: Demo statistics
	console.log('📊 Getting Demo Statistics...');
	try {
		const statsResponse = await axios.get('http://localhost:3001/api/free-ai/stats');
		console.log('✅ Demo Statistics:');
		console.log(JSON.stringify(statsResponse.data, null, 2));
		console.log('');
	} catch (error) {
		console.log('❌ Stats Error:', error.response?.data || error.message);
	}

	console.log('🎉 FREE AI Testing Complete!');
	console.log('💰 Total Cost: $0.00 (Always FREE!)');
}

testFreeAI().catch(console.error);
