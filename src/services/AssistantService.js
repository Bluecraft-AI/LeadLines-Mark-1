import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { supabase } from '../config/supabase';

/**
 * AssistantService - A secure service for interacting with OpenAI Assistants API
 * via Firebase Functions proxy
 */
class AssistantService {
  constructor() {
    this.functions = getFunctions();
    this.auth = getAuth();
  }

  /**
   * Get the current user's ID token for authentication
   * @returns {Promise<string>} The ID token
   */
  async getIdToken() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.getIdToken();
  }

  /**
   * Get the assistant ID for the current user
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} - Assistant ID or error
   */
  async getUserAssistant(userId) {
    try {
      const { data, error } = await supabase
        .from('user_assistants')
        .select('assistant_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user assistant:', error);
        return { assistantId: null, error };
      }

      return { assistantId: data.assistant_id, error: null };
    } catch (error) {
      console.error('Error getting user assistant:', error);
      return { assistantId: null, error };
    }
  }

  /**
   * Get all threads for a user
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} - List of threads or error
   */
  async getUserThreads(userId) {
    try {
      const { data, error } = await supabase
        .from('assistant_threads')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      return { threads: data, error: null };
    } catch (error) {
      console.error('Error getting user threads:', error);
      return { threads: [], error };
    }
  }

  /**
   * Create a new thread for a user
   * @param {string} userId - Firebase user ID
   * @param {string} title - Thread title (optional)
   * @returns {Promise<Object>} - Thread data or error
   */
  async createThread(userId, title = 'New Conversation') {
    try {
      // Create a thread using Firebase Function
      const createThreadFn = httpsCallable(this.functions, 'createThread');
      const result = await createThreadFn();
      const thread = result.data;
      
      // Store the thread in Supabase
      const { data, error } = await supabase
        .from('assistant_threads')
        .insert([{
          user_id: userId,
          thread_id: thread.id,
          title: title,
        }])
        .select();

      if (error) throw error;
      
      return { thread: data[0], error: null };
    } catch (error) {
      console.error('Error creating thread:', error);
      return { thread: null, error };
    }
  }

  /**
   * Get all files associated with a user's assistant
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} - List of files or error
   */
  async getUserFiles(userId) {
    try {
      const { data, error } = await supabase
        .from('assistant_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { files: data, error: null };
    } catch (error) {
      console.error('Error getting user files:', error);
      return { files: [], error };
    }
  }

  /**
   * Upload a file to OpenAI and associate it with the user's assistant
   * @param {File} file - File to upload
   * @param {string} userId - Firebase user ID
   * @param {string} assistantId - OpenAI Assistant ID
   * @returns {Promise<Object>} - File data or error
   */
  async uploadFile(file, userId, assistantId) {
    try {
      // Convert file to base64
      const fileData = await this.fileToBase64(file);
      
      // Upload file using Firebase Function
      const uploadFileFn = httpsCallable(this.functions, 'uploadFile');
      const uploadResult = await uploadFileFn({
        fileData,
        fileName: file.name,
        fileType: file.type,
        purpose: 'assistants'
      });
      const uploadedFile = uploadResult.data;
      
      // Attach the file to the assistant
      const attachFileFn = httpsCallable(this.functions, 'attachFileToAssistant');
      await attachFileFn({
        assistantId,
        fileId: uploadedFile.id
      });
      
      // Store the file reference in Supabase
      const { data, error } = await supabase
        .from('assistant_files')
        .insert([{
          user_id: userId,
          assistant_id: assistantId,
          file_id: uploadedFile.id,
          filename: file.name,
          file_size: file.size,
          file_type: file.type,
        }])
        .select();

      if (error) throw error;
      
      return { file: data[0], error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { file: null, error };
    }
  }

  /**
   * Send a message to the assistant and get a response
   * @param {string} threadId - OpenAI Thread ID
   * @param {string} message - User message
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} - Response message or error
   */
  async sendMessage(threadId, message, userId) {
    try {
      // Get the assistant ID for this user
      const { assistantId, error: assistantError } = await this.getUserAssistant(userId);
      if (assistantError) throw assistantError;
      
      // Use the combined Firebase Function to send message and wait for response
      const sendAndWaitFn = httpsCallable(this.functions, 'sendMessageAndWaitForResponse');
      const result = await sendAndWaitFn({
        threadId,
        message,
        assistantId
      });
      
      // Update the last_message_at timestamp for the thread
      const { error: updateError } = await supabase
        .from('assistant_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
      
      // Return the assistant's response
      return { 
        response: result.data.response,
        error: null 
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return { response: null, error };
    }
  }

  /**
   * Delete a thread
   * @param {string} threadId - OpenAI Thread ID
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} - Success status or error
   */
  async deleteThread(threadId, userId) {
    try {
      // Delete the thread using Firebase Function
      const deleteThreadFn = httpsCallable(this.functions, 'deleteThread');
      await deleteThreadFn({ threadId });
      
      // Delete the thread from Supabase
      const { error } = await supabase
        .from('assistant_threads')
        .delete()
        .eq('thread_id', threadId)
        .eq('user_id', userId);

      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting thread:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a file
   * @param {string} fileId - OpenAI File ID
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} - Success status or error
   */
  async deleteFile(fileId, userId) {
    try {
      // Get the assistant ID for this user
      const { assistantId, error: assistantError } = await this.getUserAssistant(userId);
      if (assistantError) throw assistantError;
      
      // Remove the file from the assistant using Firebase Function
      const removeFileFn = httpsCallable(this.functions, 'removeFileFromAssistant');
      await removeFileFn({ assistantId, fileId });
      
      // Delete the file using Firebase Function
      const deleteFileFn = httpsCallable(this.functions, 'deleteFile');
      await deleteFileFn({ fileId });
      
      // Delete the file reference from Supabase
      const { error } = await supabase
        .from('assistant_files')
        .delete()
        .eq('file_id', fileId)
        .eq('user_id', userId);

      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error };
    }
  }

  /**
   * Convert a file to base64
   * @param {File} file - The file to convert
   * @returns {Promise<string>} The base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Create a singleton instance
const assistantService = new AssistantService();
export default assistantService; 