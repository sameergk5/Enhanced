"""
Avatar API Endpoints - FastAPI routes for avatar creation and management
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from ..services.avatar_service import avatar_service

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/avatars", tags=["avatars"])

# Pydantic models for request/response
class AvatarMeasurements(BaseModel):
    height: Optional[float] = None
    weight: Optional[float] = None
    chest: Optional[float] = None
    waist: Optional[float] = None
    hips: Optional[float] = None
    shoulder_width: Optional[float] = None

class AvatarPreferences(BaseModel):
    build: Optional[str] = None
    skin_tone: Optional[str] = None
    hair_color: Optional[str] = None
    eye_color: Optional[str] = None
    style_preference: Optional[str] = None

class AvatarResponse(BaseModel):
    success: bool
    avatar_id: str
    avatar_url: str
    preview_url: str
    config: Dict[str, Any]
    created_at: str

class AvatarListResponse(BaseModel):
    avatars: List[Dict[str, Any]]
    total: int

class AvatarUpdateRequest(BaseModel):
    height: Optional[float] = None
    build: Optional[str] = None
    skin_tone: Optional[str] = None
    hair_color: Optional[str] = None
    eye_color: Optional[str] = None
    measurements: Optional[AvatarMeasurements] = None
    preferences: Optional[AvatarPreferences] = None

# API Endpoints

@router.post("/create", response_model=AvatarResponse)
async def create_avatar(
    user_id: str = Form(...),
    photo: UploadFile = File(...),
    measurements: Optional[str] = Form(None),
    preferences: Optional[str] = Form(None)
):
    """
    Create a new 3D avatar from user photo and measurements

    - **user_id**: User identifier
    - **photo**: User photo file (JPG, PNG, WebP)
    - **measurements**: JSON string of body measurements (optional)
    - **preferences**: JSON string of avatar preferences (optional)
    """

    try:
        # Parse JSON strings if provided
        parsed_measurements = None
        if measurements:
            try:
                parsed_measurements = json.loads(measurements)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid measurements JSON")

        parsed_preferences = None
        if preferences:
            try:
                parsed_preferences = json.loads(preferences)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid preferences JSON")

        # Create avatar
        result = await avatar_service.create_avatar_from_photo(
            user_id=user_id,
            photo_file=photo,
            measurements=parsed_measurements,
            preferences=parsed_preferences
        )

        return AvatarResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Avatar creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Avatar creation failed: {str(e)}")

@router.get("/{avatar_id}")
async def get_avatar(avatar_id: str, user_id: str):
    """
    Get avatar details by ID

    - **avatar_id**: Avatar identifier
    - **user_id**: User identifier for authorization
    """

    try:
        avatar_data = await avatar_service.get_avatar(user_id, avatar_id)
        return avatar_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get avatar {avatar_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve avatar")

@router.get("/user/{user_id}", response_model=AvatarListResponse)
async def list_user_avatars(user_id: str):
    """
    List all avatars for a user

    - **user_id**: User identifier
    """

    try:
        avatars = await avatar_service.list_user_avatars(user_id)
        return AvatarListResponse(
            avatars=avatars,
            total=len(avatars)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to list avatars for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve avatars")

@router.put("/{avatar_id}")
async def update_avatar(
    avatar_id: str,
    user_id: str,
    updates: AvatarUpdateRequest
):
    """
    Update avatar configuration

    - **avatar_id**: Avatar identifier
    - **user_id**: User identifier for authorization
    - **updates**: Avatar updates to apply
    """

    try:
        # Convert Pydantic model to dict, excluding None values
        update_data = updates.dict(exclude_none=True)

        result = await avatar_service.update_avatar(
            user_id=user_id,
            avatar_id=avatar_id,
            updates=update_data
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update avatar {avatar_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Avatar update failed")

@router.delete("/{avatar_id}")
async def delete_avatar(avatar_id: str, user_id: str):
    """
    Delete an avatar

    - **avatar_id**: Avatar identifier
    - **user_id**: User identifier for authorization
    """

    try:
        # In production, this would delete from database and storage
        # For MVP, return success

        result = {
            'success': True,
            'avatar_id': avatar_id,
            'message': 'Avatar deleted successfully',
            'deleted_at': datetime.now().isoformat()
        }

        logger.info(f"Avatar {avatar_id} deleted for user {user_id}")
        return result

    except Exception as e:
        logger.error(f"Failed to delete avatar {avatar_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Avatar deletion failed")

@router.get("/{avatar_id}/model")
async def get_avatar_model(avatar_id: str, user_id: str):
    """
    Get 3D avatar model file (GLTF format)

    - **avatar_id**: Avatar identifier
    - **user_id**: User identifier for authorization
    """

    try:
        # In production, this would serve the actual GLTF file
        # For MVP, return model metadata

        model_data = {
            'format': 'gltf',
            'version': '2.0',
            'avatar_id': avatar_id,
            'download_url': f"/api/avatars/{avatar_id}/download",
            'preview_url': f"/api/avatars/{avatar_id}/preview.jpg",
            'file_size': '2.5MB',
            'created_at': '2024-01-01T00:00:00Z'
        }

        return model_data

    except Exception as e:
        logger.error(f"Failed to get avatar model {avatar_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve avatar model")

@router.get("/{avatar_id}/preview")
async def get_avatar_preview(avatar_id: str):
    """
    Get avatar preview image

    - **avatar_id**: Avatar identifier
    """

    try:
        # In production, this would serve the actual preview image
        # For MVP, return preview metadata

        preview_data = {
            'avatar_id': avatar_id,
            'image_url': f"/static/avatars/{avatar_id}_preview.jpg",
            'thumbnail_url': f"/static/avatars/{avatar_id}_thumb.jpg",
            'dimensions': '512x512',
            'format': 'JPEG'
        }

        return preview_data

    except Exception as e:
        logger.error(f"Failed to get avatar preview {avatar_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve avatar preview")

# Health check endpoint
@router.get("/health")
async def avatar_health_check():
    """Avatar service health check"""

    return {
        'service': 'Avatar Creation Service',
        'status': 'healthy',
        'version': '1.0.0',
        'features': {
            'photo_upload': True,
            '3d_generation': True,
            'customization': True,
            'measurements': True
        },
        'supported_formats': ['.jpg', '.jpeg', '.png', '.webp'],
        'max_file_size': '10MB'
    }
