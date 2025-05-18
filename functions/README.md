# Firebase Functions OpenAI API Proxy for LeadLines

This directory contains Firebase Functions that securely proxy requests to the OpenAI API for the LeadLines application. This approach keeps your API keys secure on the server side and follows security best practices.

## Setup Instructions

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Set your OpenAI API key as an environment variable**:
   ```bash
   firebase functions:config:set openai.key="your-openai-api-key"
   ```

4. **Deploy the functions**:
   ```bash
   firebase deploy --only functions
   ```

## Available Functions

The following Firebase Functions are available for proxying requests to the OpenAI API:

- `createThread`: Create a new conversation thread
- `createMessage`: Add a message to a thread
- `runAssistant`: Run an assistant on a thread
- `getRun`: Get the status of a run
- `listMessages`: List messages in a thread
- `uploadFile`: Upload a file to OpenAI
- `attachFileToAssistant`: Attach a file to an assistant
- `deleteFile`: Delete a file
- `removeFileFromAssistant`: Remove a file from an assistant
- `deleteThread`: Delete a thread
- `sendMessageAndWaitForResponse`: Send a message and wait for the assistant's response

## Security Features

- All requests are authenticated using Firebase Authentication
- API keys are stored securely on the server side
- User data is isolated using proper authentication checks

## Local Development

To run the functions locally for development:

```bash
firebase emulators:start --only functions
```

This will start the Firebase Functions emulator on port 5001. 