#!/bin/bash

echo "🚀 Pushing Restaurant Platform to GitHub"
echo "========================================"
echo ""

# Check if repository exists (should be public now)
echo "📋 Repository: https://github.com/psdew2ewqws/restaurant-platform"
echo ""

echo "🔐 Choose authentication method:"
echo "1. Use Personal Access Token (recommended)"
echo "2. Use GitHub CLI (if installed)"
echo "3. Use SSH (if configured)"
echo ""

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Using Personal Access Token method..."
        echo "When prompted:"
        echo "- Username: psdew2ewqws"
        echo "- Password: [paste your GitHub personal access token]"
        echo ""
        git push -u origin main
        ;;
    2)
        echo ""
        echo "Using GitHub CLI method..."
        if command -v gh &> /dev/null; then
            gh auth login
            git push -u origin main
        else
            echo "GitHub CLI not installed. Install with:"
            echo "curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
            echo "echo 'deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main' | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
            echo "sudo apt update && sudo apt install gh"
        fi
        ;;
    3)
        echo ""
        echo "Using SSH method..."
        git remote set-url origin git@github.com:psdew2ewqws/restaurant-platform.git
        git push -u origin main
        ;;
    *)
        echo "Invalid choice. Try again."
        ;;
esac