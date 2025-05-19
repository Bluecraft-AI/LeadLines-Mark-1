# LeadLines GitHub Project Structure

## Overview

This document outlines the file structure of the LeadLines-Mark-1 GitHub repository. The structure is organized to support a React application with Firebase authentication, Firebase Functions for secure API integration, Supabase database integration, and various service integrations including OpenAI Assistants API.

## Directory Structure

```
LeadLines-Mark-1/
├── .github/                    # GitHub configuration
│   └── workflows/              # GitHub Actions workflows
├── docs/                       # Documentation
│   ├── FIREBASE_FUNCTIONS_IMPLEMENTATION.md # Documentation for Firebase Functions implementation
│   ├── FIREBASE_FUNCTIONS_SETUP.md # Setup guide for Firebase Functions
│   └── OpenAI_API_Key_Integration.md # Guide for integrating OpenAI API keys
├── firebase/                   # Firebase configuration
│   ├── .firebaserc             # Firebase project configuration
│   └── firebase.json           # Firebase deployment configuration
├── functions/                  # Firebase Cloud Functions
│   ├── index.js                # Main Firebase Functions implementation
│   ├── package.json            # Functions dependencies
│   ├── deploy-all.sh           # Deployment script for all functions
│   └── README.md               # Functions documentation
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
│   │   │   └── SubmissionsPage.jsx # Submissions listing page
│   │   └── upload/             # CSV Upload section
│   │       └── UploadPage.jsx  # CSV Upload page component
│   ├── config/                 # Configuration files
│   │   ├── credentials.js      # Centralized credentials management
│   │   ├── firebase.js         # Firebase configuration
│   │   └── supabase.js         # Supabase configuration
│   ├── contexts/               # React contexts
│   │   └── AuthContext.jsx     # Authentication context provider
│   ├── db/                     # Database scripts and schemas
│   │   ├── supabase_ai_agent_schema.sql # Schema for AI Agent tables and RLS policies
│   │   └── supabase_schema.sql # Main Supabase database schema
│   ├── services/               # Service integrations
│   │   ├── AirtableService.js  # Airtable API service
│   │   ├── AssistantService.js # OpenAI Assistants API integration
│   │   ├── InstantlyService.js # Instantly.ai integration
│   │   ├── OpenAIService.js    # OpenAI API client initialization
│   │   ├── SubmissionsService.js # Submissions management service
│   │   ├── UserService.js      # User management service
│   │   └── WorkflowService.js  # Workflow management service
│   ├── styles/                 # CSS and styling files
│   ├── App.jsx                 # Main application component with routes
│   └── main.jsx                # Application entry point
└── README.md                   # Project overview and setup instructions
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
- `src/config/supabase.js` - Supabase client configuration
- `src/db/` - Database schemas and migration scripts
- `src/db/supabase_schema.sql` - SQL schema for Supabase database
- `src/db/supabase_ai_agent_schema.sql` - SQL schema for AI Agent tables and RLS policies

### AI Agent Integration

The AI Agent functionality is implemented through:
- `src/components/agent/AgentPage.jsx` - Full-featured AI Agent chat interface
- `src/services/AssistantService.js` - Service for interacting with OpenAI Assistants API
- `src/services/OpenAIService.js` - OpenAI API client initialization
- `functions/index.js` - Firebase Functions for secure OpenAI API integration
- `src/db/supabase_ai_agent_schema.sql` - Database schema for AI Agent data

### Firebase Functions Backend

The application uses Firebase Functions for secure backend operations:
- `functions/index.js` - Main implementation of all Firebase Functions
- `functions/deploy-all.sh` - Script for deploying all functions
- `docs/FIREBASE_FUNCTIONS_IMPLEMENTATION.md` - Documentation for the Firebase Functions implementation
- `docs/FIREBASE_FUNCTIONS_SETUP.md` - Guide for setting up Firebase Functions
- `docs/OpenAI_API_Key_Integration.md` - Guide for securely integrating OpenAI API keys

### Service Integrations

The application integrates with several external services:
- `src/services/AirtableService.js` - Handles form submissions storage
- `src/services/InstantlyService.js` - Manages email campaign integration
- `src/services/UserService.js` - Manages user profile data
- `src/services/WorkflowService.js` - Handles workflow submission tracking
- `src/services/SubmissionsService.js` - Manages CSV submissions with file path normalization for improved download functionality
- `src/services/AssistantService.js` - Manages OpenAI Assistant interactions with user-specific assistants

### User Interface

The UI is organized into several key areas:
- `src/components/dashboard/Dashboard.jsx` - Main dashboard view
- `src/components/profile/Profile.jsx` - User profile management
- `src/components/submissions/SubmissionsPage.jsx` - Workflow submissions management
- `src/components/agent/AgentPage.jsx` - Full-featured AI Agent chat interface with thread and file management
- `src/components/upload/UploadPage.jsx` - CSV file upload interface

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

- Reorganized project structure for better organization and maintainability
- Created dedicated folders for documentation and Firebase configuration
- Implemented secure Firebase Functions backend for OpenAI API integration
- Centralized credentials management for enhanced security
- Removed redundant deployment scripts and system artifacts
- Added comprehensive documentation for Firebase Functions setup and implementation
- Improved OpenAI API key integration with server-side security
- Organized AI Agent implementation files into appropriate directories
- Consolidated Firebase configuration files
