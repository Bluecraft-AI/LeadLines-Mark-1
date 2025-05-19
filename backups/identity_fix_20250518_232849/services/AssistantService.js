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
      const { data, error } = await supabase
        .rpc('get_or_create_supabase_uuid', {
          p_firebase_uid: auth.currentUser.uid,
          p_email: auth.currentUser.email
        });
      
      if (error) throw error;
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
      const supabaseUuid = await this.getSupabaseUuid();
      
      const { data, error } = await supabase
        .from('user_assistants')
        .select('*')
        .eq('user_id', supabaseUuid)
        .single();
      
      if (error) throw error;
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
      const response = await fetch('/api/openai/createThread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error creating thread: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store thread in Supabase
      const supabaseUuid = await this.getSupabaseUuid();
      await supabase
        .from('assistant_threads')
        .insert({
          user_id: supabaseUuid,
          thread_id: data.threadId,
          title: 'New Conversation',
          metadata: {}
        });
      
      return data;
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
        method: 'GET',
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
        method: 'GET',
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
   * Upload a file
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} The uploaded file object
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
      
      // Store file in Supabase
      const supabaseUuid = await this.getSupabaseUuid();
      const assistant = await this.getUserAssistant();
      
      await supabase
        .from('assistant_files')
        .insert({
          user_id: supabaseUuid,
          assistant_id: assistant.assistant_id,
          file_id: data.fileId,
          filename: file.name,
          file_size: file.size,
          file_type: file.type,
          metadata: {}
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
   * @returns {Promise<Object>} The result
   */
  async attachFileToAssistant(fileId) {
    try {
      const assistant = await this.getUserAssistant();
      
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
   * Get all files for the current user's assistant
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
   * @returns {Promise<Object>} The result
   */
  async deleteFile(fileId) {
    try {
      const response = await fetch('/api/openai/deleteFile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ fileId })
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting file: ${response.statusText}`);
      }
      
      // Remove from Supabase
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
   * @returns {Promise<Object>} The result
   */
  async removeFileFromAssistant(fileId) {
    try {
      const assistant = await this.getUserAssistant();
      
      const response = await fetch('/api/openai/removeFileFromAssistant', {
        method: 'DELETE',
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
      console.error('Error removing file:', error);
      throw error;
    }
  }

  /**
   * Delete a thread
   * @param {string} threadId - The thread ID
   * @returns {Promise<Object>} The result
   */
  async deleteThread(threadId) {
    try {
      const response = await fetch('/api/openai/deleteThread', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ threadId })
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting thread: ${response.statusText}`);
      }
      
      // Remove from Supabase
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
   * @returns {Promise<Object>} The result with messages
   */
  async sendMessageAndWaitForResponse(threadId, content) {
    try {
      const response = await fetch('/api/openai/sendMessageAndWaitForResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ 
          threadId, 
          content,
          assistantId: (await this.getUserAssistant()).assistant_id
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }
      
      // Update last_message_at in Supabase
      const supabaseUuid = await this.getSupabaseUuid();
      await supabase
        .from('assistant_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('user_id', supabaseUuid)
        .eq('thread_id', threadId);
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message and waiting for response:', error);
      throw error;
    }
  }
}

export default new AssistantService();
