#!/bin/bash

# Exit on error
set -e

echo "Creating clean repository without Git history..."

# Define paths
CURRENT_DIR=$(pwd)
PARENT_DIR=$(dirname "$CURRENT_DIR")
CLEAN_DIR="$PARENT_DIR/quiz-app-clean"

# Create clean directory
rm -rf "$CLEAN_DIR"
mkdir -p "$CLEAN_DIR"

# Copy current repository files, excluding git and sensitive data
echo "Copying files..."
rsync -av --progress "$CURRENT_DIR/" "$CLEAN_DIR/" \
  --exclude .git \
  --exclude node_modules \
  --exclude .DS_Store \
  --exclude firebase-config.js

# Setup clean git repository
echo "Setting up clean Git repository..."
cd "$CLEAN_DIR"
git init

# Add files to new repository
git add .
git commit -m "Initial commit with clean repository"

echo ""
echo "Clean repository created at: $CLEAN_DIR"
echo ""
echo "NEXT STEPS:"
echo "1. Create a new empty repository on GitHub"
echo "2. Run the following commands:"
echo "   cd $CLEAN_DIR"
echo "   git remote add origin https://github.com/YOUR-USERNAME/NEW-REPO-NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Your sensitive data is now excluded from the new repository."