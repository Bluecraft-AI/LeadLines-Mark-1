#!/bin/bash

# LeadLines User Identity Fix Implementation Script
# This script automates the update process for the LeadLines User Identity Fix

echo "====================================================================="
echo "LeadLines User Identity Fix Implementation Script"
echo "====================================================================="
echo ""

# Step 1: Check if update files exist
SQL_FILE="./updates/src/db/supabase_auth_mapping_fix.sql"
ASSISTANT_FILE="./updates/src/services/AssistantService.js"
SUBMISSIONS_FILE="./updates/src/services/SubmissionsService.js"
AGENT_PAGE_FILE="./updates/src/components/agent/AgentPage.jsx"

if [ ! -f "$SQL_FILE" ] || [ ! -f "$ASSISTANT_FILE" ] || [ ! -f "$SUBMISSIONS_FILE" ] || [ ! -f "$AGENT_PAGE_FILE" ]; then
    echo "❌ Error: Required update files not found"
    echo "Please make sure the updates directory is in the project root with all necessary files."
    exit 1
fi

# Step 2: Show implementation plan
echo "This script will implement the User Identity Fix by:"
echo "1. Backing up your current files"
echo "2. Replacing service files and components with the updated versions"
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
echo "Step 1: Backing up your current files"
echo "====================================================================="

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups/identity_fix_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/services"
mkdir -p "$BACKUP_DIR/components/agent"

# Backup current files
cp ./src/services/AssistantService.js "$BACKUP_DIR/services/"
cp ./src/services/SubmissionsService.js "$BACKUP_DIR/services/"

if [ -f "./src/components/agent/AgentPage.jsx" ]; then
    cp ./src/components/agent/AgentPage.jsx "$BACKUP_DIR/components/agent/"
fi

echo "✅ Files backed up to $BACKUP_DIR"

echo ""
echo "====================================================================="
echo "Step 2: Replacing files with updated versions"
echo "====================================================================="

# Replace service files
cp "$ASSISTANT_FILE" ./src/services/
cp "$SUBMISSIONS_FILE" ./src/services/

# Create directories if they don't exist
mkdir -p ./src/components/agent

# Replace component files
cp "$AGENT_PAGE_FILE" ./src/components/agent/

echo "✅ Files replaced successfully"

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
    echo "SQL MIGRATION SCRIPT (first part):"
    echo "--------------------"
    head -n 50 "$SQL_FILE"
    echo ""
    echo "... (script continues) ..."
    echo ""
fi

echo "====================================================================="
echo "NEXT STEPS:"
echo "1. Log in to your Supabase project at https://app.supabase.com"
echo "2. Go to the SQL Editor and create a new query"
echo "3. Copy and paste the contents of $SQL_FILE"
echo "4. Run the script to fix the user identity mapping and update RLS policies"
echo ""
echo "After running the SQL script, test the application by:"
echo "1. Opening your application in a web browser"
echo "2. Logging in with your Firebase account"
echo "3. Verifying that you can see your submissions and interact with your AI Assistant"
echo ""
echo "Implementation completed successfully! ✨"
echo "=====================================================================" 