#!/bin/bash

# Zero-Error Protocol Validation Script
# This script enforces the four gates of quality

set -e  # Exit on any error

echo "🔍 Starting Zero-Error Protocol Validation..."
echo "================================================"

# Gate 1: TypeScript Compilation
echo "🔍 Gate 1: TypeScript Compilation Check"
echo "Running: npm run typecheck"
if npm run typecheck; then
    echo "✅ TypeScript compilation: PASSED"
else
    echo "❌ TypeScript compilation: FAILED"
    echo "Fix TypeScript errors before proceeding."
    exit 1
fi

echo ""

# Gate 2: Unit Tests
echo "🧪 Gate 2: Unit Tests"
echo "Running: npm test"
if npm test; then
    echo "✅ Unit tests: PASSED"
else
    echo "❌ Unit tests: FAILED"
    echo "Fix failing tests before proceeding."
    exit 1
fi

echo ""

# Gate 3: Linting
echo "🎯 Gate 3: Code Linting"
echo "Running: npm run lint"
if npm run lint; then
    echo "✅ Linting: PASSED"
else
    echo "❌ Linting: FAILED"
    echo "Fix linting violations before proceeding."
    echo "Tip: Run 'npm run fix' to auto-fix some issues."
    exit 1
fi

echo ""

# Gate 4: Build Check
echo "🏗️ Gate 4: Build Verification"
echo "Running: npm run build"
if npm run build; then
    echo "✅ Build: PASSED"
else
    echo "❌ Build: FAILED"
    echo "Fix build errors before proceeding."
    exit 1
fi

echo ""
echo "🎉 ALL GATES PASSED!"
echo "================================================"
echo "✅ TypeScript Compilation: PASSED"
echo "✅ Unit Tests: PASSED"
echo "✅ Code Linting: PASSED"
echo "✅ Build Verification: PASSED"
echo ""
echo "🚀 Code is ready for commit/deployment!"
echo "================================================"