# LeadLines Authentication Fix Guide

## Overview

This update fixes the CSV upload functionality by properly synchronizing Firebase authentication with Supabase. The issue was that the frontend was using Firebase authentication, but the Supabase Row Level Security (RLS) policies require that the Supabase session's `auth.uid()` matches the `user_id` field in the database.

## Files Included

1. `src/services/AuthService.js` - New service that handles authentication synchronization
2. `src/services/SubmissionsService.js` - Updated service that uses the AuthService
3. `src/config/supabase.js` - Updated configuration with Firebase-Supabase token synchronization

## Implementation Steps

1. Copy the updated files to your project, replacing the existing ones
2. Restart your application
3. Test the CSV upload functionality

## Technical Details

### The Problem

The CSV upload was failing with an RLS policy violation error:
```
new row violates row-level security policy for table "csv_submissions"
```

This occurred because:
- The frontend was using Firebase authentication (auth.currentUser.uid)
- The Supabase RLS policy requires that auth.uid() (from Supabase's session) matches the user_id field
- There was no synchronization between Firebase and Supabase authentication

### The Solution

The fix implements a robust authentication flow that:

1. Listens for Firebase authentication state changes
2. When a user signs in to Firebase, it gets the Firebase ID token
3. Uses this token to authenticate with Supabase
4. Ensures all Supabase operations have a valid session before execution

This ensures that when you insert a row with `user_id: auth.currentUser.uid`, the Supabase RLS policy will allow it because `auth.uid()` in Supabase now matches the Firebase UID.

## Compatibility

This fix is compatible with:
- All modern browsers
- Both older and newer versions of the Supabase JavaScript client
- Your existing Firebase authentication setup

## Troubleshooting

If you encounter any issues:

1. Check the browser console for authentication errors
2. Ensure the Firebase user is properly authenticated
3. Verify that the Supabase client is initialized correctly
4. Make sure the storage bucket 'csv-files' exists in your Supabase project

For any persistent issues, please contact support.
