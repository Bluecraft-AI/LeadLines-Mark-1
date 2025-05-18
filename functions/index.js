const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { OpenAI } = require('openai');

admin.initializeApp();

// Initialize OpenAI with API key from Firebase config
const openaiApiKey = process.env.OPENAI_API_KEY || functions.config().openai?.key;
// Get Supabase credentials if needed
const supabaseUrl = functions.config().supabase?.url;
const supabaseKey = functions.config().supabase?.key;

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

/**
 * Middleware to verify Firebase authentication
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Create a new thread
 */
exports.createThread = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
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
exports.createMessage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        const { content, role = 'user' } = req.body;
        
        if (!threadId || !content) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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
exports.runAssistant = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        const { assistantId } = req.body;
        
        if (!threadId || !assistantId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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
exports.getRun = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId, runId } = req.query;
        
        if (!threadId || !runId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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
exports.listMessages = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        
        if (!threadId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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
exports.uploadFile = functions.https.onRequest((req, res) => {
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
exports.attachFileToAssistant = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { assistantId } = req.query;
        const { fileId } = req.body;
        
        if (!assistantId || !fileId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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
exports.deleteFile = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { fileId } = req.query;
        
        if (!fileId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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
exports.removeFileFromAssistant = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { assistantId, fileId } = req.query;
        
        if (!assistantId || !fileId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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
exports.deleteThread = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        
        if (!threadId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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
exports.sendMessageAndWaitForResponse = functions.runWith({
  timeoutSeconds: 540, // 9 minutes
  memory: '1GB',
}).https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      await authenticateUser(req, res, async () => {
        const { threadId } = req.query;
        const { message, assistantId } = req.body;
        
        if (!threadId || !message || !assistantId) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
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