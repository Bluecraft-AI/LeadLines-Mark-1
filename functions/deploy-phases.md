# Incremental Firebase Functions Deployment Plan

This document outlines a phased approach to deploying all Firebase Functions.

## Phase 1: Test Function ✅

Deploy a simple test function to verify basic deployment works:

```js
exports.testFunction = onRequest(
  { region: "us-central1" }, 
  (req, res) => {
    res.status(200).json({ message: "Hello from Firebase Functions!" });
  }
);
```

## Phase 2: Add Config and Basic OpenAI Setup

Update the test function to verify config values are accessible:

```js
exports.configTest = onRequest(
  { region: "us-central1" }, 
  (req, res) => {
    const config = require('firebase-functions').config();
    const openaiKey = config.openai?.key || "Not set";
    
    res.status(200).json({
      message: "Config test",
      // Don't return the full key, just the first few characters for validation
      openaiKeyPrefix: openaiKey.substring(0, 7) + "..."
    });
  }
);
```

## Phase 3: Add Authentication Middleware

Implement the authentication middleware and test it:

```js
exports.authTest = onRequest(
  { region: "us-central1" }, 
  (req, res) => {
    cors(req, res, async () => {
      try {
        await authenticateUser(req, res, async () => {
          res.status(200).json({ 
            message: "Authentication successful",
            user: req.user.email 
          });
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
);
```

## Phase 4: Add OpenAI Thread Creation

Implement the thread creation function:

```js
exports.createThread = onRequest(
  { region: "us-central1" }, 
  (req, res) => {
    cors(req, res, async () => {
      try {
        await authenticateUser(req, res, async () => {
          const openai = getOpenAI();
          const thread = await openai.beta.threads.create();
          res.status(200).json(thread);
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
);
```

## Phase 5: Add Remaining Functions

Continue adding functions one by one, with each successful deployment:

1. createMessage
2. runAssistant
3. getRun
4. listMessages
5. uploadFile
6. attachFileToAssistant
7. deleteFile
8. removeFileFromAssistant
9. deleteThread
10. sendMessageAndWaitForResponse

## Final Phase: Full Deployment

Once all functions are working individually, deploy them all together.

---

### Troubleshooting Tips

If you encounter deployment issues:

1. Check function logs: `npx firebase functions:log`
2. Verify permissions: `npx firebase projects:administer`
3. Check config settings: `npx firebase functions:config:get`
4. Delete problematic functions: `npx firebase functions:delete functionName`
5. Update Firebase CLI: `npm install -g firebase-tools` 