#!/bin/bash

clear
echo "============================================="
echo "LeadLines Firebase Functions Setup & Deployment"
echo "============================================="
echo ""
echo "This script will guide you through setting up and deploying all Firebase Functions"
echo "for the LeadLines application. It includes configuration setup and deployment."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "Firebase CLI is not installed. Installing globally..."
  npm install -g firebase-tools
else
  echo "Firebase CLI is installed ✅"
fi

# Login to Firebase if not already logged in
echo ""
echo "First, let's make sure you're logged into Firebase..."
firebase login

echo ""
echo "Setting up configuration values..."
echo ""

# Set OpenAI API Key
echo "Enter your OpenAI API key (starts with 'sk-'): "
read -s OPENAI_API_KEY
echo "Setting OpenAI API key..."
npx firebase functions:config:set openai.key="$OPENAI_API_KEY" --project=leadlines-portal

# Set Supabase configuration if needed
echo ""
read -p "Do you want to set up Supabase configuration? (y/n): " SETUP_SUPABASE
if [[ $SETUP_SUPABASE == "y" || $SETUP_SUPABASE == "Y" ]]; then
  echo "Enter your Supabase URL: "
  read SUPABASE_URL
  echo "Enter your Supabase anon key: "
  read -s SUPABASE_KEY
  
  echo "Setting Supabase configuration..."
  npx firebase functions:config:set supabase.url="$SUPABASE_URL" --project=leadlines-portal
  npx firebase functions:config:set supabase.key="$SUPABASE_KEY" --project=leadlines-portal
fi

# Add a test value (useful for testing config access)
echo ""
echo "Setting test configuration value..."
npx firebase functions:config:set test.value="working" --project=leadlines-portal

# Verify configuration
echo ""
echo "Verifying configuration (keys partially hidden for security)..."
npx firebase functions:config:get --project=leadlines-portal | grep -v -E "(key.*|key\":\".*\")"
echo "Full configuration saved but keys hidden for security."

# Change to functions directory
cd /Users/mikelawrence/Cursor/LeadLines-Mark-1-main/functions

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
npm install openai cors @supabase/supabase-js --save

echo ""
echo "============================================="
echo "DEPLOYMENT STRATEGY"
echo "============================================="
echo ""
echo "You can deploy functions in the following ways:"
echo ""
echo "1. Deploy individual functions incrementally to test each one:"
echo "   - ./deploy-config-test.sh     (Test configuration)"
echo "   - ./deploy-auth-test.sh       (Test authentication)"
echo "   - ./deploy-create-thread.sh   (Test OpenAI thread creation)"
echo "   - [Other individual function scripts]"
echo ""
echo "2. Deploy all functions at once (recommended after individual testing):"
echo "   - ./deploy-all.sh"
echo ""
echo "3. Clean deployment (removes all existing functions first):"
echo "   - ./clean-deploy.sh"
echo ""

# Ask how to proceed
read -p "How would you like to proceed? (1=incremental, 2=all, 3=clean): " DEPLOY_OPTION

case $DEPLOY_OPTION in
  1)
    echo ""
    echo "Running incremental deployment..."
    echo ""
    chmod +x *.sh
    ./deploy-config-test.sh
    echo ""
    echo "Configuration test function deployed. Check it at:"
    echo "https://us-central1-leadlines-portal.cloudfunctions.net/configTest"
    echo ""
    echo "If successful, continue with the other deployment scripts."
    ;;
  2)
    echo ""
    echo "Deploying all functions at once..."
    echo ""
    chmod +x deploy-all.sh
    ./deploy-all.sh
    ;;
  3)
    echo ""
    echo "Running clean deployment..."
    echo ""
    chmod +x clean-deploy.sh
    ./clean-deploy.sh
    ;;
  *)
    echo ""
    echo "No deployment option selected. You can manually run the deployment scripts later."
    echo "All scripts have been made executable."
    chmod +x *.sh
    ;;
esac

echo ""
echo "============================================="
echo "SETUP COMPLETE"
echo "============================================="
echo ""
echo "Configuration values have been set and deployment options executed."
echo "If you need to make changes or run additional deployments, use the scripts in the functions directory."
echo ""
echo "For troubleshooting, you can view Firebase Functions logs with:"
echo "npx firebase functions:log --project=leadlines-portal"
echo ""
echo "Thank you for setting up LeadLines Firebase Functions!" 