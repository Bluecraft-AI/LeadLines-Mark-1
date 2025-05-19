# LeadLines Firebase Functions

This directory contains Firebase Cloud Functions for the LeadLines application, providing a secure backend for OpenAI API integration.

## Recent Updates

The Firebase Functions implementation has been updated to properly use Firebase Functions v2 configuration and secrets handling:

1. **Secrets Management**: All functions now use the proper secrets declaration for sensitive data
2. **Enhanced Error Handling**: Improved error handling for missing configuration values
3. **Runtime Logging**: Added detailed runtime logging for easier troubleshooting
4. **Updated Documentation**: Added comprehensive documentation for configuration

## Setup and Deployment

### Prerequisites

- Node.js 18 or higher recommended
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created and configured

### Configuration (Updated)

Firebase Functions v2 uses secrets for sensitive data. Set up required secrets using:

```bash
# From the functions directory
./set-secrets.sh
```

This script will guide you through setting:
- OpenAI API key
- Supabase URL
- Supabase anon key

For comprehensive configuration details, see [FIREBASE_FUNCTIONS_CONFIG.md](FIREBASE_FUNCTIONS_CONFIG.md).

### Incremental Deployment

We recommend deploying functions incrementally to test each one:

1. **Test Configuration** (start here): 
   ```bash
   ./deploy-config-test.sh
   ```
   Verify that your configuration values and secrets are accessible.

2. **Test Authentication**: 
   ```bash
   ./deploy-auth-test.sh
   ```
   Test Firebase Authentication integration.

3. **OpenAI Integration**: Deploy these in sequence to test OpenAI integration:
   ```bash
   ./deploy-create-thread.sh
   ./deploy-create-message.sh
   ./deploy-run-assistant.sh
   ./deploy-list-messages.sh
   ./deploy-send-message-and-wait.sh
   ```

4. **Full Deployment**: Once all functions are tested individually:
   ```bash
   ./deploy-all.sh
   ```

## Available Functions

- **testFunction**: Simple test function to verify deployment works
- **configTest**: Tests access to configuration values and secrets
- **authTest**: Tests Firebase authentication
- **createThread**: Creates a new OpenAI thread
- **createMessage**: Adds a message to an existing thread
- **runAssistant**: Runs an assistant on a thread
- **getRun**: Gets the status of a run
- **listMessages**: Lists messages in a thread
- **uploadFile**: Uploads a file to OpenAI
- **attachFileToAssistant**: Attaches a file to an assistant
- **deleteFile**: Deletes a file
- **removeFileFromAssistant**: Removes a file from an assistant
- **deleteThread**: Deletes a thread
- **sendMessageAndWaitForResponse**: Combined operation - sends a message and waits for the assistant's response

## Testing the API

All endpoints require a valid Firebase authentication token in the Authorization header:

```
Authorization: Bearer <firebase-auth-token>
```

You can generate a token using Firebase Auth in your frontend application or using the Firebase Admin SDK for testing.

## Troubleshooting

If you encounter "Precondition failed" errors during deployment:

1. Verify all secrets are set correctly using:
   ```bash
   npx firebase functions:secrets:list
   ```
2. Check the function logs for specific error messages:
   ```bash
   npx firebase functions:log
   ```
3. Try deploying a single function first to isolate issues:
   ```bash
   npx firebase deploy --only functions:configTest
   ```

For detailed troubleshooting, refer to [FIREBASE_FUNCTIONS_CONFIG.md](FIREBASE_FUNCTIONS_CONFIG.md).

## Security

These functions use Firebase Authentication to secure all endpoints and Firebase Secrets to secure sensitive API keys and credentials. Each request is validated to ensure it comes from an authenticated user. 