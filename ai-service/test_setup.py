#!/usr/bin/env python3
"""
Simple test script for AI service
"""

def main():
    print("✅ Python AI Service - Hello World Test")
    print("🐍 Python version check...")

    import sys
    print(f"Python version: {sys.version}")

    print("📦 Testing FastAPI import...")
    try:
        import fastapi
        print(f"✅ FastAPI version: {fastapi.__version__}")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False

    print("🌐 Testing uvicorn import...")
    try:
        import uvicorn
        print(f"✅ Uvicorn imported successfully")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False

    print("✅ All dependencies verified!")
    print("🚀 AI Service is ready for deployment")
    return True

if __name__ == "__main__":
    main()
