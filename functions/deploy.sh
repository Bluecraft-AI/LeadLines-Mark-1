#!/bin/bash

# Deploy Firebase Functions Script

echo "Running npm install to ensure dependencies are up-to-date..."
npm install

echo "Installing required dependencies..."
npm install openai cors @supabase/supabase-js --save

echo "Deploying Firebase Functions..."
npx firebase deploy --only functions --project=leadlines-portal

echo "Deployment completed!"
echo "Note: Make sure you've set your Firebase config values using:"
echo "  npx firebase functions:config:set openai.key=\"your-openai-api-key\""
echo "  npx firebase functions:config:set supabase.url=\"your-supabase-url\""
echo "  npx firebase functions:config:set supabase.key=\"your-supabase-anon-key\""
echo ""
echo "You can use ./set-config.sh to set these values interactively." 