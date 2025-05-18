# Firebase Functions Setup for OpenAI API Proxy

This document provides comprehensive instructions for setting up Firebase Functions to securely proxy OpenAI API requests for the LeadLines application.

## Why Use Firebase Functions?

Using Firebase Functions as a proxy for OpenAI API calls provides several benefits:

1. **Security** - API keys and credentials are stored server-side, not in the client code
2. **Cost Control** - You can implement rate limiting and usage tracking
3. **Centralized Management** - All API interactions are managed from a single location
4. **Scalability** - Firebase Functions automatically scale based on demand

## Prerequisites

- Node.js and npm installed
- A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
- OpenAI API key
- Supabase project credentials (if applicable)

## Setup Process

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase in Your Project

If Firebase isn't already initialized in your project:

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

### 4. Configure Environment Variables

Set your API keys and other sensitive information as Firebase environment variables:

```bash
firebase functions:config:set openai.key="your-openai-api-key"
firebase functions:config:set supabase.url="your-supabase-url"
firebase functions:config:set supabase.key="your-supabase-anon-key"
```

You can verify the config is set correctly with:

```bash
firebase functions:config:get
```

### 5. Update Firebase Functions Code

Our Firebase Functions code is already configured to use these environment variables:

```javascript
// In functions/index.js
const openaiApiKey = process.env.OPENAI_API_KEY || functions.config().openai?.key;
const supabaseUrl = functions.config().supabase?.url;
const supabaseKey = functions.config().supabase?.key;
```

### 6. Install Dependencies

```bash
cd functions
npm install openai cors
```

### 7. Deploy the Functions

You can use our deployment script:

```bash
./deploy.sh
```

Or deploy manually:

```bash
firebase deploy --only functions
```

## Local Development

To run and test the functions locally:

1. Get your Firebase config for local emulation:
   ```bash
   firebase functions:config:get > .runtimeconfig.json
   ```

2. Start the emulator:
   ```bash
   firebase emulators:start --only functions
   ```

   Or use our script:
   ```bash
   ./start-local.sh
   ```

## Accessing Firebase Functions from Frontend

The AssistantService.js file is already configured to use Firebase Functions instead of direct OpenAI API calls. It uses Firebase Authentication to secure the requests:

```javascript
// Example from AssistantService.js
async createThread(userId, title = 'New Conversation') {
  try {
    // Create a thread using Firebase Function
    const createThreadFn = httpsCallable(this.functions, 'createThread');
    const result = await createThreadFn();
    const thread = result.data;
    
    // Store the thread in Supabase
    // ...
  } catch (error) {
    // ...
  }
}
```

## Monitoring and Troubleshooting

### View Logs

```bash
firebase functions:log
```

### Monitor Usage

You can monitor function usage, errors, and performance in the Firebase Console under "Functions" section.

### Common Issues

1. **Authentication errors**: Make sure Firebase Authentication is properly initialized in your frontend.

2. **CORS issues**: The functions are configured with CORS enabled, but you might need to adjust the origin settings.

3. **Environment variables not set**: Verify your environment variables are properly set using `firebase functions:config:get`.

4. **Exceeding quota**: Check your Firebase usage limits and quotas in the Firebase Console.

## Security Considerations

- API keys are never exposed to clients
- All requests are authenticated using Firebase Authentication
- User data is isolated through proper authentication checks

## Production Considerations

- Consider implementing rate limiting
- Set up monitoring and alerts
- Regularly rotate API keys
- Implement proper error handling and reporting 