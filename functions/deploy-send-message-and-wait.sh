#!/bin/bash

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Deploying sendMessageAndWaitForResponse function..."
npx firebase deploy --only functions:sendMessageAndWaitForResponse --project=leadlines-portal

echo "Deployment of sendMessageAndWaitForResponse function complete!"
echo "You can test the function at: https://us-central1-leadlines-portal.cloudfunctions.net/sendMessageAndWaitForResponse"
echo "Remember: This endpoint requires:"
echo "1. A valid Firebase authentication token in the Authorization header (Bearer token)"
echo "2. A threadId query parameter"
echo "3. A JSON body with 'message' and 'assistantId' fields"
echo "NOTE: This function has a timeout of 9 minutes, which should be sufficient for most assistant responses." 