#!/bin/bash

# Deploy Firebase Functions Script

echo "Running npm install to ensure dependencies are up-to-date..."
npm install

echo "Installing required dependencies..."
npm install openai cors --save

echo "Deploying Firebase Functions..."
firebase deploy --only functions

echo "Deployment completed!"
echo "Note: Make sure you've set your environment variables using:"
echo "  firebase functions:config:set openai.key=\"your-openai-api-key\""
echo "  firebase functions:config:set supabase.url=\"your-supabase-url\""
echo "  firebase functions:config:set supabase.key=\"your-supabase-anon-key\"" 