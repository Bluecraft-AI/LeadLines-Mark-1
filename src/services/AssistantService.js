import { supabase } from '../config/supabase';
import { auth } from '../config/firebase';

/**
 * Service for managing OpenAI Assistants through Firebase Functions
 */
class AssistantService {
  /**
   * Get the Supabase UUID for the current Firebase user
   * @returns {Promise<string>} The Supabase UUID
   */
  async getSupabaseUuid() {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .rpc('get_or_create_supabase_uuid', {
          p_firebase_uid: auth.currentUser.uid,
          p_email: auth.currentUser.email
        });
      
      if (error) {
        console.error('RPC error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Failed to get or create Supabase UUID');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting Supabase UUID:', error);
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
      
      // First get the Supabase UUID from auth_mapping
      const { data: mappingData, error: mappingError } = await supabase
        .from('auth_mapping')
        .select('supabase_uuid')
        .eq('firebase_uid', user.uid)
        .single();
      
      if (mappingError) {
        console.error('Error getting user mapping:', mappingError);
        throw mappingError;
      }
      
      if (!mappingData || !mappingData.supabase_uuid) {
        throw new Error('User mapping not found');
      }
      
      const supabaseUuid = mappingData.supabase_uuid;
      
      // Now get the assistant using the Supabase UUID
      const { data, error } = await supabase
        .from('user_assistants')
        .select('*')
        .eq('user_id', supabaseUuid)
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
   * Create a new thread
   * @returns {Promise<Object>} The created thread
   */
  async createThread() {
    try {
      const { data, error } = await supabase
        .from('assistant_threads')
        .insert([
          { user_id: auth.currentUser.uid }
        ])
        .select();
      
      if (error) {
        console.error('Error creating thread:', error);
        throw error;
      }
      
      return data[0];
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
      const supabaseUuid = await this.getSupabaseUuid();
      
      const { data, error } = await supabase
        .from('assistant_threads')
        .select('*')
        .eq('user_id', supabaseUuid)
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
      const response = await fetch('/api/openai/createMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ threadId, content })
      });
      
      if (!response.ok) {
        throw new Error(`Error creating message: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update last_message_at in Supabase
      const supabaseUuid = await this.getSupabaseUuid();
      await supabase
        .from('assistant_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('user_id', supabaseUuid)
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
      
      const response = await fetch('/api/openai/runAssistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ 
          threadId, 
          assistantId: assistant.assistant_id 
        })
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
      const response = await fetch(`/api/openai/getRun?threadId=${threadId}&runId=${runId}`, {
        headers: {
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
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
      const response = await fetch(`/api/openai/listMessages?threadId=${threadId}`, {
        headers: {
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
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
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/openai/uploadFile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Error uploading file: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store file information in Supabase
      const supabaseUuid = await this.getSupabaseUuid();
      await supabase
        .from('assistant_files')
        .insert({
          user_id: supabaseUuid,
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
      
      const response = await fetch('/api/openai/attachFileToAssistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ 
          fileId, 
          assistantId: assistant.assistant_id 
        })
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
      const supabaseUuid = await this.getSupabaseUuid();
      
      const { data, error } = await supabase
        .from('assistant_files')
        .select('*')
        .eq('user_id', supabaseUuid)
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
      const response = await fetch(`/api/openai/deleteFile?fileId=${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting file: ${response.statusText}`);
      }
      
      // Delete file from Supabase
      const supabaseUuid = await this.getSupabaseUuid();
      await supabase
        .from('assistant_files')
        .delete()
        .eq('user_id', supabaseUuid)
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
      
      const response = await fetch('/api/openai/removeFileFromAssistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ 
          fileId, 
          assistantId: assistant.assistant_id 
        })
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
      const response = await fetch(`/api/openai/deleteThread?threadId=${threadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting thread: ${response.statusText}`);
      }
      
      // Delete thread from Supabase
      const supabaseUuid = await this.getSupabaseUuid();
      await supabase
        .from('assistant_threads')
        .delete()
        .eq('user_id', supabaseUuid)
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
      // Create message
      await this.createMessage(threadId, content);
      
      // Run assistant
      const runResult = await this.runAssistant(threadId);
      
      // Poll for run completion
      const maxAttempts = 30;
      const pollInterval = 1000;
      let attempts = 0;
      
      const pollRun = async () => {
        attempts++;
        
        const runStatus = await this.getRun(threadId, runResult.runId);
        
        if (runStatus.status === 'completed') {
          // Get the messages after run completes
          const messages = await this.listMessages(threadId);
          return messages;
        } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
          throw new Error(`Run ${runStatus.status}: ${runStatus.error?.message || 'Unknown error'}`);
        } else if (attempts >= maxAttempts) {
          throw new Error('Timed out waiting for assistant response');
        } else {
          // Wait and poll again
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          return pollRun();
        }
      };
      
      return await pollRun();
    } catch (error) {
      console.error('Error sending message and waiting for response:', error);
      throw error;
    }
  }

  // Get user threads
  async getUserThreads() {
    try {
      const { data, error } = await supabase
        .from('assistant_threads')
        .select('*')
        .eq('user_id', auth.currentUser.uid)
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

  // Upload a file for the assistant
  async uploadAssistantFile(file, threadId = null) {
    try {
      const filePath = `${auth.currentUser.uid}/${Date.now()}_${file.name}`;
      
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
            user_id: auth.currentUser.uid,
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
