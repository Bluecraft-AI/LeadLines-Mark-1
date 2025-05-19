# Firebase Functions Configuration Guide

## Overview

This document explains how to properly configure and deploy Firebase Functions for the LeadLines project, with a focus on securely managing API keys and other sensitive configuration values.

## Configuration Methods

Firebase Functions v2 provides two main methods for managing configuration:

1. **Secrets** (Recommended): Secure, encrypted values for sensitive data
2. **Environment Variables**: For non-sensitive configuration

## Required Secrets

The following secrets must be set for the LeadLines functions to work properly:

| Secret Name | Description | Required By |
|-------------|-------------|------------|
| `OPENAI_API_KEY` | OpenAI API key for AI Assistant functionality | All OpenAI-related functions |
| `SUPABASE_URL` | Supabase project URL | Database operations |
| `SUPABASE_KEY` | Supabase anon/service key | Database operations |

## Setting Up Secrets

Use the provided script to set up all required secrets:

```bash
# From the functions directory
./set-secrets.sh
```

Or set them manually:

```bash
npx firebase functions:secrets:set OPENAI_API_KEY
npx firebase functions:secrets:set SUPABASE_URL
npx firebase functions:secrets:set SUPABASE_KEY
```

## Verifying Configuration

After setting secrets, you can verify they're correctly configured:

```bash
# Deploy the config test function
./deploy-config-test.sh

# Test the function
curl https://us-central1-leadlines-portal.cloudfunctions.net/configTest

# Check logs for detailed information
npx firebase functions:log
```

## Local Testing Limitations

When testing locally with Firebase Emulators:

- Secrets are not available in the local emulator environment
- The `configTest` function will report all secrets as "missing"
- This is expected behavior and does not indicate a problem with your code
- In production deployment, Firebase will inject these secrets automatically

## Deployment

Once all secrets are set, deploy all functions:

```bash
./deploy-all.sh
```

## Troubleshooting

If you encounter "Precondition failed" errors during deployment:

1. Verify all secrets are set correctly using:
   ```bash
   npx firebase functions:secrets:list
   ```
2. Check the logs for specific error messages:
   ```bash
   npx firebase functions:log
   ```
3. Ensure you're using the correct Firebase project
4. Try deploying a single function first to isolate issues:
   ```bash
   npx firebase deploy --only functions:configTest
   ```

## Function URLs

After deployment, functions are available at:

- `https://us-central1-leadlines-portal.cloudfunctions.net/[functionName]`

Remember that all functions require Firebase authentication (except test functions).
