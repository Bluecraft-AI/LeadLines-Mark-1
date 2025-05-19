# Firebase Functions Implementation in LeadLines

This document provides a comprehensive overview of the Firebase Functions implementation in the LeadLines project, explaining how the OpenAI API is securely integrated using Firebase Functions V2, how secrets are managed, and how to deploy and test the functions.

## Architecture Overview

LeadLines uses Firebase Functions as a secure backend for OpenAI API interactions. This architecture provides several benefits:

1. **Security**: API keys are stored securely using Firebase Secrets
2. **Authentication**: All API calls are authenticated using Firebase Authentication
3. **Cost Control**: Functions provide a way to monitor and control usage
4. **Maintainability**: Backend logic is centralized and separate from the frontend

The implementation follows this pattern:

```
Client App → Firebase Authentication → Firebase Functions → OpenAI API
```

## Firebase Functions V2 Implementation

The functions directory contains several key files:

- `index.js`: Contains all Firebase Function implementations with V2 configuration
- `package.json`: Node.js dependencies
- `firebase.json`: Firebase configuration
- Deployment scripts: Various scripts to facilitate different deployment strategies
- `set-secrets.sh`: Script to set up required secrets

### Available Functions

The following Firebase Functions are implemented:

1. **Basic and Test Functions**:
   - `testFunction`: Simple test function that returns a greeting
   - `configTest`: Tests access to Firebase secrets and configuration values
   - `authTest`: Tests Firebase Authentication

2. **OpenAI Thread Management**:
   - `createThread`: Creates a new OpenAI thread
   - `deleteThread`: Deletes an existing thread

3. **Message Operations**:
   - `createMessage`: Adds a message to a thread
   - `listMessages`: Retrieves messages from a thread

4. **Assistant Interaction**:
   - `runAssistant`: Starts an assistant on a thread
   - `getRun`: Gets the status of a run

5. **File Operations**:
   - `uploadFile`: Uploads a file to OpenAI
   - `attachFileToAssistant`: Attaches a file to an assistant
   - `deleteFile`: Deletes a file
   - `removeFileFromAssistant`: Removes a file from an assistant

6. **Combined Operations**:
   - `sendMessageAndWaitForResponse`: Combines sending a message and waiting for the assistant's response (most commonly used)

### Secrets and Configuration Management

Firebase Functions V2 uses secrets for sensitive information. Each function that requires access to sensitive data includes a `secrets` declaration:

```javascript
exports.configTest = onRequest(
  { 
    region: "us-central1",
    secrets: ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]
  }, 
  (req, res) => {
    // Function implementation
  }
);
```

Secrets are accessed via environment variables:

```javascript
// Get configuration values with proper error handling
const getConfig = () => {
  try {
    return {
      openaiApiKey: process.env.OPENAI_API_KEY || functions.config().openai?.key,
      supabaseUrl: process.env.SUPABASE_URL || functions.config().supabase?.url,
      supabaseKey: process.env.SUPABASE_KEY || functions.config().supabase?.key
    };
  } catch (error) {
    console.error('Error getting config:', error);
    return {
      openaiApiKey: process.env.OPENAI_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    };
  }
};
```

### Authentication and Security

All functions use Firebase Authentication to secure the endpoints. Each request must include a valid Firebase ID token in the Authorization header. The `authenticateUser` middleware ensures only authenticated users can access the functions.

## Client-Side Integration

The client-side integration is handled by the `AssistantService.js` file, which provides a clean interface for the frontend to interact with the Firebase Functions. It handles:

1. Authentication token management
2. Function calls using Firebase's `httpsCallable` method
3. Error handling
4. Data transformation where needed

## Deployment Process

### Prerequisites

- Node.js 18 or higher recommended
- Firebase CLI installed globally
- Firebase account with a project set up
- OpenAI API key

### Secrets Setup

Before deployment, set up secrets using the provided script:

```bash
cd functions
./set-secrets.sh
```

This will guide you through setting up:
- OpenAI API key
- Supabase URL (if using Supabase)
- Supabase key (if using Supabase)

### Deployment Options

The project provides several deployment strategies:

1. **Master Setup Script**:
   ```bash
   ./functions/setup-and-deploy.sh
   ```
   This guided script handles setup, configuration, and deployment options.

2. **Incremental Deployment**:
   Deploy functions one by one to test each component:
   ```bash
   ./functions/deploy-config-test.sh
   ./functions/deploy-auth-test.sh
   ./functions/deploy-create-thread.sh
   # ...and so on
   ```

3. **Full Deployment**:
   Deploy all functions at once:
   ```bash
   ./functions/deploy-all.sh
   ```

## Testing

### Testing the Functions

1. **Test Configuration**:
   ```
   GET https://us-central1-leadlines-portal.cloudfunctions.net/configTest
   ```
   Should return configuration values with secret availability status.

2. **Test Authentication**:
   ```
   GET https://us-central1-leadlines-portal.cloudfunctions.net/authTest
   Header: Authorization: Bearer <firebase-id-token>
   ```
   Should return user details if authentication is successful.

3. **Create Thread**:
   ```
   POST https://us-central1-leadlines-portal.cloudfunctions.net/createThread
   Header: Authorization: Bearer <firebase-id-token>
   ```
   Should return a thread object with an ID.

4. **Send Message and Get Response**:
   ```
   POST https://us-central1-leadlines-portal.cloudfunctions.net/sendMessageAndWaitForResponse
   Header: Authorization: Bearer <firebase-id-token>
   Query: threadId=<thread-id>
   Body: {
     "message": "Your message here",
     "assistantId": "<assistant-id>"
   }
   ```
   Should return the assistant's response.

### Troubleshooting

If you encounter "Precondition failed" errors during deployment:

1. Verify all secrets are set correctly using:
   ```bash
   npx firebase functions:secrets:list
   ```
2. Check the logs for specific error messages:
   ```bash
   npx firebase functions:log
   ```
3. Try deploying a single function first to isolate issues:
   ```bash
   npx firebase deploy --only functions:configTest
   ```

## Local Development

For local development, you can use the Firebase emulator:

```bash
./functions/start-local.sh
```

Note that secrets are not available in the local emulator environment. This is expected behavior and doesn't indicate a problem with your code. In production, Firebase will inject these secrets automatically.

## Maintenance and Updates

When updates to OpenAI's API occur or new features are needed:

1. Update the `index.js` file with new function implementations
2. Ensure any new functions that require secrets include the appropriate `secrets` declaration
3. Update the client-side `AssistantService.js` to use the new functions
4. Redeploy using the appropriate deployment script

## Conclusion

This Firebase Functions implementation provides a secure, scalable, and maintainable way to integrate OpenAI's API into the LeadLines application. The structured approach to deployment and testing ensures a reliable system that can be extended as needed. 