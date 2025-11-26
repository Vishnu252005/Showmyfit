#!/bin/bash

# Next.js Migration Helper Script
# This script helps you migrate from Vite to Next.js

echo "🚀 ShowMyFIT Next.js Migration Helper"
echo "======================================"
echo ""

# Check if Next.js is already installed
if [ -d "node_modules/next" ]; then
    echo "✅ Next.js is already installed"
else
    echo "📦 Installing Next.js..."
    npm install next@latest react@latest react-dom@latest
    npm install -D @types/node @types/react @types/react-dom
fi

echo ""
echo "📁 Creating Next.js app structure..."
echo ""

# Create app directory if it doesn't exist
mkdir -p app
mkdir -p app/product
mkdir -p app/cart
mkdir -p app/search
mkdir -p app/categories
mkdir -p app/admin
mkdir -p app/shop
mkdir -p app/profile

# Create lib directory for utilities
mkdir -p src/lib/firebase

echo "✅ Directory structure created"
echo ""
echo "📝 Next steps:"
echo "1. Copy your components to src/components/"
echo "2. Convert pages to app/[route]/page.tsx format"
echo "3. Move contexts to app/layout.tsx"
echo "4. Update routing from react-router to Next.js"
echo ""
echo "Run 'npm run dev' to start Next.js dev server"





