#!/bin/bash
cd ~/Cursor/LeadLines-Mark-1

# Attempt to push committed changes
echo "Pushing committed changes to GitHub..."
git push origin main

# Check if push was successful
if [ $? -ne 0 ]; then
  echo "Push failed. Trying with Personal Access Token..."
  read -p "Enter your GitHub Personal Access Token: " token
  git remote set-url origin "https://${token}@github.com/Bluecraft-AI/LeadLines-Mark-1.git"
  git push origin main
  
  # Reset the URL for security
  git remote set-url origin "https://github.com/Bluecraft-AI/LeadLines-Mark-1.git"
  
  # Check if push was successful
  if [ $? -ne 0 ]; then
    echo "Error: Failed to push changes. Please try again."
    exit 1
  fi
fi

echo "Success! Your changes have been pushed to GitHub." 