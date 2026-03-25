#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install --production=false

echo "🔨 Building TypeScript..."
npx tsc --project tsconfig.json --skipLibCheck --noEmit false

echo "✅ Build completed!"
