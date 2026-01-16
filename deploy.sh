#!/bin/bash

# Deployment script for Naalu Aksharam Padikk
# This script builds and deploys the frontend to Firebase Hosting

set -e  # Exit on error

echo "🚀 Starting deployment process..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if .env file exists in frontend
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Warning: frontend/.env file not found"
    echo "   Make sure environment variables are set"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Navigate to frontend directory
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Run linting (optional, can be skipped)
echo ""
echo "🔍 Running linter..."
npm run lint || echo "⚠️  Linting warnings/errors found, continuing..."

# Build the frontend
echo ""
echo "🏗️  Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! dist directory not found."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo "   Build output: frontend/dist/"

# Go back to root directory
cd ..

# Deploy to Firebase
echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://nalu-aksharam-padik.web.app"
echo ""
