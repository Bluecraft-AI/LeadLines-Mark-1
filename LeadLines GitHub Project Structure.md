# LeadLines GitHub Project Structure

## Overview

This document outlines the file structure of the LeadLines-Mark-1 GitHub repository. The structure is organized to support a React application with Firebase authentication, Supabase database integration, and various service integrations including Airtable and Instantly.ai.

## Directory Structure

```
LeadLines-Mark-1/
├── .github/                    # GitHub configuration
│   └── workflows/              # GitHub Actions workflows
├── public/                     # Static assets
│   └── assets/
│       └── icons/              # Application icons
├── src/                        # Source code
│   ├── components/             # React components
│   │   ├── agent/              # AI Agent components
│   │   │   └── AgentPage.jsx   # AI Agent interface
│   │   ├── auth/               # Authentication components
│   │   │   ├── Login.jsx       # User login component
│   │   │   └── Register.jsx    # User registration component
│   │   ├── calendar/           # Calendar functionality
│   │   │   └── CalendarEmbed.jsx # Embedded calendar component
│   │   ├── common/             # Shared components
│   │   │   ├── Home.jsx        # Homepage component
│   │   │   ├── MainLayout.jsx  # Main application layout with optimized left sidebar and top panel
│   │   │   └── NotFound.jsx    # 404 page component
│   │   ├── dashboard/          # Dashboard functionality
│   │   │   └── Dashboard.jsx   # Main dashboard component
│   │   ├── forms/              # Form components
│   │   │   ├── csvUpload/      # CSV upload forms
│   │   │   │   └── CSVUploadForm.jsx # CSV file upload component with improved click behavior
│   │   │   ├── emailAccount/   # Email account forms
│   │   │   │   └── EmailSubmissionForm.jsx # Email account submission
│   │   │   └── jobPosting/     # Job posting forms
│   │   │       └── JobPostingForm.jsx # Job posting submission
│   │   ├── profile/            # User profile components
│   │   │   └── Profile.jsx     # User profile management
│   │   ├── submissions/        # Submission management
│   │   │   ├── MappingModal.jsx # Field mapping modal
│   │   │   └── SubmissionsPage.jsx # Submissions listing page with original UI and enhanced display logic
│   │   └── upload/             # CSV Upload section
│   │       └── UploadPage.jsx  # CSV Upload page component
│   ├── config/                 # Configuration files
│   │   ├── airtable.js         # Airtable API configuration
│   │   ├── firebase.js         # Firebase configuration
│   │   └── supabase.js         # Supabase configuration with Firebase auth headers
│   ├── contexts/               # React contexts
│   │   └── AuthContext.jsx     # Authentication context provider
│   ├── db/                     # Database scripts and schemas
│   │   ├── supabase_schema.sql # SQL schema for Supabase database
│   │   ├── supabase_ai_agent_schema.sql # SQL schema for AI Agent tables and RLS policies
│   │   └── firebase_auth_rls_update.sql # SQL for Firebase auth compatible RLS policies
│   ├── services/               # Service integrations
│   │   ├── AirtableService.js  # Airtable API service
│   │   ├── AssistantService.js # Manages OpenAI Assistant interactions with user-specific assistants
│   │   ├── InstantlyService.js # Instantly.ai integration
│   │   ├── OpenAIService.js    # Initializes the OpenAI API client for Assistants API
│   │   ├── SubmissionsService.js # Manages CSV submissions with n8n workflow integration support
│   │   ├── UserService.js      # User management service
│   │   └── WorkflowService.js  # Workflow management service
│   ├── styles/                 # CSS and styling files
│   ├── App.jsx                 # Main application component with routes
│   └── main.jsx                # Application entry point
```

## Key Components

### Authentication

The authentication system uses Firebase for user management and is implemented through:
- `src/contexts/AuthContext.jsx` - Provides authentication state and methods
- `src/components/auth/Login.jsx` - User login interface with auto-redirect for logged-in users
- `src/components/auth/Register.jsx` - User registration interface with auto-redirect for logged-in users

### Navigation and Layout

The application uses a consistent layout structure across all pages:
- `src/components/common/MainLayout.jsx` - Main application layout with:
  - Top panel: Contains the LeadLines button positioned on the left side and AI Agent button on the right
  - LeadLines button: Positioned within the top panel, horizontally aligned above the sidebar
  - Left sidebar: Contains navigation menu items (Dashboard, CSV Upload, Submissions)
  - Profile icon: Positioned at the bottom of the sidebar with dropdown menu
  - Strict scroll containment: Scrolling is strictly contained within the main content area only
  - Responsive design: Optimized for various screen sizes while maintaining alignment

### Routes and Navigation Paths

The application uses the following URL paths:
- `/dashboard` - Main dashboard view
- `/upload` - CSV upload interface with drag-and-drop file upload functionality
- `/submissions` - Workflow submissions management
- `/profile` - User profile management (formerly "Settings")
- `/agent` - AI Agent interface
- `/login` - Login page with auto-redirect for authenticated users
- `/register` - Registration page with auto-redirect for authenticated users

### CSV Upload Functionality

The CSV upload functionality is implemented through:
- `src/components/forms/csvUpload/CSVUploadForm.jsx` - Form component for uploading CSV files with:
  - Improved click behavior: File dialog only opens when clicking the upload area, not elsewhere on the page
  - Drag and drop file upload functionality
  - File type and size validation
  - Multiple file selection
  - Email count specification
  - Additional notes field
  - Form validation and error handling
  - Success/error status messages
