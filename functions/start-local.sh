#!/bin/bash

# Local Development Setup Script for Firebase Functions

echo "Getting Firebase config for local emulation..."
firebase functions:config:get > .runtimeconfig.json

echo "Starting Firebase Functions emulator..."
firebase emulators:start --only functions

# Note: This script will be interrupted when you press Ctrl+C to stop the emulator
# The .runtimeconfig.json file will remain for future use 