const { onRequest } = require('firebase-functions/v2/https');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');
const { https } = require('firebase-functions');

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
 * Public CORS test function - allows unauthenticated access
 */
exports.publicCorsTest = onRequest(
  { 
    region: "us-central1",
    invoker: "public"
  },
  (req, res) => {
    // Set CORS headers immediately for all requests
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://app.leadlines.ai',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Always set CORS headers
    if (allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      res.set('Access-Control-Allow-Origin', '*');
    } else {
      res.set('Access-Control-Allow-Origin', '*'); // Fallback for testing
    }
    
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Max-Age', '3600');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Public CORS preflight request received from:', req.headers.origin);
      res.status(200).end();
      return;
    }
    
    // Handle actual requests
    console.log('Public CORS request received:', { method: req.method, origin: req.headers.origin });
    res.status(200).json({ 
      message: "Public CORS test successful!",
      origin: req.headers.origin,
      method: req.method,
      timestamp: new Date().toISOString(),
      note: "This function allows unauthenticated access for CORS testing"
    });
  }
);

/**
 * Simple CORS test function - minimal implementation
 */
exports.corsTest = onRequest(
  { 
    region: "us-central1"
  },
  (req, res) => {
    // Set CORS headers first, before any other processing
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://app.leadlines.ai',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      res.set('Access-Control-Allow-Origin', '*');
    }
    
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Max-Age', '3600');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('CORS preflight request received from:', req.headers.origin);
      res.status(200).end();
      return;
    }
    
    // Handle actual requests
    console.log('CORS request received:', { method: req.method, origin: req.headers.origin });
    res.status(200).json({ 
      message: "CORS test successful!",
      origin: req.headers.origin,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * Simple CORS test using v1 functions (more permissive)
 */
exports.simpleCorsTest = functions.https.onRequest((req, res) => {
  // Set CORS headers immediately for all requests
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://app.leadlines.ai',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
  
  // Set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  } else {
    res.set('Access-Control-Allow-Origin', '*'); // Fallback for testing
  }
  
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight requests (no authentication required)
  if (req.method === 'OPTIONS') {
    console.log('V1 CORS preflight request received from:', req.headers.origin);
    res.status(204).send('');
    return;
  }
  
  // Handle actual request
  console.log('V1 CORS request received:', { method: req.method, origin: req.headers.origin });
  res.status(200).json({
    message: "Simple CORS test successful!",
    origin: req.headers.origin || 'no-origin',
    method: req.method,
    timestamp: new Date().toISOString(),
    note: "This is a v1 function which should be more permissive"
  });
});

/**
 * Another v1 CORS test function with wildcard headers
 */
exports.v1CorsTest = functions.https.onRequest((req, res) => {
  // Set CORS headers for all origins (most permissive for testing)
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set('Access-Control-Max-Age', '86400');
  
  // Handle preflight (no authentication required)
  if (req.method === 'OPTIONS') {
    console.log('V1 wildcard CORS preflight from:', req.headers.origin);
    res.status(204).send('');
    return;
  }
  
  // Handle actual request
  res.status(200).json({
    message: "V1 CORS test with wildcard headers successful!",
    origin: req.headers.origin || 'no-origin',
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: Object.keys(req.headers)
  });
});

/**
 * V1 Test function that mimics your main testFunction but with v1 syntax
 */
exports.v1TestFunction = functions.https.onRequest((req, res) => {
  // Set CORS headers first
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://app.leadlines.ai',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  } else {
    res.set('Access-Control-Allow-Origin', '*');
  }
  
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight requests (no authentication required)
  if (req.method === 'OPTIONS') {
    console.log('V1 test function preflight from:', req.headers.origin);
    res.status(204).send('');
    return;
  }
  
  try {
    // Log request details for debugging
    console.log('V1 Request details:', {
      method: req.method,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      headers: Object.keys(req.headers)
    });
    
    res.status(200).json({ 
      message: "Hello from V1 Firebase Functions!",
      origin: req.headers.origin,
      method: req.method,
      timestamp: new Date().toISOString(),
      note: "This is a v1 function that should handle CORS better"
    });
  } catch (error) {
    console.error('V1 Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual CORS implementation for other functions
const handleCors = (req, res) => {
  const allowedOrigins = [
    'https://app.leadlines.ai',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.set('Access-Control-Allow-Origin', '*');
  }
  
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};

/**
 * Test function to verify deployment works
 */
exports.testFunction = onRequest(
  { 
    region: "us-central1"
  }, 
  (req, res) => {
    if (handleCors(req, res)) return;
    
    try {
      // Log request details for debugging
      console.log('Request details:', {
        method: req.method,
        origin: req.headers.origin,
        userAgent: req.headers['user-agent'],
        headers: Object.keys(req.headers)
      });
      
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
        timestamp: new Date().toISOString(),
        origin: req.headers.origin,
        method: req.method
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
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
    if (handleCors(req, res)) return;
    
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
    if (handleCors(req, res)) return;
    
    try {
      authenticateUser(req, res, async () => {
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
  }
);

/**
 * Create a new thread
 */
exports.createThread = onRequest(
  { 
    region: "us-central1",
    secrets: ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]
  }, 
  (req, res) => {
    if (handleCors(req, res)) return;
    
    try {
      authenticateUser(req, res, async () => {
        try {
          const config = getConfig();
          
          if (!config.openaiApiKey) {
            throw new Error('OpenAI API key not configured');
          }
          
          const openai = new OpenAI({
            apiKey: config.openaiApiKey,
          });
          
          const thread = await openai.beta.threads.create();
          
          res.status(200).json({ 
            threadId: thread.id,
            message: "Thread created successfully" 
          });
        } catch (error) {
          console.error('Error creating thread:', error);
          res.status(500).json({ 
            error: error.message,
            details: "Failed to create thread"
          });
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Create a message in a thread
 */
exports.createMessage = onRequest(
  { 
    region: "us-central1",
    secrets: ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_KEY"]
  }, 
  (req, res) => {
    if (handleCors(req, res)) return;
    
    try {
      authenticateUser(req, res, async () => {
        try {
          const { threadId, content } = req.body;
          
          if (!threadId || !content) {
            return res.status(400).json({ 
              error: "Missing required fields: threadId and content" 
            });
          }
          
          const config = getConfig();
          
          if (!config.openaiApiKey) {
            throw new Error('OpenAI API key not configured');
          }
          
          const openai = new OpenAI({
            apiKey: config.openaiApiKey,
          });
          
          const message = await openai.beta.threads.messages.create(
            threadId,
            {
              role: "user",
              content: content
            }
          );
          
          res.status(200).json({ 
            messageId: message.id,
            threadId: threadId,
            message: "Message created successfully" 
          });
        } catch (error) {
          console.error('Error creating message:', error);
          res.status(500).json({ 
            error: error.message,
            details: "Failed to create message"
          });
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Run an assistant on a thread
 */
exports.runAssistant = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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

/**
 * Get run status
 */
exports.getRun = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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

/**
 * List messages in a thread
 */
exports.listMessages = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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

/**
 * Upload a file to OpenAI
 */
exports.uploadFile = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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

/**
 * Attach a file to an assistant
 */
exports.attachFileToAssistant = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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

/**
 * Delete a file
 */
exports.deleteFile = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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

/**
 * Remove a file from an assistant
 */
exports.removeFileFromAssistant = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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

/**
 * Delete a thread
 */
exports.deleteThread = onRequest({ 
  region: "us-central1",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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

/**
 * Send a message and wait for assistant response (combined operation)
 */
exports.sendMessageAndWaitForResponse = onRequest({ 
  region: "us-central1",
  timeoutSeconds: 540, // 9 minutes
  memory: "1GiB",
  secrets: ["OPENAI_API_KEY"]
}, (req, res) => {
  if (handleCors(req, res)) return;
  
  try {
    authenticateUser(req, res, async () => {
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
        
        // Get the updated status
        runStatus = await openai.beta.threads.runs.retrieve(
          threadId,
          run.id
        );
        
        // Log the current status
        console.log(`Run status: ${runStatus.status}`);
      }
      
      // If the run failed, return the error
      if (runStatus.status === 'failed') {
        return res.status(500).json({ 
          error: 'Run failed', 
          details: runStatus.error 
        });
      }
      
      // Get the messages after the run completes
      const messages = await openai.beta.threads.messages.list(threadId);
      
      res.status(200).json(messages);
    });
  } catch (error) {
    console.error('Error sending message and waiting for response:', error);
    res.status(500).json({ error: error.message });
  }
});
