#!/bin/bash
cd ~/Cursor/LeadLines-Mark-1-main

# Prompt for GitHub token
read -sp "Enter GitHub token: " GITHUB_TOKEN
echo

# Set the remote URL with the token
git remote set-url origin https://${GITHUB_TOKEN}@github.com/Bluecraft-AI/LeadLines-Mark-1.git

echo "Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/main
echo "Done! Your Cursor workspace is now in sync with GitHub."
