#!/bin/bash

echo "🎮 NEOVERSE BRAWL - Setup & Launch"
echo "=================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting development server..."
echo ""
echo "Controls:"
echo "  Player 1: WASD + F,G,H,J"
echo "  Player 2: Arrows + U,I,O,P"
echo ""
echo "Quick Test: Use 'QUICK TEST' from menu for instant battle!"
echo ""

npm run dev
