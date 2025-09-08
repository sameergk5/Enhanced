import base64
import io
import json
import os

import requests
from PIL import Image


# Create a simple test image
def create_test_image():
    """Create a simple test garment image"""
    img = Image.new('RGB', (300, 400), color='red')

    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    return img_bytes

def test_garment_upload():
    """Test the complete garment upload pipeline"""

    # Configuration
    backend_url = "http://localhost:3001"
    ai_service_url = "http://localhost:8000"

    print("🧪 Testing Garment Upload Pipeline")
    print("=" * 50)

    # Test 1: Health checks
    print("\n1. Testing service health...")

    try:
        backend_health = requests.get(f"{backend_url}/health", timeout=5)
        if backend_health.status_code == 200:
            print("✅ Backend service is healthy")
        else:
            print("❌ Backend service health check failed")
            return
    except Exception as e:
        print(f"❌ Backend service not accessible: {e}")
        return

    try:
        ai_health = requests.get(f"{ai_service_url}/health", timeout=5)
        if ai_health.status_code == 200:
            print("✅ AI service is healthy")
        else:
            print("❌ AI service health check failed")
            return
    except Exception as e:
        print(f"❌ AI service not accessible: {e}")
        return

    # Test 2: Create test user and get token (simplified for testing)
    print("\n2. Setting up test authentication...")

    # For testing, we'll use a mock token - in real scenario, register/login would be needed
    test_token = "test_token_for_development"
    headers = {
        "Authorization": f"Bearer {test_token}",
        "Content-Type": "application/json"
    }

    # Test 3: Test AI service garment analysis directly
    print("\n3. Testing AI garment analysis...")

    test_image = create_test_image()

    files = {
        'file': ('test_garment.jpg', test_image, 'image/jpeg')
    }

    try:
        ai_response = requests.post(
            f"{ai_service_url}/garments/analyze",
            files=files,
            timeout=30
        )

        if ai_response.status_code == 200:
            ai_data = ai_response.json()
            print("✅ AI analysis successful")
            print(f"   Category: {ai_data.get('category', 'N/A')}")
            print(f"   Colors: {ai_data.get('colors', [])}")
            print(f"   Style: {ai_data.get('style_attributes', {})}")
        else:
            print(f"❌ AI analysis failed: {ai_response.status_code}")
            print(f"   Response: {ai_response.text}")
    except Exception as e:
        print(f"❌ AI analysis error: {e}")
        return

    # Test 4: Test complete garment upload through backend
    print("\n4. Testing complete garment upload...")

    # Reset image bytes
    test_image.seek(0)

    # Prepare form data for backend
    form_data = {
        'name': 'Test Red Shirt',
        'description': 'A beautiful red shirt for testing',
        'brand': 'TestBrand',
        'size': 'M',
        'price': '29.99',
        'tags': json.dumps(['casual', 'red', 'cotton'])
    }

    files = {
        'garment_image': ('test_garment.jpg', test_image, 'image/jpeg')
    }

    try:
        # Note: We're testing without authentication for now
        upload_response = requests.post(
            f"{backend_url}/api/garments/upload",
            data=form_data,
            files=files,
            timeout=60
        )

        if upload_response.status_code == 200:
            upload_data = upload_response.json()
            print("✅ Garment upload successful")
            print(f"   Garment ID: {upload_data.get('garment', {}).get('id', 'N/A')}")
            print(f"   Name: {upload_data.get('garment', {}).get('name', 'N/A')}")
            print(f"   AI Analysis: {upload_data.get('garment', {}).get('ai_analysis', {})}")
        else:
            print(f"❌ Garment upload failed: {upload_response.status_code}")
            print(f"   Response: {upload_response.text}")
    except Exception as e:
        print(f"❌ Garment upload error: {e}")

    # Test 5: Test garment retrieval
    print("\n5. Testing garment retrieval...")

    try:
        get_response = requests.get(
            f"{backend_url}/api/garments",
            timeout=10
        )

        if get_response.status_code == 200:
            garments_data = get_response.json()
            print("✅ Garment retrieval successful")
            print(f"   Total garments: {len(garments_data.get('garments', []))}")
        else:
            print(f"❌ Garment retrieval failed: {get_response.status_code}")
            print(f"   Response: {get_response.text}")
    except Exception as e:
        print(f"❌ Garment retrieval error: {e}")

    print("\n" + "=" * 50)
    print("🎉 Garment upload pipeline test completed!")

if __name__ == "__main__":
    test_garment_upload()
