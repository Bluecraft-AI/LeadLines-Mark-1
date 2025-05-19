#!/bin/bash

echo "Starting full deployment of all Firebase Functions..."

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Deploying all functions..."
npx firebase deploy --only functions --project=leadlines-portal

echo "Full deployment complete!"
echo "The following functions are now available:"
echo "- testFunction: https://us-central1-leadlines-portal.cloudfunctions.net/testFunction"
echo "- configTest: https://us-central1-leadlines-portal.cloudfunctions.net/configTest"
echo "- authTest: https://us-central1-leadlines-portal.cloudfunctions.net/authTest"
echo "- createThread: https://us-central1-leadlines-portal.cloudfunctions.net/createThread"
echo "- createMessage: https://us-central1-leadlines-portal.cloudfunctions.net/createMessage"
echo "- runAssistant: https://us-central1-leadlines-portal.cloudfunctions.net/runAssistant"
echo "- getRun: https://us-central1-leadlines-portal.cloudfunctions.net/getRun"
echo "- listMessages: https://us-central1-leadlines-portal.cloudfunctions.net/listMessages"
echo "- uploadFile: https://us-central1-leadlines-portal.cloudfunctions.net/uploadFile"
echo "- attachFileToAssistant: https://us-central1-leadlines-portal.cloudfunctions.net/attachFileToAssistant"
echo "- deleteFile: https://us-central1-leadlines-portal.cloudfunctions.net/deleteFile"
echo "- removeFileFromAssistant: https://us-central1-leadlines-portal.cloudfunctions.net/removeFileFromAssistant"
echo "- deleteThread: https://us-central1-leadlines-portal.cloudfunctions.net/deleteThread"
echo "- sendMessageAndWaitForResponse: https://us-central1-leadlines-portal.cloudfunctions.net/sendMessageAndWaitForResponse"
echo ""
echo "Remember: All functions require a valid Firebase authentication token in the Authorization header."
echo "View logs using: npx firebase functions:log" 