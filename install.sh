#!/bin/bash
# Coalesce Discord Bot Installation Script
# This script is used by Pterodactyl/Pelican Panel to install the bot

set -e

echo "========================================="
echo "  Coalesce Discord Bot Installation"
echo "========================================="
echo ""

# Install system dependencies
echo "[1/6] Installing system dependencies..."
apt update > /dev/null 2>&1
apt install -y git curl jq file unzip make gcc g++ python3 python3-pip ffmpeg > /dev/null 2>&1
echo "✓ System dependencies installed"

# Create server directory
mkdir -p /mnt/server
cd /mnt/server

# Clone or update repository
GIT_ADDRESS="https://github.com/mrafto/Coalesce.git"

echo ""
echo "[2/6] Setting up repository..."
if [ -d .git ]; then
    echo "Updating existing repository..."
    git pull
else
    echo "Cloning repository from GitHub..."
    git clone ${GIT_ADDRESS} .
fi
echo "✓ Repository ready"

# Install yt-dlp
echo ""
echo "[3/6] Installing yt-dlp..."
python3 -m pip install --upgrade yt-dlp > /dev/null 2>&1
echo "✓ yt-dlp installed"

# Install node modules
echo ""
echo "[4/6] Installing npm packages..."
if [ -f package.json ]; then
    npm install --quiet
    echo "✓ npm packages installed"
else
    echo "⚠ No package.json found"
fi

# Build TypeScript
echo ""
echo "[5/6] Building TypeScript project..."
if [ -f tsconfig.json ]; then
    npm run build
    echo "✓ TypeScript build complete"
else
    echo "⚠ No tsconfig.json found"
fi

# Final instructions
echo ""
echo "[6/6] Installation complete!"
echo ""
echo "========================================="
echo "  Next Steps:"
echo "========================================="
echo ""
echo "1. Set your environment variables in the panel:"
echo "   • DISCORD_TOKEN (required)"
echo "   • CLIENT_ID (required)"
echo "   • GUILD_ID (optional)"
echo ""
echo "2. Start the server!"
echo ""
echo "========================================="

