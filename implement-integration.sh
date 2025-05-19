#!/bin/bash

# LeadLines Firebase-Supabase Integration Implementation Script
# This script automates the implementation of the Firebase-Supabase integration update

echo "====================================================================="
echo "LeadLines Firebase-Supabase Integration Implementation Script"
echo "====================================================================="
echo ""

# Step 1: Check if SQL migration file exists
SQL_FILE="./updates/src/db/firebase_supabase_integration.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: SQL file not found at $SQL_FILE"
    echo "Please make sure the updates directory is in the project root."
    exit 1
fi

# Step 2: Check if service files exist
ASSISTANT_FILE="./updates/src/services/AssistantService.js"
SUBMISSIONS_FILE="./updates/src/services/SubmissionsService.js"
if [ ! -f "$ASSISTANT_FILE" ] || [ ! -f "$SUBMISSIONS_FILE" ]; then
    echo "❌ Error: Service files not found"
    echo "Please make sure the updates directory is in the project root."
    exit 1
fi

# Step 3: Show implementation plan
echo "This script will implement the Firebase-Supabase integration by:"
echo "1. Backing up your current service files"
echo "2. Replacing the service files with the updated versions"
echo "3. Displaying the SQL migration script for you to run in Supabase"
echo ""
echo "Would you like to proceed? (y/n)"
read -r proceed

if [[ ! "$proceed" =~ ^[Yy]$ ]]; then
    echo "Implementation cancelled."
    exit 0
fi

echo ""
echo "====================================================================="
echo "Step 1: Backing up your current service files"
echo "====================================================================="

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup current service files
cp ./src/services/AssistantService.js "$BACKUP_DIR/AssistantService.js.bak"
cp ./src/services/SubmissionsService.js "$BACKUP_DIR/SubmissionsService.js.bak"

echo "✅ Service files backed up to $BACKUP_DIR"

echo ""
echo "====================================================================="
echo "Step 2: Replacing service files with updated versions"
echo "====================================================================="

# Replace service files
cp "$ASSISTANT_FILE" ./src/services/AssistantService.js
cp "$SUBMISSIONS_FILE" ./src/services/SubmissionsService.js

echo "✅ Service files replaced successfully"

echo ""
echo "====================================================================="
echo "Step 3: SQL Migration Script"
echo "====================================================================="
echo ""
echo "⚠️ IMPORTANT: You need to run the SQL migration script in your Supabase project."
echo ""
echo "Would you like to view the SQL script now? (y/n)"
read -r viewSql

if [[ "$viewSql" =~ ^[Yy]$ ]]; then
    echo ""
    echo "SQL MIGRATION SCRIPT:"
    echo "--------------------"
    cat "$SQL_FILE"
    echo ""
fi

echo "====================================================================="
echo "NEXT STEPS:"
echo "1. Log in to your Supabase project at https://app.supabase.com"
echo "2. Go to the SQL Editor and create a new query"
echo "3. Copy and paste the contents of $SQL_FILE"
echo "4. Run the script to create the auth_mapping table and update RLS policies"
echo ""
echo "After running the SQL script, test the integration by:"
echo "1. Opening your application in a web browser"
echo "2. Logging in with your Firebase account"
echo "3. Opening the browser console"
echo "4. Pasting and running the code from test-integration.js"
echo ""
echo "Implementation completed successfully! ✨"
echo "See IMPLEMENTATION.md for complete documentation."
 