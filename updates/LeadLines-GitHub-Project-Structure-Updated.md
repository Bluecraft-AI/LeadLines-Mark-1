# LeadLines GitHub Project Structure

This document provides an overview of the LeadLines project structure, highlighting the key components and their relationships.

## Project Overview

LeadLines is a sales application that hosts automated sales workflows for users to access easily. The application allows users to select from different workflows and fill out forms with target audience criteria.

## Directory Structure

```
LeadLines-Mark-1-main/
├── public/                  # Static assets
├── src/                     # Source code
│   ├── components/          # React components
│   │   ├── agent/           # AI Agent components
│   │   │   ├── AgentPage.jsx           # Main AI Agent page container
│   │   │   └── ChatbotInterface.jsx    # AI chatbot interface component
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── forms/           # Form components
│   │   │   └── csvUpload/   # CSV Upload form components
│   │   │       └── CSVUploadForm.jsx   # CSV Upload form
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components
│   ├── contexts/            # React contexts
│   │   └── AuthContext.js   # Authentication context
│   ├── services/            # Service modules
│   │   ├── AssistantService.js  # AI Assistant service
│   │   └── SupabaseService.js   # Supabase service
│   ├── styles/              # CSS styles
│   │   └── index.css        # Main stylesheet
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main App component
│   └── main.jsx             # Entry point
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── tailwind.config.js       # Tailwind CSS configuration
```

## Key Components

### AI Agent Section

The AI Agent section has been updated to use a webhook-based approach for communicating with OpenAI assistants through n8n workflows:

- **AgentPage.jsx**: Simple container component that hosts the ChatbotInterface
- **ChatbotInterface.jsx**: Main component that:
  - Fetches the user's assistant_id from the assistant_users table
  - Provides a chat interface with message history
  - Sends messages to n8n webhook with assistant_id, session ID, and message content
  - Displays responses from the assistant

### CSV Upload Section

The CSV Upload section allows users to upload CSV files for processing:

- **CSVUploadForm.jsx**: Form component that:
  - Handles file selection and validation
  - Collects submission name (formerly notes)
  - Uploads files to storage
  - Sends data to webhook for processing
  - Creates records in the csv_submissions table

## Database Structure

### Supabase Tables

1. **csv_submissions**:
   - `id` (uuid): Primary identifier
   - `user_id` (text): Firebase user ID
   - `user_email` (text): User's email address
   - `custom_name` (text): Editable name for the submission
   - `original_filename` (text): Original file name when uploaded
   - `status` (text): Processing status
   - `email_count` (int4): Number of emails
   - `file_path` (text): Original upload file path
   - `processed_file_path` (text): Path to processed file
   - `created_at` (timestamptz): Creation timestamp
   - `updated_at` (timestamptz): Update timestamp

2. **assistant_users**:
   - `id` (int4): Auto-incrementing ID
   - `user_id` (text): Firebase user ID
   - `assistant_id` (text): OpenAI assistant ID
   - `created_at` (timestamptz): Creation timestamp
   - `last_accessed_at` (timestamptz): Last access timestamp
   - `metadata` (jsonb): JSON metadata
   - `status` (text): Status with default 'active'

3. **users**:
   - `id` (uuid): Primary key
   - `email` (text): User's email address
   - `full_name` (text): User's full name
   - `company` (text): User's company
   - `role` (text): User's role
   - `firebase_uid` (text): Firebase user ID
   - `created_at` (timestamptz): Creation timestamp

4. **user_settings**:
   - `id` (uuid): Primary key
   - `firebase_uid` (text): Foreign key to users.firebase_uid
   - `notifications` (jsonb): Notification preferences
   - `integrations` (jsonb): Integration settings
   - `created_at` (timestamptz): Creation timestamp
   - `updated_at` (timestamptz): Update timestamp
   - `phone` (text): User's phone number

## Recent Updates

### AI Agent UI Update v12
- Eliminated gaps between banners and container edges
- Prevented messages from being visible in gap areas when scrolling
- Maintained transparent header and footer with no shadows or borders
- Improved scroll experience with proper padding and conditional visibility
- Enhanced banner integration with the parent container
- Ensured seamless visual flow when scrolling through messages

### CSV Upload Form Update
- Changed "Additional Notes" field to "Submission Name"
- Connected this field to the custom_name column in the database
- Converted from multi-line textarea to single-line input
- Updated webhook URL
