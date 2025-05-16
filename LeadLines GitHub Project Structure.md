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
│   │   │   ├── MainLayout.jsx  # Main application layout with left sidebar and top panel
│   │   │   └── NotFound.jsx    # 404 page component
│   │   ├── dashboard/          # Dashboard functionality
│   │   │   └── Dashboard.jsx   # Main dashboard component
│   │   ├── forms/              # Form components
│   │   │   ├── emailAccount/   # Email account forms
│   │   │   │   └── EmailSubmissionForm.jsx # Email account submission
│   │   │   └── jobPosting/     # Job posting forms
│   │   │       └── JobPostingForm.jsx # Job posting submission (used for CSV Upload)
│   │   ├── profile/            # User profile components
│   │   │   └── Profile.jsx     # User profile management
│   │   └── submissions/        # Submission management
│   │       ├── MappingModal.jsx # Field mapping modal
│   │       └── SubmissionsPage.jsx # Submissions listing page
│   ├── config/                 # Configuration files
│   │   ├── airtable.js         # Airtable API configuration
│   │   ├── firebase.js         # Firebase configuration
│   │   └── supabase.js         # Supabase configuration
│   ├── contexts/               # React contexts
│   │   └── AuthContext.jsx     # Authentication context provider
│   ├── db/                     # Database scripts and schemas
│   ├── services/               # Service integrations
│   │   ├── AirtableService.js  # Airtable API service
│   │   ├── InstantlyService.js # Instantly.ai integration
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
  - Top panel: Contains "LeadLines" button linking to dashboard (left) and "AI Agent" button (right)
  - Left sidebar: Contains navigation links in descending order (Dashboard, CSV Upload, Submissions) and profile icon at bottom
  - Contained scrolling: Main content area has its own scrolling independent of the top panel and sidebar
  - Improved sidebar width: Sidebar width is optimized for better text readability and content fitting
  - Dynamic dropdown: Profile dropdown is contained within the sidebar width

### Routes and Navigation Paths

The application uses the following URL paths:
- `/dashboard` - Main dashboard view
- `/upload` - CSV upload interface (uses JobPostingForm component)
- `/submissions` - Workflow submissions management
- `/profile` - User profile management (formerly "Settings")
- `/agent` - AI Agent interface
- `/login` - Login page with auto-redirect for authenticated users
- `/register` - Registration page with auto-redirect for authenticated users

### Database Integration

Database integration is primarily handled through Supabase with configuration in:
- `src/config/supabase.js` - Supabase client configuration
- `src/db/` - Database schemas and migration scripts

### Service Integrations

The application integrates with several external services:
- `src/services/AirtableService.js` - Handles form submissions storage
- `src/services/InstantlyService.js` - Manages email campaign integration
- `src/services/UserService.js` - Manages user profile data
- `src/services/WorkflowService.js` - Handles workflow submission tracking

### User Interface

The UI is organized into several key areas:
- `src/components/dashboard/Dashboard.jsx` - Main dashboard view
- `src/components/profile/Profile.jsx` - User profile management
- `src/components/submissions/SubmissionsPage.jsx` - Workflow submissions management
- `src/components/agent/AgentPage.jsx` - AI Agent interface

### Forms

The application includes several form components for different purposes:
- `src/components/forms/emailAccount/EmailSubmissionForm.jsx` - Email account submission
- `src/components/forms/jobPosting/JobPostingForm.jsx` - Job posting campaign creation (used for CSV Upload)

## Development Notes

- The application is built using React with a component-based architecture
- Authentication is handled through Firebase
- Data persistence uses Supabase as the primary database
- External service integrations include Airtable, Instantly.ai, and potentially others
- The UI follows a consistent design pattern with a left sidebar and top panel visible on all sections
- Navigation is organized with Dashboard, CSV Upload, and Submissions in the sidebar, and AI Agent in the top panel
- Scrolling is contained within the main content area for better user experience
