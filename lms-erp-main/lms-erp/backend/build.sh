#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building with TypeScript..."
npx tsc

echo "✅ Build completed successfully!"
