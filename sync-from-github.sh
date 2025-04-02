#!/bin/bash
cd ~/Cursor/LeadLines-Mark-1
echo "Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/main
echo "Done! Your Cursor workspace is now in sync with GitHub."
