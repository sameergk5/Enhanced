"""
Garment Management Service - Virtual Wardrobe Implementation
Handles garment uploads, AI-powered tagging, and wardrobe organization
"""

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import numpy as np
import requests
from fastapi import HTTPException, UploadFile
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GarmentService:
    """Virtual Wardrobe Garment Management Service"""

    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.webp']
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.garment_categories = {
            'tops': ['t-shirt', 'shirt', 'blouse', 'sweater', 'hoodie', 'tank-top', 'cardigan'],
            'bottoms': ['jeans', 'pants', 'shorts', 'skirt', 'leggings', 'trousers'],
            'dresses': ['dress', 'gown', 'sundress', 'maxi-dress', 'mini-dress'],
            'outerwear': ['jacket', 'coat', 'blazer', 'vest', 'windbreaker', 'parka'],
            'footwear': ['sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers'],
            'accessories': ['hat', 'scarf', 'belt', 'jewelry', 'bag', 'watch', 'sunglasses']
        }
        self.color_palette = {
            'black': [0, 0, 0],
            'white': [255, 255, 255],
            'red': [255, 0, 0],
            'blue': [0, 0, 255],
            'green': [0, 255, 0],
            'yellow': [255, 255, 0],
            'orange': [255, 165, 0],
            'purple': [128, 0, 128],
            'pink': [255, 192, 203],
            'brown': [139, 69, 19],
            'gray': [128, 128, 128],
            'navy': [0, 0, 128],
            'beige': [245, 245, 220]
        }

    async def upload_and_analyze_garment(
        self,
        user_id: str,
        garment_file: UploadFile,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Upload and analyze a garment image"""

        try:
            # Validate file upload
            validation_result = await self._validate_garment_image(garment_file)
            if not validation_result['valid']:
                raise HTTPException(status_code=400, detail=validation_result['error'])

            # Analyze garment image
            analysis_result = await self._analyze_garment_image(garment_file)

            # Extract features and properties
            garment_data = await self._extract_garment_features(analysis_result, metadata)

            # Generate garment ID and URLs
            garment_id = f"garment_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
            garment_data.update({
                'garment_id': garment_id,
                'user_id': user_id,
                'upload_date': datetime.now().isoformat(),
                'image_url': f"/api/garments/{garment_id}/image.jpg",
                'thumbnail_url': f"/api/garments/{garment_id}/thumb.jpg"
            })

            logger.info(f"Garment analyzed successfully for user {user_id}: {garment_id}")

            return {
                'success': True,
                'garment': garment_data,
                'analysis': analysis_result
            }

        except Exception as e:
            logger.error(f"Garment upload failed for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Garment upload failed: {str(e)}")

    async def _validate_garment_image(self, garment_file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded garment image"""

        # Check file extension
        file_ext = os.path.splitext(garment_file.filename)[1].lower()
        if file_ext not in self.supported_formats:
            return {
                'valid': False,
                'error': f"Unsupported file format. Supported: {', '.join(self.supported_formats)}"
            }

        # Check file size
        if garment_file.size > self.max_file_size:
            return {
                'valid': False,
                'error': f"File too large. Maximum size: {self.max_file_size // (1024*1024)}MB"
            }

        # Validate image content
        try:
            import io
            contents = await garment_file.read()
            image = Image.open(io.BytesIO(contents))

            # Check minimum dimensions
            if image.width < 100 or image.height < 100:
                return {
                    'valid': False,
                    'error': "Image too small. Minimum dimensions: 100x100 pixels"
                }

            # Reset file pointer
            await garment_file.seek(0)

            return {'valid': True}

        except Exception as e:
            return {
                'valid': False,
                'error': f"Invalid image file: {str(e)}"
            }

    async def _analyze_garment_image(self, garment_file: UploadFile) -> Dict[str, Any]:
        """Analyze garment image using AI/Computer Vision"""

        try:
            import io
            contents = await garment_file.read()
            image = Image.open(io.BytesIO(contents))

            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')

            # Basic analysis (MVP implementation)
            analysis = {
                'dominant_colors': self._extract_dominant_colors(image),
                'garment_type': self._classify_garment_type(image),
                'style_attributes': self._extract_style_attributes(image),
                'pattern_analysis': self._analyze_patterns(image),
                'material_prediction': self._predict_material(image),
                'occasion_tags': self._generate_occasion_tags(image),
                'season_suitability': self._analyze_season_suitability(image),
                'image_quality': {
                    'resolution': f"{image.width}x{image.height}",
                    'clarity': 'good',  # MVP placeholder
                    'lighting': 'adequate'  # MVP placeholder
                }
            }

            await garment_file.seek(0)  # Reset for potential reuse
            return analysis

        except Exception as e:
            logger.error(f"Garment analysis failed: {str(e)}")
            return {
                'error': str(e),
                'analysis_failed': True
            }

    def _extract_dominant_colors(self, image: Image.Image) -> List[str]:
        """Extract dominant colors from garment image"""

        try:
            # Resize image for faster processing
            image_small = image.resize((150, 150))
            img_array = np.array(image_small)

            # Reshape to list of pixels
            pixels = img_array.reshape(-1, 3)

            # Simple color clustering (MVP implementation)
            # In production, use proper k-means clustering
            unique_colors = []
            color_counts = {}

            for pixel in pixels[::10]:  # Sample every 10th pixel
                closest_color = self._find_closest_color(pixel)
                if closest_color in color_counts:
                    color_counts[closest_color] += 1
                else:
                    color_counts[closest_color] = 1

            # Sort by frequency and return top 3
            sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
            return [color for color, count in sorted_colors[:3]]

        except Exception:
            return ['unknown']

    def _find_closest_color(self, pixel_rgb) -> str:
        """Find closest named color to RGB value"""

        min_distance = float('inf')
        closest_color = 'unknown'

        for color_name, color_rgb in self.color_palette.items():
            distance = sum((a - b) ** 2 for a, b in zip(pixel_rgb, color_rgb))
            if distance < min_distance:
                min_distance = distance
                closest_color = color_name

        return closest_color

    def _classify_garment_type(self, image: Image.Image) -> Dict[str, Any]:
        """Classify garment type using image analysis"""

        # MVP implementation - basic classification
        # In production, use trained ML model

        width, height = image.size
        aspect_ratio = width / height

        # Simple heuristic-based classification
        if aspect_ratio > 1.5:
            # Wide images likely bottoms
            category = 'bottoms'
            type_prediction = 'pants'
            confidence = 0.6
        elif aspect_ratio < 0.7:
            # Tall images likely dresses or coats
            category = 'dresses'
            type_prediction = 'dress'
            confidence = 0.7
        else:
            # Square-ish images likely tops
            category = 'tops'
            type_prediction = 't-shirt'
            confidence = 0.5

        return {
            'category': category,
            'type': type_prediction,
            'confidence': confidence,
            'subcategory': self._get_subcategory(type_prediction)
        }

    def _get_subcategory(self, garment_type: str) -> str:
        """Get subcategory for garment type"""

        subcategory_map = {
            't-shirt': 'casual',
            'shirt': 'formal',
            'dress': 'formal',
            'jeans': 'casual',
            'pants': 'business',
            'shorts': 'casual',
            'jacket': 'outerwear',
            'sweater': 'knitwear'
        }

        return subcategory_map.get(garment_type, 'general')

    def _extract_style_attributes(self, image: Image.Image) -> List[str]:
        """Extract style attributes from garment"""

        # MVP implementation - generate basic style tags
        style_attributes = []

        # Analyze image properties for style cues
        img_array = np.array(image)
        avg_brightness = np.mean(img_array)

        if avg_brightness > 200:
            style_attributes.append('light')
        elif avg_brightness < 100:
            style_attributes.append('dark')

        # Add common style attributes (MVP)
        style_attributes.extend(['modern', 'versatile'])

        return style_attributes

    def _analyze_patterns(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze patterns in garment"""

        # MVP implementation - basic pattern detection
        try:
            img_array = np.array(image.convert('L'))  # Convert to grayscale

            # Simple pattern detection using variance
            variance = np.var(img_array)

            if variance > 1000:
                pattern_type = 'patterned'
                pattern_intensity = 'high'
            elif variance > 500:
                pattern_type = 'textured'
                pattern_intensity = 'medium'
            else:
                pattern_type = 'solid'
                pattern_intensity = 'low'

            return {
                'type': pattern_type,
                'intensity': pattern_intensity,
                'details': ['geometric'] if variance > 800 else ['simple']
            }

        except Exception:
            return {
                'type': 'unknown',
                'intensity': 'unknown',
                'details': []
            }

    def _predict_material(self, image: Image.Image) -> Dict[str, Any]:
        """Predict garment material"""

        # MVP implementation - basic material prediction
        materials = ['cotton', 'denim', 'wool', 'silk', 'polyester', 'leather']

        # Simple heuristic based on image properties
        img_array = np.array(image)
        avg_color = np.mean(img_array, axis=(0, 1))
        texture_variance = np.var(img_array)

        if texture_variance > 800:
            predicted_material = 'denim'
            confidence = 0.6
        elif avg_color[0] > 200 and avg_color[1] > 200 and avg_color[2] > 200:
            predicted_material = 'cotton'
            confidence = 0.5
        else:
            predicted_material = 'polyester'
            confidence = 0.4

        return {
            'primary': predicted_material,
            'confidence': confidence,
            'alternatives': [m for m in materials if m != predicted_material][:2]
        }

    def _generate_occasion_tags(self, image: Image.Image) -> List[str]:
        """Generate occasion tags for garment"""

        # MVP implementation - generate basic occasion tags
        occasion_tags = ['casual']

        # Simple analysis based on image properties
        img_array = np.array(image)
        avg_brightness = np.mean(img_array)

        if avg_brightness > 180:
            occasion_tags.extend(['daytime', 'office'])
        elif avg_brightness < 120:
            occasion_tags.extend(['evening', 'formal'])

        # Add general occasions
        occasion_tags.extend(['everyday', 'weekend'])

        return list(set(occasion_tags))  # Remove duplicates

    def _analyze_season_suitability(self, image: Image.Image) -> List[str]:
        """Analyze season suitability"""

        # MVP implementation - basic season analysis
        img_array = np.array(image)
        avg_color = np.mean(img_array, axis=(0, 1))

        seasons = []

        # Light colors for spring/summer
        if np.mean(avg_color) > 150:
            seasons.extend(['spring', 'summer'])

        # Darker colors for fall/winter
        if np.mean(avg_color) < 120:
            seasons.extend(['fall', 'winter'])

        # If neither, suitable for all seasons
        if not seasons:
            seasons = ['all-season']

        return seasons

    async def _extract_garment_features(
        self,
        analysis_result: Dict[str, Any],
        metadata: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Extract and structure garment features"""

        # Combine AI analysis with user metadata
        garment_data = {
            'name': metadata.get('name', 'Untitled Garment') if metadata else 'Untitled Garment',
            'description': metadata.get('description', '') if metadata else '',
            'brand': metadata.get('brand', '') if metadata else '',
            'size': metadata.get('size', '') if metadata else '',
            'price': metadata.get('price', 0) if metadata else 0,
            'purchase_date': metadata.get('purchase_date', '') if metadata else '',

            # AI-extracted features
            'category': analysis_result.get('garment_type', {}).get('category', 'unknown'),
            'type': analysis_result.get('garment_type', {}).get('type', 'unknown'),
            'subcategory': analysis_result.get('garment_type', {}).get('subcategory', 'general'),
            'colors': analysis_result.get('dominant_colors', []),
            'primary_color': analysis_result.get('dominant_colors', ['unknown'])[0],
            'style_attributes': analysis_result.get('style_attributes', []),
            'pattern': analysis_result.get('pattern_analysis', {}),
            'material': analysis_result.get('material_prediction', {}),
            'occasions': analysis_result.get('occasion_tags', []),
            'seasons': analysis_result.get('season_suitability', []),

            # Metadata
            'tags': metadata.get('tags', []) if metadata else [],
            'is_favorite': metadata.get('is_favorite', False) if metadata else False,
            'wear_count': 0,
            'last_worn': None,
            'status': 'active'
        }

        return garment_data

    async def get_garment(self, user_id: str, garment_id: str) -> Dict[str, Any]:
        """Retrieve garment by ID"""

        try:
            # In production, this would query the database
            # For MVP, return mock data

            garment_data = {
                'garment_id': garment_id,
                'user_id': user_id,
                'name': 'Sample Garment',
                'category': 'tops',
                'type': 't-shirt',
                'colors': ['blue', 'white'],
                'image_url': f"/api/garments/{garment_id}/image.jpg",
                'thumbnail_url': f"/api/garments/{garment_id}/thumb.jpg",
                'status': 'active',
                'created_at': datetime.now().isoformat()
            }

            return garment_data

        except Exception as e:
            logger.error(f"Failed to retrieve garment {garment_id}: {str(e)}")
            raise HTTPException(status_code=404, detail="Garment not found")

    async def list_user_garments(
        self,
        user_id: str,
        category: Optional[str] = None,
        season: Optional[str] = None,
        color: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """List user's garments with filtering"""

        try:
            # In production, this would query the database with filters
            # For MVP, return mock data

            garments = [
                {
                    'garment_id': f"garment_{user_id}_001",
                    'name': 'Blue Denim Jeans',
                    'category': 'bottoms',
                    'type': 'jeans',
                    'primary_color': 'blue',
                    'image_url': f"/api/garments/garment_{user_id}_001/image.jpg",
                    'thumbnail_url': f"/api/garments/garment_{user_id}_001/thumb.jpg",
                    'wear_count': 5,
                    'is_favorite': True,
                    'created_at': '2024-01-01T00:00:00Z'
                },
                {
                    'garment_id': f"garment_{user_id}_002",
                    'name': 'White Cotton T-Shirt',
                    'category': 'tops',
                    'type': 't-shirt',
                    'primary_color': 'white',
                    'image_url': f"/api/garments/garment_{user_id}_002/image.jpg",
                    'thumbnail_url': f"/api/garments/garment_{user_id}_002/thumb.jpg",
                    'wear_count': 3,
                    'is_favorite': False,
                    'created_at': '2024-01-02T00:00:00Z'
                }
            ]

            # Apply filters (MVP implementation)
            if category:
                garments = [g for g in garments if g['category'] == category]
            if color:
                garments = [g for g in garments if g['primary_color'] == color]

            # Apply pagination
            total = len(garments)
            garments = garments[offset:offset + limit]

            return {
                'garments': garments,
                'total': total,
                'page': offset // limit + 1,
                'pages': (total + limit - 1) // limit,
                'filters_applied': {
                    'category': category,
                    'season': season,
                    'color': color
                }
            }

        except Exception as e:
            logger.error(f"Failed to list garments for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to retrieve garments")

    async def update_garment(
        self,
        user_id: str,
        garment_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update garment information"""

        try:
            # Validate updates
            allowed_updates = [
                'name', 'description', 'brand', 'size', 'price',
                'tags', 'is_favorite', 'status', 'category', 'type'
            ]

            filtered_updates = {
                k: v for k, v in updates.items()
                if k in allowed_updates
            }

            if not filtered_updates:
                raise HTTPException(status_code=400, detail="No valid updates provided")

            # In production, this would update the database
            # For MVP, return success response

            updated_garment = {
                'garment_id': garment_id,
                'user_id': user_id,
                'updates_applied': filtered_updates,
                'updated_at': datetime.now().isoformat(),
                'status': 'updated'
            }

            logger.info(f"Garment {garment_id} updated for user {user_id}")
            return updated_garment

        except Exception as e:
            logger.error(f"Failed to update garment {garment_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Garment update failed")

    async def delete_garment(self, user_id: str, garment_id: str) -> Dict[str, Any]:
        """Delete a garment"""

        try:
            # In production, this would delete from database and storage
            # For MVP, return success

            result = {
                'success': True,
                'garment_id': garment_id,
                'user_id': user_id,
                'message': 'Garment deleted successfully',
                'deleted_at': datetime.now().isoformat()
            }

            logger.info(f"Garment {garment_id} deleted for user {user_id}")
            return result

        except Exception as e:
            logger.error(f"Failed to delete garment {garment_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Garment deletion failed")

# Export the service
garment_service = GarmentService()
