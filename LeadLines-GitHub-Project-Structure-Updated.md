# LeadLines GitHub Project Structure

## Overview

This document provides a comprehensive overview of the LeadLines Mark 1 project structure, including all key files, components, and their relationships. This structure reflects the latest updates including the new n8n-integrated AI chatbot and the unified ID mapping strategy implemented across all components.

## Project Structure

```
LeadLines-Mark-1/
├── public/                  # Static assets
│   ├── assets/              # Images, icons, etc.
│   └── index.html           # Main HTML file
├── src/                     # Source code
│   ├── components/          # React components
│   │   ├── agent/           # AI Agent components
│   │   │   ├── AgentPage.jsx        # Simplified AI Agent page (new baseline)
│   │   │   └── ChatbotInterface.jsx # n8n-integrated chatbot interface
│   │   ├── forms/           # Form components
│   │   │   └── csvUpload/   # CSV upload form components
│   │   │       └── CSVUploadForm.jsx  # CSV upload form with Submission Name field
│   │   ├── profile/         # Profile components
│   │   │   └── Profile.jsx  # User profile management
│   │   └── submissions/     # Submissions components
│   │       └── SubmissionsPage.jsx  # Submissions display and management
│   ├── config/              # Configuration files
│   │   ├── firebase.js      # Firebase configuration
│   │   └── supabase.js      # Supabase configuration
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication context
│   ├── db/                  # Database scripts
│   │   └── max_permissions.sql  # SQL for maximum permissions
│   ├── services/            # Service modules
│   │   ├── AssistantService.js  # AI assistant service
│   │   └── SubmissionsService.js  # Submissions management service
│   ├── App.jsx              # Main application component
│   └── main.jsx             # Application entry point
├── standalone-chatbot.html  # Standalone HTML version of the chatbot
├── package.json             # Project dependencies
└── vite.config.js           # Vite configuration
```

## Key Components

### Authentication

- **AuthContext.jsx**: Manages Firebase authentication and user state
  - Handles user login/logout
  - Creates user records in Supabase on first login
  - Provides user context to all components

### CSV Upload

- **CSVUploadForm.jsx**: Handles CSV file uploads
  - Creates submission records in csv_submissions table
  - Uploads files to storage with path: `{{user_id}}/{{submission_id}}/{{filename}}`
  - Uses SubmissionsService.js for database and storage operations
  - **Updated**: Now uses "Submission Name" field for custom_name instead of "Additional Notes"
  - **Updated**: Webhook URL updated to correct endpoint

### AI Agent

- **AgentPage.jsx**: Simplified container for AI Agent functionality
  - **Updated**: Now only includes the ChatbotInterface component
  - **Updated**: Serves as the new baseline for the AI Agent section
  - **Updated**: File upload and thread list functionality removed for now

- **ChatbotInterface.jsx**: n8n-integrated chatbot interface
  - Fetches user's assistant_id from assistant_users table
  - Sends messages to n8n webhook with assistant_id, session ID, and message
  - Styled to match LeadLines branding
  - **Updated**: Clean UI with only "AI Agent" heading visible
  - **Updated**: No session ID or assistant ID displayed in the interface

### Submissions Management

- **SubmissionsPage.jsx**: Displays and manages submissions
  - Lists all submissions for the current user
  - Provides download links for original and processed files
  - Shows processing status and submission details
  - Uses SubmissionsService.js for data retrieval and file downloads

### Profile Management

- **Profile.jsx**: Manages user profile information
  - Displays and updates user data from users table
  - Shows loading state during data fetch
  - Creates user records if they don't exist
  - Uses Firebase UID for user identification

## Services

### AssistantService.js

- Handles all operations related to AI assistants:
  - Fetching user's assistant from assistant_users table
  - Creating and managing assistant threads
  - Storing assistant files
  - Processing user queries
  - Uses Firebase UID for user identification

### SubmissionsService.js

- Handles all operations related to CSV submissions:
  - Creating submission records
  - Uploading files to storage
  - Retrieving submissions
  - Generating download URLs
  - Uses Firebase UID for user identification

## Database Structure

### Tables

- **csv_submissions**: Stores CSV upload information
  - **Updated**: Now uses custom_name field for submission name instead of notes field
- **users**: Stores user profile information
  - Contains email, full_name, company, role, firebase_uid
- **user_settings**: Stores user preferences and settings
  - Contains notifications, integrations, phone
  - Foreign key relationship to users.firebase_uid
- **assistant_users**: Stores relationship between users and AI assistants
  - Contains user_id, assistant_id, metadata
  - Formerly named user_assistants

### ID Mapping

All tables use Firebase UID as the primary identifier for user data, ensuring consistent mapping across the application.

## Storage Structure

- **csv-files**: Bucket for CSV files
  - Path structure: `{{user_id}}/{{submission_id}}/{{filename}}`
  - Processed files: `csv-files/{{user_id}}/{{submission_id}}/{{processed_filename}}`

## Security Model

- RLS is disabled for all tables for maximum permissions
- Storage has a permissive policy allowing all operations

## Recent Updates

1. **New AI Chatbot Integration**
   - Added n8n webhook integration for AI assistant
   - Created new ChatbotInterface.jsx component
   - Added standalone HTML version of chatbot
   - Implemented assistant_id fetching and inclusion in webhook payload
   - **Updated**: Created simplified AgentPage.jsx as new baseline
   - **Updated**: Removed session ID and assistant ID from UI
   - **Updated**: Clean interface with only "AI Agent" heading

2. **Updated CSV Upload Form**
   - Changed "Additional Notes" field to "Submission Name" field
   - Changed from multi-line textarea to single-line input
   - Connected field to custom_name in database instead of notes
   - Updated webhook URL to correct endpoint
   - Maintained original filename fallback behavior

3. Fixed CSV Upload and Download functionality
   - Corrected argument order in uploadFile function
   - Improved download UX to avoid opening new tabs

4. Fixed Profile section
   - Updated to use correct Supabase tables
   - Implemented proper loading states
   - Added error handling and user record creation

5. Implemented unified ID mapping strategy
   - Using Firebase UID across all tables
   - Consistent path structure in storage
   - Seamless integration between components 