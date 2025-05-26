import { supabase } from '../config/supabase';
import { auth } from '../config/firebase';

/**
 * Service for managing OpenAI Assistants with Firebase authentication
 */
class AssistantService {
  constructor() {
    this.baseUrl = 'https://us-central1-leadlines-portal.cloudfunctions.net';
    this.endpoints = {
      listMessages: `${this.baseUrl}/listMessages`,
      createMessage: `${this.baseUrl}/createMessage`,
      runAssistant: `${this.baseUrl}/runAssistant`,
      deleteThread: `${this.baseUrl}/deleteThread`,
      attachFileToAssistant: `${this.baseUrl}/attachFileToAssistant`,
      getRun: `${this.baseUrl}/getRun`,
      testFunction: `${this.baseUrl}/testFunction`,
      uploadFile: `${this.baseUrl}/uploadFile`,
      deleteFile: `${this.baseUrl}/deleteFile`,
      removeFileFromAssistant: `${this.baseUrl}/removeFileFromAssistant`,
      sendMessageAndWaitForResponse: `${this.baseUrl}/sendMessageAndWaitForResponse`,
      createThread: `${this.baseUrl}/createThread`
    };
  }

  // Helper method to get Firebase ID token
  async getIdToken() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Error getting ID token:', error);
      throw error;
    }
  }

  /**
   * Get the user's assistant
   * @returns {Promise<Object>} The assistant object
   */
  async getUserAssistant() {
    try {
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get the assistant using Firebase UID directly
      const { data, error } = await supabase
        .from('user_assistants')
        .select('*')
        .eq('user_id', user.uid)
        .single();
      
      if (error) {
        console.error('Error getting user assistant:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user assistant:', error);
      throw error;
    }
  }

  /**
   * Get all user assistants
   * @returns {Promise<Array>} Array of assistants
   */
  async getUserAssistants() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('user_assistants')
        .select('*')
        .eq('user_id', user.uid);

      if (error) {
        console.error('Error getting user assistants:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserAssistants:', error);
      throw error;
    }
  }

  /**
   * Save user assistant to Supabase
   * @param {Object} assistantData - The assistant data
   * @returns {Promise<Object>} The saved assistant
   */
  async saveUserAssistant(assistantData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('user_assistants')
        .upsert([
          {
            user_id: user.uid,
            assistant_id: assistantData.assistant_id,
            metadata: assistantData.metadata || {},
            status: assistantData.status || 'active',
            last_accessed_at: new Date()
          }
        ])
        .select();

      if (error) {
        console.error('Error saving user assistant:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error in saveUserAssistant:', error);
      throw error;
    }
  }

  /**
   * Create a new thread
   * @returns {Promise<Object>} The created thread
   */
  async createThread() {
    try {
      const idToken = await this.getIdToken();
      
      const response = await fetch(this.endpoints.createThread, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error creating thread: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  /**
   * Get all threads for the current user
   * @returns {Promise<Array>} Array of threads
   */
  async getThreads() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('assistant_threads')
        .select('*')
        .eq('user_id', user.uid)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting threads:', error);
      throw error;
    }
  }

  /**
   * Create a message in a thread
   * @param {string} threadId - The thread ID
   * @param {string} content - The message content
   * @returns {Promise<Object>} The created message
   */
  async createMessage(threadId, content) {
    try {
      const idToken = await this.getIdToken();
      
      const response = await fetch(this.endpoints.createMessage, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ threadId, content }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error creating message: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update last_message_at in Supabase
      await supabase
        .from('assistant_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('user_id', auth.currentUser.uid)
        .eq('thread_id', threadId);
      
      return data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Run the assistant on a thread
   * @param {string} threadId - The thread ID
   * @returns {Promise<Object>} The run object
   */
  async runAssistant(threadId) {
    try {
      const assistant = await this.getUserAssistant();
      if (!assistant) {
        throw new Error('No assistant found for user');
      }
      
      const idToken = await this.getIdToken();
      
      const response = await fetch(this.endpoints.runAssistant, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          threadId, 
          assistantId: assistant.assistant_id 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error running assistant: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error running assistant:', error);
      throw error;
    }
  }

  /**
   * Get a run
   * @param {string} threadId - The thread ID
   * @param {string} runId - The run ID
   * @returns {Promise<Object>} The run object
   */
  async getRun(threadId, runId) {
    try {
      const idToken = await this.getIdToken();
      
      const response = await fetch(`${this.endpoints.getRun}?threadId=${threadId}&runId=${runId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error getting run: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting run:', error);
      throw error;
    }
  }

  /**
   * List messages in a thread
   * @param {string} threadId - The thread ID
   * @returns {Promise<Array>} Array of messages
   */
  async listMessages(threadId) {
    try {
      const idToken = await this.getIdToken();
      
      const response = await fetch(`${this.endpoints.listMessages}?threadId=${threadId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error listing messages: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error listing messages:', error);
      throw error;
    }
  }

  /**
   * Upload a file to OpenAI
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} The uploaded file information
   */
  async uploadFile(file) {
    try {
      const idToken = await this.getIdToken();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'assistants');
      
      const response = await fetch(this.endpoints.uploadFile, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error uploading file: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store file information in Supabase
      await supabase
        .from('assistant_files')
        .insert({
          user_id: auth.currentUser.uid,
          file_id: data.fileId,
          filename: file.name,
          purpose: 'assistants',
          bytes: file.size,
          created_at: new Date().toISOString()
        });
      
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Attach a file to the assistant
   * @param {string} fileId - The file ID
   * @returns {Promise<Object>} The response
   */
  async attachFileToAssistant(fileId) {
    try {
      const assistant = await this.getUserAssistant();
      if (!assistant) {
        throw new Error('No assistant found for user');
      }
      
      const idToken = await this.getIdToken();
      
      const response = await fetch(this.endpoints.attachFileToAssistant, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          fileId, 
          assistantId: assistant.assistant_id 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error attaching file: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error attaching file:', error);
      throw error;
    }
  }

  /**
   * Upload a file and attach it to the assistant
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} The response
   */
  async uploadFileToAssistant(file) {
    try {
      // Upload file
      const uploadResult = await this.uploadFile(file);
      
      // Attach file to assistant
      await this.attachFileToAssistant(uploadResult.fileId);
      
      return uploadResult;
    } catch (error) {
      console.error('Error uploading file to assistant:', error);
      throw error;
    }
  }

  /**
   * Get all files for the current user
   * @returns {Promise<Array>} Array of files
   */
  async getFiles() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('assistant_files')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  /**
   * Delete a file
   * @param {string} fileId - The file ID
   * @returns {Promise<Object>} The response
   */
  async deleteFile(fileId) {
    try {
      // First remove the file from the assistant
      await this.removeFileFromAssistant(fileId);
      
      // Then delete the file from OpenAI
      const idToken = await this.getIdToken();
      
      const response = await fetch(`${this.endpoints.deleteFile}?fileId=${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting file: ${response.statusText}`);
      }
      
      // Delete file from Supabase
      await supabase
        .from('assistant_files')
        .delete()
        .eq('user_id', auth.currentUser.uid)
        .eq('file_id', fileId);
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Remove a file from the assistant
   * @param {string} fileId - The file ID
   * @returns {Promise<Object>} The response
   */
  async removeFileFromAssistant(fileId) {
    try {
      const assistant = await this.getUserAssistant();
      if (!assistant) {
        throw new Error('No assistant found for user');
      }
      
      const idToken = await this.getIdToken();
      
      const response = await fetch(this.endpoints.removeFileFromAssistant, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          fileId, 
          assistantId: assistant.assistant_id 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error removing file: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing file from assistant:', error);
      throw error;
    }
  }

  /**
   * Delete a thread
   * @param {string} threadId - The thread ID
   * @returns {Promise<Object>} The response
   */
  async deleteThread(threadId) {
    try {
      const idToken = await this.getIdToken();
      
      const response = await fetch(`${this.endpoints.deleteThread}?threadId=${threadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting thread: ${response.statusText}`);
      }
      
      // Delete thread from Supabase
      await supabase
        .from('assistant_threads')
        .delete()
        .eq('user_id', auth.currentUser.uid)
        .eq('thread_id', threadId);
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }
  }

  /**
   * Send a message and wait for the assistant's response
   * @param {string} threadId - The thread ID
   * @param {string} content - The message content
   * @returns {Promise<Object>} The assistant's response
   */
  async sendMessageAndWaitForResponse(threadId, content) {
    try {
      const assistant = await this.getUserAssistant();
      if (!assistant) {
        throw new Error('No assistant found for user');
      }
      
      const idToken = await this.getIdToken();
      
      const response = await fetch(this.endpoints.sendMessageAndWaitForResponse, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          threadId, 
          content,
          assistantId: assistant.assistant_id 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message and waiting for response:', error);
      throw error;
    }
  }

  /**
   * Get user threads
   * @returns {Promise<Array>} Array of threads
   */
  async getUserThreads() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('assistant_threads')
        .select('*')
        .eq('user_id', user.uid)
        .order('last_accessed_at', { ascending: false });
      
      if (error) {
        console.error('Error getting user threads:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user threads:', error);
      throw error;
    }
  }

  /**
   * Upload a file for the assistant
   * @param {File} file - The file to upload
   * @param {string} threadId - Optional thread ID
   * @returns {Promise<Object>} The uploaded file data
   */
  async uploadAssistantFile(file, threadId = null) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const filePath = `${user.uid}/${Date.now()}_${file.name}`;
      
      // Upload directly to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assistant-files')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }
      
      // Create file record in database
      const { data, error } = await supabase
        .from('assistant_files')
        .insert([
          {
            user_id: user.uid,
            thread_id: threadId,
            filename: file.name,
            file_size: file.size,
            file_path: filePath
          }
        ])
        .select();
      
      if (error) {
        console.error('Error creating file record:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Error uploading assistant file:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new AssistantService();
