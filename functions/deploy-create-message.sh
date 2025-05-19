#!/bin/bash

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Deploying createMessage function..."
npx firebase deploy --only functions:createMessage --project=leadlines-portal

echo "Deployment of createMessage function complete!"
echo "You can test the function at: https://us-central1-leadlines-portal.cloudfunctions.net/createMessage"
echo "Remember: This endpoint requires:"
echo "1. A valid Firebase authentication token in the Authorization header (Bearer token)"
echo "2. A threadId query parameter"
echo "3. A JSON body with 'content' field (and optional 'role' field)" 