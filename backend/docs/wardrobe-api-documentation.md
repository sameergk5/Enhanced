# Wardrobe API Documentation
**Task 3.2 Implementation - Image Upload and Storage API**

## Overview

This document describes the backend API endpoints for uploading and managing garment images in the Virtual Wardrobe system. The implementation provides secure image upload, automatic processing, and database integration.

## Base URL
```
http://localhost:3001/api/wardrobe
```

## Authentication

All endpoints require JWT authentication via the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Upload Garment Image

**POST** `/items`

Upload a garment image and create a new garment record.

#### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

#### Form Data Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (JPEG, PNG, WebP, max 10MB) |
| `name` | String | No | Garment name (default: "New Item {date}") |
| `category` | String | No | Category: top, bottom, dress, shoes, accessory, outerwear |
| `primaryColor` | String | No | Primary color name (default: "unknown") |
| `colors` | Array/String | No | Array of color names or comma-separated string |
| `brand` | String | No | Brand name (max 50 chars) |
| `description` | String | No | Description (max 500 chars) |
| `tags` | Array/String | No | Array of tags or comma-separated string |

#### Example Request
```bash
curl -X POST http://localhost:3001/api/wardrobe/items \
  -H "Authorization: Bearer your-jwt-token" \
  -F "image=@/path/to/shirt.jpg" \
  -F "name=Blue T-Shirt" \
  -F "category=top" \
  -F "primaryColor=blue" \
  -F "colors=blue,white" \
  -F "brand=Nike" \
  -F "description=Comfortable cotton t-shirt" \
  -F "tags=casual,summer"
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Garment uploaded successfully",
  "garment": {
    "id": "uuid-string",
    "name": "Blue T-Shirt",
    "category": "top",
    "imageUrl": "/uploads/garments/processed-image.webp",
    "thumbnailUrl": "/uploads/garments/thumbnails/thumb.webp",
    "primaryColor": "blue",
    "colors": ["blue", "white"],
    "tags": ["casual", "summer", "top"],
    "createdAt": "2025-09-07T17:00:00.000Z"
  },
  "processing": {
    "imageProcessed": true,
    "thumbnailGenerated": true,
    "aiAnalysisPending": true
  }
}
```

#### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "category",
      "message": "Invalid value",
      "value": "invalid-category"
    }
  ]
}
```

**400 Bad Request** - No Image
```json
{
  "error": "No image file provided",
  "details": "Please upload an image file (JPEG, PNG, or WebP)"
}
```

**401 Unauthorized**
```json
{
  "error": "Access token required"
}
```

**413 Payload Too Large**
```json
{
  "error": "File too large",
  "details": "Maximum file size is 10MB"
}
```

### 2. Get Garment by ID

**GET** `/items/:id`

Retrieve a specific garment by ID.

#### Example Request
```bash
curl -X GET http://localhost:3001/api/wardrobe/items/uuid-string \
  -H "Authorization: Bearer your-jwt-token"
```

#### Success Response (200)
```json
{
  "garment": {
    "id": "uuid-string",
    "userId": "user-uuid",
    "name": "Blue T-Shirt",
    "description": "Comfortable cotton t-shirt",
    "category": "top",
    "brand": "Nike",
    "images": ["/uploads/garments/processed-image.webp"],
    "color": "blue",
    "tags": ["casual", "summer", "top"],
    "wearCount": 3,
    "lastWorn": "2025-09-05T10:00:00.000Z",
    "createdAt": "2025-09-07T17:00:00.000Z",
    "updatedAt": "2025-09-07T17:00:00.000Z",
    "_count": {
      "outfitItems": 2
    }
  }
}
```

### 3. Update Garment Metadata

**PATCH** `/items/:id`

Update garment information.

#### Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Updated Shirt Name",
  "description": "Updated description",
  "category": "top",
  "primaryColor": "red",
  "colors": ["red", "white"],
  "brand": "Adidas",
  "tags": ["casual", "updated"]
}
```

#### Success Response (200)
```json
{
  "message": "Garment updated successfully",
  "garment": {
    "id": "uuid-string",
    "name": "Updated Shirt Name",
    // ... other updated fields
    "updatedAt": "2025-09-07T17:30:00.000Z"
  }
}
```

### 4. Delete Garment

**DELETE** `/items/:id`

Delete a garment and its associated images.

#### Example Request
```bash
curl -X DELETE http://localhost:3001/api/wardrobe/items/uuid-string \
  -H "Authorization: Bearer your-jwt-token"
```

#### Success Response (200)
```json
{
  "message": "Garment deleted successfully"
}
```

### 5. Get User's Garments

**GET** `/garments`

Retrieve user's garment collection with filtering and pagination.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | String | Filter by category |
| `search` | String | Search in name, brand, or tags |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 20, max: 100) |

