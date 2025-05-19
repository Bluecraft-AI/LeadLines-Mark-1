#!/bin/bash

echo "Setting Firebase configuration variables..."

# Set OpenAI API key
echo "Setting OpenAI API key..."
npx firebase functions:config:set openai.key="$1"

# Set Supabase values if provided
if [ ! -z "$2" ]; then
  echo "Setting Supabase URL..."
  npx firebase functions:config:set supabase.url="$2"
fi

if [ ! -z "$3" ]; then
  echo "Setting Supabase key..."
  npx firebase functions:config:set supabase.key="$3"
fi

# Verify the configuration
echo "Verifying configuration (keys partially hidden for security)..."
npx firebase functions:config:get

echo "Firebase configuration complete!" 