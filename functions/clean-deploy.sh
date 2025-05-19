#!/bin/bash

# Clean and Deploy Script for Firebase Functions

echo "Step 1: Deleting all existing functions..."
npx firebase functions:delete '*' --force --project=leadlines-portal

echo "Step 2: Installing dependencies..."
npm install

echo "Step 3: Setting test config value..."
npx firebase functions:config:set test.value="working" --project=leadlines-portal

echo "Step 4: Deploying test function..."
npx firebase deploy --only functions:testFunction --project=leadlines-portal

echo "Clean deployment completed!"
echo "You can test the function at: https://us-central1-leadlines-portal.cloudfunctions.net/testFunction" 