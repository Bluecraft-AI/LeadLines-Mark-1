# Firebase-Supabase Integration Implementation Guide

This guide outlines the steps to implement the Firebase to Supabase integration update for LeadLines, ensuring consistent user identification across all features.

## Overview

The integration solves the challenge of different user ID formats between Firebase and Supabase:
- Firebase uses string UIDs (like `qU7tnMvaujO2htWovBnQ6mbT6it1`)
- Some Supabase tables expect UUID format (like `123e4567-e89b-12d3-a456-426614174000`)

This update provides a mapping solution that maintains compatibility with both systems.

## Implementation Steps

### 1. Run the SQL Migration Script

First, you'll need to run the provided SQL migration script in your Supabase SQL editor:

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of the file from `/updates/src/db/firebase_supabase_integration.sql`
4. Execute the script

This SQL script performs the following:
- Creates an `auth_mapping` table to store the relationship between Firebase UIDs and Supabase UUIDs
- Adds helper functions for mapping between the two ID formats
- Updates RLS policies to work with Firebase authentication
- Adds your AI Assistant to the database

### 2. Update the Service Files

Replace the existing service files with the updated versions:

1. Replace `/src/services/AssistantService.js` with the version from `/updates/src/services/AssistantService.js`
2. Replace `/src/services/SubmissionsService.js` with the version from `/updates/src/services/SubmissionsService.js`

### 3. Testing

After implementation, thoroughly test the integration:

1. Log in to LeadLines
2. Navigate to the AI Agent section to verify your assistant is accessible
3. Create a new thread and send messages to test the integration
4. Test CSV submission functionality to ensure it still works correctly
5. Check that authentication and access control work properly across features

### 4. Troubleshooting

If you encounter issues:

#### Database Issues
- Check that the `auth_mapping` table was created by running this SQL:
  ```sql
  SELECT * FROM auth_mapping;
  ```

- Test the helper functions:
  ```sql
  SELECT get_or_create_supabase_uuid('your-firebase-uid', 'your-email@example.com');
  ```

#### Authentication Issues
- Check browser console for errors
- Verify that Firebase authentication is working correctly
- Make sure the RLS policies are properly set by running:
  ```sql
  SELECT * FROM pg_policies WHERE tablename IN ('assistant_threads', 'user_assistants', 'assistant_files');
  ```

## Technical Details

### AssistantService.js Changes
- Added `getSupabaseUuid()` method to obtain or create a Supabase UUID for the current Firebase user
- Updated all database operations to use this mapping function before interacting with tables that require UUID format

### SubmissionsService.js
- Maintained direct use of Firebase UIDs since the `csv_submissions` table uses TEXT format for user_id

### Security Considerations
- The integration preserves all Row Level Security (RLS) policies
- Authentication remains secure through Firebase
- Data access control is maintained and enforced consistently 