#!/bin/bash
set -e

echo "🚀 Starting LMS Backend..."

# Check if dist folder exists
if [ ! -d "dist" ]; then
  echo "📦 Building first..."
  npm run build
fi

echo "🌟 Starting server..."
node dist/main.js
