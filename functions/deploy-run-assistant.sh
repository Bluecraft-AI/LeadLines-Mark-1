#!/bin/bash

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Deploying runAssistant function..."
npx firebase deploy --only functions:runAssistant --project=leadlines-portal

echo "Deployment of runAssistant function complete!"
echo "You can test the function at: https://us-central1-leadlines-portal.cloudfunctions.net/runAssistant"
echo "Remember: This endpoint requires:"
echo "1. A valid Firebase authentication token in the Authorization header (Bearer token)"
echo "2. A threadId query parameter"
echo "3. A JSON body with 'assistantId' field" 