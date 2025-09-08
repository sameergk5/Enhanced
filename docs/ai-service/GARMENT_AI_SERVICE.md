# Garment AI Service Documentation (Task 3.3)

## Overview
The Garment AI Service provides automated metadata extraction for uploaded clothing items using computer vision models. It integrates with the upload workflow to automatically categorize, tag, and analyze garment properties.

## Features

### 🎯 Core Capabilities
- **Automatic Categorization**: Classifies garments into main categories (top, bottom, dress, shoes, accessory, outerwear)
- **Color Detection**: Identifies primary and secondary colors in garments
- **Style Analysis**: Extracts style tags (casual, formal, vintage, etc.)
- **Material Recognition**: Identifies fabric types when discernible
- **Pattern Detection**: Recognizes patterns (solid, striped, floral, etc.)
- **Season/Occasion Tagging**: Suggests appropriate seasons and occasions

### 🔧 Technical Features
- **Multi-Provider Support**: OpenAI GPT-4 Vision and Anthropic Claude integration
- **Development Mode**: Enhanced mock data for testing without API keys
- **Background Processing**: Non-blocking AI analysis during upload
- **Error Resilience**: Graceful fallback to ensure uploads never fail due to AI issues
- **Batch Processing**: Support for analyzing multiple garments at once

## API Integration

### Upload Flow Integration
The AI service is automatically triggered during garment upload:

```javascript
// POST /api/wardrobe/items
// After successful image upload and garment creation
processGarmentAI(garment.id, processedImagePath, imageUrl)
  .then(result => {
    if (result.success) {
      console.log(`AI analysis completed for garment ${garment.id}`)
    }
  })
```

### New API Endpoints

#### Check AI Analysis Status
```http
GET /api/wardrobe/items/:id/ai-status
```

Response:
```json
{
  "garmentId": "garment-id",
  "aiAnalysisComplete": true,
  "hasError": false,
  "analysis": {
    "category": "top",
    "subcategory": "t-shirt",
    "color": "blue",
    "pattern": "solid",
    "material": "cotton",
    "tags": ["casual", "everyday", "spring", "summer"],
    "confidence": 0.87,
    "analyzedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Trigger Re-analysis
```http
POST /api/wardrobe/items/:id/reanalyze
```

#### Direct Garment Analysis
```http
POST /api/ai/analyze-garment
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "imagePath": "/path/to/local/image.jpg"
}
```

#### Batch Processing
```http
POST /api/ai/batch-analyze
Content-Type: application/json

{
  "garmentIds": ["id1", "id2", "id3"]
}
```

## Service Architecture

### Core Service (`garmentAI.js`)

#### Main Functions

**`analyzeGarmentMetadata(imagePath, publicUrl)`**
- Performs AI analysis on garment image
- Returns structured metadata object
- Fallback to mock data in development mode

**`processGarmentAI(garmentId, imagePath, publicUrl)`**
- Full processing pipeline for a garment
- Updates database with AI results
- Handles errors gracefully

**`batchProcessGarments(garmentIds)`**
- Process multiple garments efficiently
- Rate limiting and error handling
- Returns results for all processed items

### AI Analysis Output

```javascript
{
  category: "top",              // Main category
  subcategory: "t-shirt",       // Specific type
  primaryColor: "blue",         // Dominant color
  colors: ["blue", "white"],    // All colors
  pattern: "solid",             // Pattern type
  styleTags: ["casual", "everyday"], // Style characteristics
  material: "cotton",           // Fabric type
  season: ["spring", "summer"], // Suitable seasons
  occasion: ["everyday", "casual"], // Suitable occasions
  confidence: 0.87              // Analysis confidence (0.0-1.0)
}
```

## Database Integration

### Metadata Storage
AI analysis results are stored in the garment record:

```javascript
// Prisma schema updates
{
  category: String,        // Updated from AI
  subcategory: String?,    // New field from AI
  color: String,          // Updated from AI
  pattern: String?,       // New field from AI
  material: String?,      // New field from AI
  tags: String[],         // Enhanced with AI tags
  arMetadata: Json        // Full AI analysis data
}
```

### Error Handling
Failed AI analysis is recorded but doesn't block garment creation:

```javascript
arMetadata: {
  aiAnalysis: {
    error: "Analysis failed",
    failedAt: "2024-01-15T10:30:00Z",
    version: "1.0"
  }
}
```

## Development Mode

### Mock Data Generation
Enhanced mock responses based on filename patterns:
- `shirt.jpg` → t-shirt analysis
- `jeans.jpg` → jeans analysis
- `dress.jpg` → dress analysis
- etc.

### Configuration
Set environment variables:
```bash
NODE_ENV=development
OPENAI_API_KEY=dev-mode
CLAUDE_API_KEY=dev-mode
```

## Production Setup

### Required Environment Variables
```bash
OPENAI_API_KEY=your-openai-key
CLAUDE_API_KEY=your-claude-key  # Optional
NODE_ENV=production
```

### AI Provider Configuration
- **Primary**: OpenAI GPT-4 Vision API
- **Fallback**: Anthropic Claude (when available)
- **Development**: Enhanced mock responses

## Testing

### Test Suite
Run the test suite:
```bash
node backend/test/test_garment_ai.js
```

### Test Coverage
- ✅ Basic metadata analysis
- ✅ Different garment types
- ✅ Error handling and fallbacks
- ✅ Development mode features
- ✅ Mock data generation

## Performance Considerations

### Background Processing
- AI analysis runs asynchronously after upload
- Upload response is immediate
- Frontend can poll status endpoint for completion

### Rate Limiting
- 500ms delay between batch items
- Maximum 20 items per batch request
- Graceful handling of API limits

### Caching
- Analysis results cached in database
- Re-analysis only on explicit request
- Confidence scores help identify low-quality analyses

## Error Recovery

### Fallback Strategy
1. Try OpenAI Vision API
2. Fall back to Anthropic Claude (if available)
3. Generate enhanced mock data
4. Record error but allow garment creation

### Monitoring
- All analysis attempts logged
- Error rates tracked
- Confidence scores monitored

## Future Enhancements

### Planned Features
- **Style Similarity**: Find similar items in wardrobe
- **Trend Analysis**: Identify fashion trends in collection
- **Outfit Suggestions**: AI-powered outfit recommendations
- **Quality Assessment**: Analyze garment condition and quality
- **Brand Recognition**: Identify clothing brands from images

### API Extensions
- Real-time analysis streaming
- Webhook notifications for completion
- Analytics dashboard for AI performance
- Custom model training for better accuracy

## Integration with Frontend (Task 3.4)

The AI service provides real-time metadata that enhances the user experience:

### Upload Flow
1. User uploads image
2. Backend processes and stores image
3. AI analysis starts in background
4. User receives immediate upload confirmation
5. Frontend polls for AI completion
6. UI updates with extracted metadata

### Enhanced Features
- **Smart Tagging**: Auto-populated tags from AI
- **Category Suggestions**: Intelligent category detection
- **Color Palette**: Visual color representation
- **Style Insights**: Personalized style analysis

---

**Status**: ✅ COMPLETED - Task 3.3 Implementation
**Next**: Task 3.4 - Frontend Development of Wardrobe Gallery
