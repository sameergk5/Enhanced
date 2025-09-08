#!/usr/bin/env python3
"""
Deployment Verification Script for Wardrobe AI Backend Infrastructure
Tests both Node.js and Python microservices
"""

import json
import subprocess
import sys
import time
from typing import Any, Dict

import requests


def test_backend_service() -> Dict[str, Any]:
    """Test the Node.js backend service"""
    print("🧪 Testing Node.js Backend Service...")

    try:
        response = requests.get("http://localhost:3001/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend Health Check: {data}")
            return {"status": "healthy", "data": data}
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return {"status": "unhealthy", "error": f"Status code: {response.status_code}"}
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend connection failed: {e}")
        return {"status": "unreachable", "error": str(e)}

def test_ai_service() -> Dict[str, Any]:
    """Test the Python AI service"""
    print("🤖 Testing Python AI Service...")

    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ AI Service Health Check: {data}")
            return {"status": "healthy", "data": data}
        else:
            print(f"❌ AI Service returned status code: {response.status_code}")
            return {"status": "unhealthy", "error": f"Status code: {response.status_code}"}
    except requests.exceptions.RequestException as e:
        print(f"❌ AI Service connection failed: {e}")
        return {"status": "unreachable", "error": str(e)}

def test_ai_endpoints() -> Dict[str, Any]:
    """Test AI service endpoints"""
    print("🔍 Testing AI Service Endpoints...")

    # Test style analysis endpoint
    try:
        payload = {
            "image_url": "https://example.com/test-image.jpg",
            "user_preferences": {"style": "casual"}
        }
        response = requests.post("http://localhost:8000/analyze-style",
                               json=payload, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Style Analysis Endpoint: Working")
            return {"status": "working", "data": data}
        else:
            print(f"❌ Style Analysis failed: {response.status_code}")
            return {"status": "failed", "error": f"Status code: {response.status_code}"}
    except requests.exceptions.RequestException as e:
        print(f"❌ Style Analysis endpoint error: {e}")
        return {"status": "error", "error": str(e)}

def main():
    """Main deployment verification function"""
    print("🚀 Wardrobe AI - Backend Infrastructure Deployment Verification")
    print("=" * 60)

    results = {
        "timestamp": time.time(),
        "backend_service": test_backend_service(),
        "ai_service": test_ai_service(),
        "ai_endpoints": test_ai_endpoints()
    }

    print("\n📊 Deployment Verification Summary:")
    print("=" * 40)

    for service, result in results.items():
        if service == "timestamp":
            continue
        status = result.get("status", "unknown")
        if status in ["healthy", "working"]:
            print(f"✅ {service.replace('_', ' ').title()}: {status}")
        else:
            print(f"❌ {service.replace('_', ' ').title()}: {status}")

    # Overall status
    all_healthy = all(
        result.get("status") in ["healthy", "working"]
        for key, result in results.items()
        if key != "timestamp"
    )

    print("\n🎯 Overall Deployment Status:")
    if all_healthy:
        print("✅ All services are healthy and ready for production!")
        print("🚀 Task 1.1 - Backend Infrastructure Deployment: COMPLETED")
    else:
        print("⚠️  Some services need attention before production deployment")

    # Save results
    with open("deployment_verification.json", "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n📁 Results saved to: deployment_verification.json")

    return all_healthy

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
