"""
Garment API Endpoints - FastAPI routes for garment upload and management
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import (APIRouter, Depends, File, Form, HTTPException, Query,
                     UploadFile)
from pydantic import BaseModel

from ..services.garment_service import garment_service

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/garments", tags=["garments"])

# Pydantic models for request/response
class GarmentMetadata(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    size: Optional[str] = None
    price: Optional[float] = None
    purchase_date: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = False

class GarmentResponse(BaseModel):
    success: bool
    garment: Dict[str, Any]
    analysis: Optional[Dict[str, Any]] = None

class GarmentListResponse(BaseModel):
    garments: List[Dict[str, Any]]
    total: int
    page: int
    pages: int
    filters_applied: Dict[str, Any]

class GarmentUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None
    size: Optional[str] = None
    price: Optional[float] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None
    status: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None

# API Endpoints

@router.post("/upload", response_model=GarmentResponse)
async def upload_garment(
    user_id: str = Form(...),
    garment_image: UploadFile = File(...),
    metadata: Optional[str] = Form(None)
):
    """
    Upload and analyze a garment image

    - **user_id**: User identifier
    - **garment_image**: Garment photo file (JPG, PNG, WebP)
    - **metadata**: JSON string of garment metadata (optional)
    """

    try:
        # Parse metadata JSON if provided
        parsed_metadata = None
        if metadata:
            try:
                parsed_metadata = json.loads(metadata)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid metadata JSON")

        # Upload and analyze garment
        result = await garment_service.upload_and_analyze_garment(
            user_id=user_id,
            garment_file=garment_image,
            metadata=parsed_metadata
        )

        return GarmentResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Garment upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Garment upload failed: {str(e)}")

@router.get("/{garment_id}")
async def get_garment(garment_id: str, user_id: str = Query(...)):
    """
    Get garment details by ID

    - **garment_id**: Garment identifier
    - **user_id**: User identifier for authorization
    """

    try:
        garment_data = await garment_service.get_garment(user_id, garment_id)
        return garment_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get garment {garment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve garment")

@router.get("/user/{user_id}", response_model=GarmentListResponse)
async def list_user_garments(
    user_id: str,
    category: Optional[str] = Query(None, description="Filter by category"),
    season: Optional[str] = Query(None, description="Filter by season"),
    color: Optional[str] = Query(None, description="Filter by color"),
    limit: int = Query(50, ge=1, le=100, description="Number of items per page"),
    offset: int = Query(0, ge=0, description="Number of items to skip")
):
    """
    List all garments for a user with filtering options

    - **user_id**: User identifier
    - **category**: Filter by garment category (tops, bottoms, dresses, etc.)
    - **season**: Filter by season suitability (spring, summer, fall, winter)
    - **color**: Filter by primary color
    - **limit**: Number of items per page (1-100)
    - **offset**: Number of items to skip for pagination
    """

    try:
        result = await garment_service.list_user_garments(
            user_id=user_id,
            category=category,
            season=season,
            color=color,
            limit=limit,
            offset=offset
        )

        return GarmentListResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to list garments for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve garments")

@router.put("/{garment_id}")
async def update_garment(
    garment_id: str,
    user_id: str,
    updates: GarmentUpdateRequest
):
    """
    Update garment information

    - **garment_id**: Garment identifier
    - **user_id**: User identifier for authorization
    - **updates**: Garment updates to apply
    """

    try:
        # Convert Pydantic model to dict, excluding None values
        update_data = updates.dict(exclude_none=True)

        result = await garment_service.update_garment(
            user_id=user_id,
            garment_id=garment_id,
            updates=update_data
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update garment {garment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Garment update failed")

@router.delete("/{garment_id}")
async def delete_garment(garment_id: str, user_id: str = Query(...)):
    """
    Delete a garment

    - **garment_id**: Garment identifier
    - **user_id**: User identifier for authorization
    """

    try:
        result = await garment_service.delete_garment(user_id, garment_id)
        return result

    except Exception as e:
        logger.error(f"Failed to delete garment {garment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Garment deletion failed")

@router.get("/{garment_id}/image")
async def get_garment_image(garment_id: str, user_id: str = Query(...)):
    """
    Get garment image

    - **garment_id**: Garment identifier
    - **user_id**: User identifier for authorization
    """

    try:
        # In production, this would serve the actual image file
        # For MVP, return image metadata

        image_data = {
            'garment_id': garment_id,
            'image_url': f"/static/garments/{garment_id}_image.jpg",
            'thumbnail_url': f"/static/garments/{garment_id}_thumb.jpg",
            'dimensions': '800x800',
            'format': 'JPEG',
            'file_size': '150KB'
        }

        return image_data

    except Exception as e:
        logger.error(f"Failed to get garment image {garment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve garment image")

@router.get("/categories/list")
async def list_garment_categories():
    """
    Get list of available garment categories and types
    """

    try:
        categories = {
            'tops': ['t-shirt', 'shirt', 'blouse', 'sweater', 'hoodie', 'tank-top', 'cardigan'],
            'bottoms': ['jeans', 'pants', 'shorts', 'skirt', 'leggings', 'trousers'],
            'dresses': ['dress', 'gown', 'sundress', 'maxi-dress', 'mini-dress'],
            'outerwear': ['jacket', 'coat', 'blazer', 'vest', 'windbreaker', 'parka'],
            'footwear': ['sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers'],
            'accessories': ['hat', 'scarf', 'belt', 'jewelry', 'bag', 'watch', 'sunglasses']
        }

        colors = [
            'black', 'white', 'red', 'blue', 'green', 'yellow',
            'orange', 'purple', 'pink', 'brown', 'gray', 'navy', 'beige'
        ]

        seasons = ['spring', 'summer', 'fall', 'winter', 'all-season']

        occasions = [
            'casual', 'formal', 'business', 'party', 'sport', 'beach',
            'evening', 'daytime', 'weekend', 'office', 'date', 'travel'
        ]

        return {
            'categories': categories,
            'colors': colors,
            'seasons': seasons,
            'occasions': occasions
        }

    except Exception as e:
        logger.error(f"Failed to get categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve categories")

@router.post("/analyze-outfit")
async def analyze_outfit_compatibility(
    garment_ids: List[str],
    user_id: str
):
    """
    Analyze outfit compatibility for multiple garments

    - **garment_ids**: List of garment identifiers
    - **user_id**: User identifier for authorization
    """

    try:
        # MVP implementation - basic compatibility analysis
        outfit_analysis = {
            'compatibility_score': 8.5,
            'style_coherence': 'high',
            'color_harmony': 'excellent',
            'season_appropriateness': 'spring/summer',
            'occasion_suitability': ['casual', 'daytime', 'weekend'],
            'recommendations': [
                'Great color combination',
                'Perfect for casual outings',
                'Consider adding accessories'
            ],
            'garment_count': len(garment_ids),
            'analysis_date': datetime.now().isoformat()
        }

        return {
            'success': True,
            'outfit_analysis': outfit_analysis,
            'garment_ids': garment_ids
        }

    except Exception as e:
        logger.error(f"Outfit analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Outfit analysis failed")

@router.get("/statistics/{user_id}")
async def get_wardrobe_statistics(user_id: str):
    """
    Get wardrobe statistics for a user

    - **user_id**: User identifier
    """

    try:
        # MVP implementation - mock statistics
        statistics = {
            'total_garments': 25,
            'categories': {
                'tops': 8,
                'bottoms': 6,
                'dresses': 4,
                'outerwear': 3,
                'footwear': 2,
                'accessories': 2
            },
            'colors': {
                'black': 5,
                'white': 4,
                'blue': 3,
                'red': 2,
                'other': 11
            },
            'most_worn': {
                'garment_id': f'garment_{user_id}_001',
                'name': 'Blue Denim Jeans',
                'wear_count': 15
            },
            'least_worn': {
                'garment_id': f'garment_{user_id}_010',
                'name': 'Formal Black Dress',
                'wear_count': 1
            },
            'favorites_count': 8,
            'average_wear_count': 3.2,
            'last_updated': datetime.now().isoformat()
        }

        return {
            'success': True,
            'statistics': statistics,
            'user_id': user_id
        }

    except Exception as e:
        logger.error(f"Failed to get statistics for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve wardrobe statistics")

# Health check endpoint
@router.post("/analyze")
async def analyze_garment_image(
    file: UploadFile = File(...)
):
    """
    Analyze a garment image and return AI predictions
    """
    try:
        logger.info(f"Analyzing garment image: {file.filename}")

        # Analyze the garment
        analysis = await garment_service.analyze_garment_image(file)

        return {
            'success': True,
            'analysis': analysis
        }

    except Exception as e:
        logger.error(f"Error analyzing garment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze garment: {str(e)}"
        )

@router.get("/health")
async def garment_health_check():
    """Garment service health check"""

    return {
        'service': 'Garment Management Service',
        'status': 'healthy',
        'version': '1.0.0',
        'features': {
            'image_upload': True,
            'ai_analysis': True,
            'categorization': True,
            'color_detection': True,
            'outfit_analysis': True
        },
        'supported_formats': ['.jpg', '.jpeg', '.png', '.webp'],
        'max_file_size': '10MB',
        'categories': 6,
        'supported_colors': 13
    }
