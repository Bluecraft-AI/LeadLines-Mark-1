#!/bin/bash

# Set Firebase Functions Secrets Script

echo "Setting up Firebase Secrets for the project..."

# Set OpenAI API Key
echo "Setting OpenAI API Key..."
echo "Enter your OpenAI API key (starting with 'sk-proj-'): "
read -s OPENAI_API_KEY
echo "Setting OPENAI_API_KEY secret..."
npx firebase functions:secrets:set OPENAI_API_KEY --project=leadlines-portal <<< "$OPENAI_API_KEY"
echo ""

# Set Supabase URL
echo "Setting Supabase URL..."
echo "Enter your Supabase URL (https://...): "
read SUPABASE_URL
echo "Setting SUPABASE_URL secret..."
npx firebase functions:secrets:set SUPABASE_URL --project=leadlines-portal <<< "$SUPABASE_URL"
echo ""

# Set Supabase Key
echo "Setting Supabase Key..."
echo "Enter your Supabase anon key: "
read -s SUPABASE_KEY
echo "Setting SUPABASE_KEY secret..."
npx firebase functions:secrets:set SUPABASE_KEY --project=leadlines-portal <<< "$SUPABASE_KEY"
echo ""

echo "All secrets have been set!"
echo "You can now deploy your functions with ./deploy.sh" 