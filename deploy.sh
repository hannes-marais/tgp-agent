#!/bin/bash

echo "🚀 Building and deploying TGP Agent..."

# Stop development servers if running
./dev-control.sh stop 2>/dev/null || true

# Clean previous build
echo "  🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "  📦 Installing dependencies..."
npm ci

# Build the frontend
echo "  🏗️  Building frontend..."
npm run build

# Build the backend
echo "  🔧 Building backend..."
npm run build

echo "✅ Build completed!"
echo "📁 Files ready in dist/ folder"
echo ""
echo "To test production build locally:"
echo "  node dist/index.js"
echo ""
echo "Production files:"
ls -la dist/
