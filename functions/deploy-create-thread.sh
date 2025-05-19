#!/bin/bash

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Deploying createThread function..."
npx firebase deploy --only functions:createThread --project=leadlines-portal

echo "Deployment of createThread function complete!"
echo "You can test the function at: https://us-central1-leadlines-portal.cloudfunctions.net/createThread"
echo "Remember: This endpoint requires a valid Firebase authentication token in the Authorization header (Bearer token)" 