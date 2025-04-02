# LeadLines Portal Implementation

This document provides instructions for testing and deploying the LeadLines portal with the custom domain app.leadlines.ai.

## Project Overview

LeadLines Portal is a React-based web application that provides a platform for efficient job posting and candidate management. The application includes:

- User authentication (login/register)
- Dashboard for managing job postings
- Job posting form with real-time cost estimation
- User profile management
- Custom domain support (app.leadlines.ai)

## Local Development

To run the application locally:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Building for Production

To build the application for production:

```
npm run build
```

This will create a `dist` directory with the production-ready files.

## Deployment

The application is configured for automatic deployment to GitHub Pages using GitHub Actions. When you push changes to the `main` branch, the GitHub Actions workflow will:

1. Build the application
2. Deploy it to the `gh-pages` branch
3. Configure it to use the custom domain app.leadlines.ai

### Custom Domain Setup

The application is configured to use the custom domain app.leadlines.ai. To complete the setup:

1. In your domain registrar, create a CNAME record pointing `app.leadlines.ai` to `<your-github-username>.github.io`
2. Wait for DNS propagation (may take up to 24 hours)

## Repository Structure

```
LeadLines-Mark-1/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── CNAME
│   └── 404.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── common/
│   │   │   ├── Home.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── NotFound.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── forms/
│   │   │   └── jobPosting/
│   │   │       └── JobPostingForm.jsx
│   │   └── profile/
│   │       └── Profile.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Features

### Authentication
- User registration and login
- Protected routes for authenticated users
- Authentication state management with React Context

### Dashboard
- Overview of job posting statistics
- List of active job postings
- Actions to manage job postings

### Job Posting Form
- Comprehensive form for creating job postings
- Real-time cost estimation based on filter criteria
- Form validation using Formik and Yup

### Profile Management
- User profile information editing
- Account security settings
- Notification preferences

## Technologies Used

- React 18
- Vite
- React Router v6
- Tailwind CSS
- Formik & Yup for form handling
- GitHub Actions for CI/CD
- GitHub Pages for hosting