- `src/components/upload/UploadPage.jsx` - Page component that integrates the CSV upload form

### Database Integration

Database integration is primarily handled through Supabase with configuration in:
- `src/config/supabase.js` - Supabase client configuration with Firebase auth headers
- `src/db/` - Database schemas and migration scripts
- `src/db/supabase_schema.sql` - SQL schema for Supabase database
- `src/db/supabase_ai_agent_schema.sql` - SQL schema for AI Agent tables and RLS policies
- `src/db/firebase_auth_rls_update.sql` - SQL for Firebase auth compatible RLS policies

### Service Integrations

The application integrates with several external services:
- `src/services/AirtableService.js` - Handles form submissions storage
- `src/services/InstantlyService.js` - Manages email campaign integration
- `src/services/UserService.js` - Manages user profile data
- `src/services/WorkflowService.js` - Handles workflow submission tracking
- `src/services/SubmissionsService.js` - Manages CSV submissions with n8n workflow integration support
- `src/services/AssistantService.js` - Manages OpenAI Assistant interactions with user-specific assistants
- `src/services/OpenAIService.js` - Initializes the OpenAI API client for communication with the Assistants API

### User Interface

The UI is organized into several key areas:
- `src/components/dashboard/Dashboard.jsx` - Main dashboard view
- `src/components/profile/Profile.jsx` - User profile management
- `src/components/submissions/SubmissionsPage.jsx` - Workflow submissions management with original UI and enhanced display logic
- `src/components/agent/AgentPage.jsx` - Full-featured AI Agent chat interface with thread and file management
- `src/components/upload/UploadPage.jsx` - CSV file upload interface

### Forms

The application includes several form components for different purposes:
- `src/components/forms/csvUpload/CSVUploadForm.jsx` - CSV file upload for email sequence generation
- `src/components/forms/emailAccount/EmailSubmissionForm.jsx` - Email account submission
- `src/components/forms/jobPosting/JobPostingForm.jsx` - Job posting campaign creation

### CSV Upload and Processing

- `src/components/upload/UploadPage.jsx` - Container for CSV upload functionality
- `src/components/forms/csvUpload/CSVUploadForm.jsx` - Form for uploading CSV files
- `src/components/submissions/SubmissionsPage.jsx` - Page for viewing and managing submissions with original UI and enhanced display logic
- `src/services/SubmissionsService.js` - Service for managing submissions with n8n workflow integration

## Routing Structure

The application uses React Router with the following main routes:

- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/upload` - CSV upload page
- `/submissions` - Submissions listing page
- `/profile` - User profile page
- `/agent` - AI Agent page

## Recent Updates

- **File Fix** - Fixed File object handling in SubmissionsService to properly extract file names and prevent upload errors. Fixed path structure to match actual storage layout: `{{user ID}}/{{submission ID}}/{{file name}}`. Fixed download functionality to handle paths with or without the 'csv-files/' prefix. Ensured SubmissionsService is exported as a singleton for consistent usage across components. Implemented enhanced error handling and logging for troubleshooting. Maintained compatibility with n8n workflows and seamless data flow between all components.
- **Path Structure Fix** - Fixed file path structure issues in CSV upload and download functionality. Updated `SubmissionsService.js` to use correct path structure: `csv-files/{{user ID}}/{{submission ID}}/{{file name}}`. Added missing `uploadFile` function and ensured compatibility with n8n workflows. Enhanced Supabase configuration to support both Vite and Create React App environment variables. Resolved "uploadFile is not a function" and "Object not found" errors.
- **ID Mapping Fix** - Fixed ID mapping between Supabase tables, storage buckets, and n8n workflows. Implemented maximum permissions for all tables and storage buckets. Added Firebase authentication support without disrupting ID alignment. Fixed download functionality for processed files. Enhanced submission display and file handling.
- **Download Functionality Fix** - Enhanced `SubmissionsPage.jsx` to properly prioritize `processed_file_path` for downloads with fallback to `file_path`. Added `isDownloadAvailable()` helper function and improved error handling in Supabase configuration.
- Enhanced `SubmissionsPage.jsx` to properly display all submissions regardless of file_path status.
- Improved error handling and debugging for submission rendering.
- Fixed UI rendering for submissions with NULL/MISSING file paths.
- Added detailed logging for submission data retrieval and display.
- Implemented permissive Supabase policies for Firebase authentication.
- Enhanced SubmissionsService.js to handle NULL file_path values for n8n workflow integration
- Added Firebase authentication headers to Supabase client for seamless integration
- Updated RLS policies to work with Firebase authenticated users
- Fixed CSV Upload functionality to properly work with Firebase authentication
- Fixed Submissions section to correctly display user data
- Ensured AI Agent section properly shows assistants associated with user accounts
- Added OpenAI API integration for AI Agent functionality
- Implemented real-time AI chat with the OpenAI Assistants API
- Added AI Agent implementation with user-specific assistants and chat interface
- Implemented thread management for AI conversations
- Added file upload functionality for AI Assistants
- Created database schema with Row Level Security for AI Agent data
- Added CSV Upload to Submissions workflow with Supabase integration
- Implemented submission tracking, status updates, and file storage
- Added search functionality to Submissions page
- Added submission name editing capability
- Implemented download functionality for processed files with path normalization
- Moved sidebar from right to left side
- Updated UI layout and navigation
- Fixed scroll containment within panels
