const { onRequest } = require('firebase-functions/v2/https');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

admin.initializeApp();

// Get configuration values from Firebase config
const getConfig = () => {
  try {
    // For v2 functions, process.env is the preferred way to access secrets
    // Fall back to functions.config() for backward compatibility
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

// Initialize OpenAI with the API key
const getOpenAI = () => {
  const config = getConfig();
  if (!config.openaiApiKey) {
    console.error('OpenAI API key is missing');
    throw new Error('OpenAI API key is required');
  }
  return new OpenAI({
    apiKey: config.openaiApiKey,
  });
};

// Initialize Supabase client if credentials are available
const getSupabase = () => {
  const config = getConfig();
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('Supabase credentials are missing');
    throw new Error('Supabase credentials are required');
  }
  return createClient(config.supabaseUrl, config.supabaseKey);
};

/**
 * Middleware to verify Firebase authentication
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No valid token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized - Token verification failed' });
  }
};

/**
 * Test function to verify deployment works
 */
exports.testFunction = onRequest(
  { 
    region: "us-central1",
  }, 
  (req, res) => {
    cors(req, res, async () => {
      try {
        // Log environment variables for debugging
        console.log('Environment variables:', {
          FUNCTION_TARGET: process.env.FUNCTION_TARGET,
          NODE_ENV: process.env.NODE_ENV,
          FIREBASE_CONFIG: process.env.FIREBASE_CONFIG ? 'exists' : 'missing',
        });
        
        // Try to get config and log availability
        try {
          const config = getConfig();
          console.log('Config availability:', {
            openaiApiKey: config.openaiApiKey ? 'exists' : 'missing',
            supabaseUrl: config.supabaseUrl ? 'exists' : 'missing',
            supabaseKey: config.supabaseKey ? 'exists' : 'missing',
          });
        } catch (configError) {
          console.error('Error checking config:', configError);
        }
        
        res.status(200).json({ 
          message: "Hello from Firebase Functions!",
          config: process.env.FUNCTION_TARGET || "No config available",
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }
);

/**
 * Config test function to verify configuration access
 */
exports.configTest = onRequest(
  { 
    region: "us-central1",
    secrets: ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]
  }, 
  (req, res) => {
    cors(req, res, async () => {
      try {
        // Log all available environment variables (safely)
        console.log('Environment variables available:', Object.keys(process.env));
        
        // Try both methods of accessing config
        const envConfig = {
          openaiApiKey: process.env.OPENAI_API_KEY ? 'exists' : 'missing',
          supabaseUrl: process.env.SUPABASE_URL ? 'exists' : 'missing',
          supabaseKey: process.env.SUPABASE_KEY ? 'exists' : 'missing',
        };
        
        let functionsConfig = {};
        try {
          const config = functions.config();
          functionsConfig = {
            openaiKey: config.openai?.key ? 'exists' : 'missing',
            supabaseUrl: config.supabase?.url ? 'exists' : 'missing',
            supabaseKey: config.supabase?.key ? 'exists' : 'missing',
          };
        } catch (configError) {
          console.error('Error accessing functions.config():', configError);
          functionsConfig = { error: configError.message };
        }
        
        // Get the actual config that would be used
        const actualConfig = getConfig();
        
        res.status(200).json({
          message: "Config test",
          envConfig,
          functionsConfig,
          actualConfig: {
            openaiApiKey: actualConfig.openaiApiKey ? 'exists' : 'missing',
            supabaseUrl: actualConfig.supabaseUrl ? 'exists' : 'missing',
            supabaseKey: actualConfig.supabaseKey ? 'exists' : 'missing',
          },
          // Don't return the full key, just the first few characters for validation
          openaiKeyPrefix: actualConfig.openaiApiKey ? 
            actualConfig.openaiApiKey.substring(0, 5) + "..." : "Not available"
        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
          error: error.message,
          configAccess: "Failed to access configuration" 
        });
      }
    });
  }
);

/**
 * Auth test function to verify authentication works
 */
exports.authTest = onRequest(
  { 
    region: "us-central1",
  }, 
  (req, res) => {
    cors(req, res, async () => {
      try {
        await authenticateUser(req, res, async () => {
          res.status(200).json({ 
            message: "Authentication successful",
            user: {
              email: req.user.email,
              uid: req.user.uid
            }
          });
        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }
);

/**
 * Create a new thread
 */
exports.createThread = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const openai = getOpenAI();
        const thread = await openai.beta.threads.create();
        res.status(200).json(thread);
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Add a message to a thread
 */
exports.createMessage = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        const { content, role = 'user' } = req.body;
        
        if (!threadId || !content) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        const message = await openai.beta.threads.messages.create(
          threadId,
          {
            role,
            content
          }
        );
        
        res.status(200).json(message);
      });
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Run an assistant on a thread
 */
exports.runAssistant = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        const { assistantId } = req.body;
        
        if (!threadId || !assistantId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        const run = await openai.beta.threads.runs.create(
          threadId,
          {
            assistant_id: assistantId
          }
        );
        
        res.status(200).json(run);
      });
    } catch (error) {
      console.error('Error running assistant:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Get run status
 */
exports.getRun = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId, runId } = req.query;
        
        if (!threadId || !runId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        const run = await openai.beta.threads.runs.retrieve(
          threadId,
          runId
        );
        
        res.status(200).json(run);
      });
    } catch (error) {
      console.error('Error getting run:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * List messages in a thread
 */
exports.listMessages = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        
        if (!threadId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        const messages = await openai.beta.threads.messages.list(threadId);
        
        res.status(200).json(messages);
      });
    } catch (error) {
      console.error('Error listing messages:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Upload a file to OpenAI
 */
exports.uploadFile = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        // This would require handling file uploads with a library like Busboy
        // For simplicity, we're assuming the file is sent as base64 in the request body
        const { fileData, fileName, fileType, purpose = 'assistants' } = req.body;
        
        if (!fileData || !fileName || !fileType) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Convert base64 to buffer
        const buffer = Buffer.from(fileData, 'base64');
        
        // Create a Blob-like object
        const file = {
          data: buffer,
          name: fileName,
          type: fileType,
        };
        
        // Upload to OpenAI
        const openai = getOpenAI();
        const uploadedFile = await openai.files.create({
          file,
          purpose,
        });
        
        res.status(200).json(uploadedFile);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Attach a file to an assistant
 */
exports.attachFileToAssistant = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { assistantId } = req.query;
        const { fileId } = req.body;
        
        if (!assistantId || !fileId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        const attachment = await openai.beta.assistants.files.create(
          assistantId,
          { file_id: fileId }
        );
        
        res.status(200).json(attachment);
      });
    } catch (error) {
      console.error('Error attaching file:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Delete a file
 */
exports.deleteFile = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { fileId } = req.query;
        
        if (!fileId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        const result = await openai.files.del(fileId);
        
        res.status(200).json(result);
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Remove a file from an assistant
 */
exports.removeFileFromAssistant = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { assistantId, fileId } = req.query;
        
        if (!assistantId || !fileId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        const result = await openai.beta.assistants.files.del(
          assistantId,
          fileId
        );
        
        res.status(200).json(result);
      });
    } catch (error) {
      console.error('Error removing file from assistant:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Delete a thread
 */
exports.deleteThread = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        
        if (!threadId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        const result = await openai.beta.threads.del(threadId);
        
        res.status(200).json(result);
      });
    } catch (error) {
      console.error('Error deleting thread:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Send a message and wait for assistant response (combined operation)
 */
exports.sendMessageAndWaitForResponse = onRequest({ 
  region: "us-central1",
  timeoutSeconds: 540, // 9 minutes
  memory: "1GiB",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        const { message, assistantId } = req.body;
        
        if (!threadId || !message || !assistantId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        const openai = getOpenAI();
        
        // Add the user message to the thread
        await openai.beta.threads.messages.create(
          threadId,
          {
            role: 'user',
            content: message
          }
        );
        
        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(
          threadId,
          {
            assistant_id: assistantId
          }
        );
        
        // Poll for the run completion
        let runStatus = await openai.beta.threads.runs.retrieve(
          threadId,
          run.id
        );
        
        // Wait for the run to complete
        while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
          // Wait for 1 second before checking again
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(
            threadId,
            run.id
          );
        }
        
        if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed');
        }
        
        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(threadId);
        const assistantMessage = messages.data.find(msg => 
          msg.role === 'assistant' && msg.run_id === run.id
        );
        
        // Return the assistant's response
        res.status(200).json({ 
          response: assistantMessage.content[0].text.value,
          runId: run.id
        });
      });
    } catch (error) {
      console.error('Error in sendMessageAndWaitForResponse:', error);
      res.status(500).json({ error: error.message });
    }
  });
});
