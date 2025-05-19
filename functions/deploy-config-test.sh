#!/bin/bash

# This script creates a test deployment of the configTest function
# to verify that secrets and configuration are working correctly

echo "Deploying the configTest function to verify configuration..."

# Deploy only the configTest function
npx firebase deploy --only functions:configTest --project=leadlines-portal

echo "ConfigTest function deployed!"
echo "You can test it at: https://us-central1-leadlines-portal.cloudfunctions.net/configTest"
echo "Check the logs with: npx firebase functions:log"
