#!/bin/bash

# Set Firebase Functions Config Script

echo "Setting up Firebase Config for the project..."

# Set OpenAI API Key
echo "Setting OpenAI API Key..."
echo "Enter your OpenAI API key (starting with 'sk-proj-'): "
read -s OPENAI_API_KEY
echo "Setting openai.key config..."
npx firebase functions:config:set openai.key="$OPENAI_API_KEY" --project=leadlines-portal
echo ""

# Set Supabase URL
echo "Setting Supabase URL..."
echo "Enter your Supabase URL (https://...): "
read SUPABASE_URL
echo "Setting supabase.url config..."
npx firebase functions:config:set supabase.url="$SUPABASE_URL" --project=leadlines-portal
echo ""

# Set Supabase Key
echo "Setting Supabase Key..."
echo "Enter your Supabase anon key: "
read -s SUPABASE_KEY
echo "Setting supabase.key config..."
npx firebase functions:config:set supabase.key="$SUPABASE_KEY" --project=leadlines-portal
echo ""

echo "All config values have been set!"
echo "You can now deploy your functions with ./deploy.sh" 