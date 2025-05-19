#!/bin/bash

# Deploy Auth Test Function Script

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Deploying authTest function..."
npx firebase deploy --only functions:authTest --project=leadlines-portal

echo "Deployment completed!"
echo "You can test the function at: https://us-central1-leadlines-portal.cloudfunctions.net/authTest"
echo "Note: You'll need to include a valid Firebase authentication token in your request." 