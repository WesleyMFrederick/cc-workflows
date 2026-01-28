#!/usr/bin/env bash
# Auto-detect and run build if project requires it
# Usage: ./run-build-if-required.sh

set -e

echo "Checking for build requirements..."

# TypeScript - check for tsconfig.json
if [ -f tsconfig.json ]; then
  echo "TypeScript detected - running build..."
  npx tsc --build
  echo "✓ TypeScript build complete"
  exit 0
fi

# Vite - check for vite.config
if [ -f vite.config.js ] || [ -f vite.config.ts ]; then
  echo "Vite detected - running build..."
  npm run build 2>/dev/null || true
  echo "✓ Vite build attempted"
  exit 0
fi

# Webpack - check for webpack.config
if [ -f webpack.config.js ]; then
  echo "Webpack detected - running build..."
  npm run build 2>/dev/null || true
  echo "✓ Webpack build attempted"
  exit 0
fi

# General fallback - check for build script in package.json
if grep -q '"build":' package.json 2>/dev/null; then
  echo "Build script detected - running build..."
  npm run build 2>/dev/null || true
  echo "✓ Build script attempted"
  exit 0
fi

echo "No build tooling detected - skipping build step"
exit 0
