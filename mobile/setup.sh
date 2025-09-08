#!/bin/bash

# Wardrobe AI Mobile Setup Script
echo "🚀 Setting up Wardrobe AI Mobile Application..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the mobile directory"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
else
    echo "✅ Environment file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# iOS-specific setup (only on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Setting up iOS dependencies..."
    cd ios
    pod install
    cd ..
    echo "✅ iOS setup completed."
else
    echo "⏭️  Skipping iOS setup (not on macOS)"
fi

echo ""
echo "✅ Mobile application setup completed!"
echo ""
echo "📱 Next steps:"
echo "1. Update the .env file with your API endpoints"
echo "2. For Android: npm run android"
echo "3. For iOS: npm run ios"
echo "4. To start Metro bundler: npm start"
echo ""
echo "📖 See README.md for detailed setup instructions"
