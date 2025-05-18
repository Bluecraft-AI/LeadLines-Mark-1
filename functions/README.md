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

3. **Initialize Firebase in your project (if not already done)**:
   ```bash
   cd your-project-directory
   firebase init
   ```
   When prompted:
   - Select "Functions"
   - Choose your Firebase project
   - Select JavaScript
   - Say yes to ESLint
   - Say yes to installing dependencies

4. **Set your environment variables**:
   ```bash
   firebase functions:config:set openai.key="your-openai-api-key"
   firebase functions:config:set supabase.url="your-supabase-url"
   firebase functions:config:set supabase.key="your-supabase-anon-key"
   ```

5. **Install required dependencies**:
   ```bash
   cd functions
   npm install openai cors
   ```

6. **Deploy the functions**:
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
firebase functions:config:get > .runtimeconfig.json
firebase emulators:start --only functions
```

This will start the Firebase Functions emulator on port 5001.

## Accessing Environment Variables in Functions

The functions code accesses environment variables using:

```javascript
const openaiApiKey = process.env.OPENAI_API_KEY || functions.config().openai.key;
const supabaseUrl = functions.config().supabase.url;
const supabaseKey = functions.config().supabase.key;
```

This allows for flexibility in both development and production environments. 