#### Example Request
```bash
curl -X GET "http://localhost:3001/api/wardrobe/garments?category=top&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

#### Success Response (200)
```json
{
  "garments": [
    {
      "id": "uuid-1",
      "name": "Blue T-Shirt",
      "category": "top",
      "color": "blue",
      "images": ["/uploads/garments/image1.webp"],
      "wearCount": 3,
      "createdAt": "2025-09-07T17:00:00.000Z",
      "_count": {
        "outfitItems": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Image Processing

### Automatic Processing

When an image is uploaded, the system automatically:

1. **Validates** file type and size
2. **Converts** to WebP format for optimal compression
3. **Resizes** to maximum 1024x1024 pixels
4. **Generates** thumbnail (200x200 pixels)
5. **Stores** processed images in organized directory structure

### File Storage Structure

```
uploads/
├── garments/
│   ├── uuid-timestamp.webp          # Processed main image
│   └── thumbnails/
│       └── uuid-timestamp-thumb.webp # Thumbnail
```

### URL Access

Uploaded images are accessible via static URLs:
```
http://localhost:3001/uploads/garments/uuid-timestamp.webp
http://localhost:3001/uploads/garments/thumbnails/uuid-timestamp-thumb.webp
```

## Database Schema

### Garment Model

```sql
CREATE TABLE garments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  brand VARCHAR(50),
  images TEXT[] NOT NULL,
  color VARCHAR(50) NOT NULL,
  pattern VARCHAR(50),
  size VARCHAR(20),
  material VARCHAR(100),
  care TEXT,
  purchase_price DECIMAL(10,2),
  purchase_date TIMESTAMP,
  retail_url TEXT,
  model_3d_url TEXT,
  ar_metadata JSONB,
  wear_count INTEGER DEFAULT 0,
  last_worn TIMESTAMP,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check request parameters and file format |
| 401 | Unauthorized | Provide valid JWT token |
| 404 | Not Found | Check garment ID exists and belongs to user |
| 413 | Payload Too Large | Reduce file size (max 10MB) |
| 415 | Unsupported Media Type | Use JPEG, PNG, or WebP images |
| 500 | Internal Server Error | Check server logs |

### File Validation Rules

- **Allowed formats**: JPEG, PNG, WebP
- **Maximum size**: 10MB
- **Minimum dimensions**: 200x200 pixels
- **Maximum files**: 1 per upload (currently)

## Integration Points

### Task 3.3 (AI Service) Integration

The API is prepared for AI metadata extraction:

```javascript
// Webhook endpoint for AI processing completion
POST /api/wardrobe/items/:id/ai-metadata
{
  "category": "t-shirt",
  "colors": ["blue", "navy"],
  "style": ["casual", "graphic"],
  "pattern": "solid",
  "confidence": 0.95
}
```

### Task 3.4 (Frontend) Integration

Frontend can use FormData for uploads:

```javascript
const formData = new FormData()
formData.append('image', imageFile)
formData.append('name', garmentName)
formData.append('category', selectedCategory)

const response = await fetch('/api/wardrobe/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

## Security Features

### Authentication
- JWT token validation on all endpoints
- User ownership verification for garment access

### File Security
- File type validation with whitelist
- File size limits to prevent abuse
- Unique filenames to prevent conflicts
- Secure file storage outside web root

### Input Validation
- Request parameter validation with express-validator
- SQL injection prevention via Prisma ORM
- XSS prevention through input sanitization

## Performance Considerations

### Optimizations Implemented
- **Image compression**: Automatic WebP conversion
- **Thumbnail generation**: Quick preview loading
- **Lazy loading ready**: Structured for frontend optimization
- **Database indexing**: User ID and category indexes
- **Pagination**: Prevents large data transfers

### Monitoring
- Request logging with Winston
- Error tracking and reporting
- File operation logging
- Database query monitoring

## Testing

### Test Coverage

The API includes comprehensive tests for:
- ✅ Valid image uploads with authentication
- ✅ Invalid file type rejection
- ✅ File size limit enforcement
- ✅ Authentication requirement
- ✅ Metadata validation
- ✅ CRUD operations
- ✅ Error handling scenarios

### Running Tests

```bash
# Run the test suite
node test_wardrobe_upload_api.js

# Set environment variables for testing
export API_BASE_URL=http://localhost:3001
export TEST_AUTH_TOKEN=your-test-jwt-token
```

---

## Task 3.2 Completion Status: ✅ IMPLEMENTED

**Implementation Summary:**
- ✅ Secure image upload endpoint with authentication
- ✅ File validation and processing (resize, compress, thumbnail)
- ✅ Database integration with proper data modeling
- ✅ Error handling and validation
- ✅ Static file serving for uploaded images
- ✅ CRUD operations for garment management
- ✅ Comprehensive test suite
- ✅ API documentation and integration guides

**Ready for Integration:**
- Task 3.3: AI Service for metadata extraction
- Task 3.4: Frontend implementation
- Task 3.5: Complete end-to-end integration
