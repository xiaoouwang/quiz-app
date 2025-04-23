#!/bin/bash

# This script uses BFG Repo-Cleaner to remove sensitive firebase-config.js from Git history
# WARNING: This will rewrite Git history. Only use if you understand the implications.

# Exit on error
set -e

echo "Preparing to clean Git history..."

# Check if BFG is installed
if ! command -v bfg &> /dev/null; then
    echo "BFG Repo-Cleaner is not installed"
    echo "Please install it from: https://rtyley.github.io/bfg-repo-cleaner/"
    echo "On macOS with Homebrew: brew install bfg"
    exit 1
fi

# Create a fresh clone for BFG to work on
CURRENT_DIR=$(pwd)
PARENT_DIR=$(dirname "$CURRENT_DIR")
MIRROR_DIR="$PARENT_DIR/repo-mirror"

echo "Creating a mirror of the repository..."
rm -rf "$MIRROR_DIR"
git clone --mirror "$CURRENT_DIR/.git" "$MIRROR_DIR"

# Create a file with sensitive terms to search and replace
cat > "$PARENT_DIR/sensitive-data.txt" << EOL
AIzaSyCdXBlVr5RLkTWRwudIZ-3HI7LPbUx2ZE8
quiz-998eb.firebaseapp.com
quiz-998eb
quiz-998eb.firebasestorage.app
166011800484
1:166011800484:web:915835ee1bcdee222d8f31
G-LY5XN7CYT4
EOL

echo "Running BFG to remove sensitive data from history..."
cd "$MIRROR_DIR"
bfg --replace-text "$PARENT_DIR/sensitive-data.txt"

echo "Updating references and cleaning up..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "The repository mirror has been cleaned at: $MIRROR_DIR"
echo ""
echo "NEXT STEPS:"
echo "1. Navigate to the mirror directory:"
echo "   cd $MIRROR_DIR"
echo ""
echo "2. Force push to your GitHub repository (WARNING: This is irreversible):"
echo "   git push --force"
echo ""
echo "3. Update your local repository:"
echo "   cd $CURRENT_DIR"
echo "   git fetch origin"
echo "   git reset --hard origin/main"
echo ""
echo "4. Delete the temporary files:"
echo "   rm -rf $MIRROR_DIR $PARENT_DIR/sensitive-data.txt"
echo ""
echo "IMPORTANT: Notify all contributors that they should reclone the repository!"