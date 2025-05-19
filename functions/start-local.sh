#!/bin/bash

echo "===================================="
echo "Starting Firebase Functions Emulator"
echo "===================================="
echo ""

echo "Step 1: Getting Firebase configuration for local emulation..."
npx firebase functions:config:get --project=leadlines-portal > .runtimeconfig.json
echo "Configuration saved to .runtimeconfig.json"

echo ""
echo "Step 2: Starting Firebase Functions emulator..."
echo "This will allow you to test functions locally without deploying them."
echo "Access the emulator UI at http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop the emulator when you're done."
echo ""

npx firebase emulators:start --only functions --project=leadlines-portal

# Note: This script will be interrupted when you press Ctrl+C to stop the emulator
# The .runtimeconfig.json file will remain for future use 