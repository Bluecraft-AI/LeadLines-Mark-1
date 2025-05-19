# Firebase Functions Implementation in LeadLines

This document provides a comprehensive overview of the Firebase Functions implementation in the LeadLines project, explaining how the OpenAI API is securely integrated, how the functions are structured, and how to deploy and test them.

## Architecture Overview

LeadLines uses Firebase Functions as a secure backend for OpenAI API interactions. This architecture provides several benefits:

1. **Security**: API keys are stored securely on the server side
2. **Authentication**: All API calls are authenticated using Firebase Authentication
3. **Cost Control**: Functions provide a way to monitor and control usage
4. **Maintainability**: Backend logic is centralized and separate from the frontend

The implementation follows this pattern:

```
Client App → Firebase Authentication → Firebase Functions → OpenAI API
```

## Firebase Functions Implementation

The functions directory contains several key files:

- `index.js`: Contains all Firebase Function implementations
- `package.json`: Node.js dependencies
- `firebase.json`: Firebase configuration
- Deployment scripts: Various scripts to facilitate different deployment strategies

### Available Functions

The following Firebase Functions are implemented:

1. **Basic and Test Functions**:
   - `testFunction`: Simple test function that returns a greeting
   - `configTest`: Tests access to Firebase configuration values
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

- Node.js (v18+ recommended)
- Firebase CLI installed globally
- Firebase account with a project set up
- OpenAI API key

### Configuration

Before deployment, you need to set up configuration values:

```bash
# Set OpenAI API key
npx firebase functions:config:set openai.key="your-openai-api-key"

# (Optional) Set Supabase configuration if using Supabase
npx firebase functions:config:set supabase.url="your-supabase-url"
npx firebase functions:config:set supabase.key="your-supabase-anon-key"
```

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

4. **Clean Deployment**:
   Remove all existing functions and deploy a test function:
   ```bash
   ./functions/clean-deploy.sh
   ```

## Testing

### Testing the Functions

1. **Test Configuration**:
   ```
   GET https://us-central1-leadlines-portal.cloudfunctions.net/configTest
   ```
   Should return configuration values (with API keys partially hidden).

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

- **View Logs**: `npx firebase functions:log --project=leadlines-portal`
- **Check Config**: `npx firebase functions:config:get --project=leadlines-portal`
- **Test Locally**: Use the `start-local.sh` script to run functions locally

## Local Development

For local development, you can use the Firebase emulator:

```bash
./functions/start-local.sh
```

This script:
1. Fetches your Firebase configuration
2. Saves it to `.runtimeconfig.json`
3. Starts the Firebase Functions emulator

## Maintenance and Updates

When updates to OpenAI's API occur or new features are needed:

1. Update the `index.js` file with new function implementations
2. Update the client-side `AssistantService.js` to use the new functions
3. Redeploy using the appropriate deployment script

## Conclusion

This Firebase Functions implementation provides a secure, scalable, and maintainable way to integrate OpenAI's API into the LeadLines application. The structured approach to deployment and testing ensures a reliable system that can be extended as needed. 