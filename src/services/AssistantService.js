import { supabase } from '../config/supabase';

/**
 * Service for managing OpenAI Assistant interactions
 */
class AssistantService {
  /**
   * Get the assistant ID for the current user
   * @param {string} userId - Firebase user ID
   * @returns {Promise<Object>} - Assistant ID or error
   */
  static async getUserAssistant(userId) {
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
  static async getUserThreads(userId) {
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
  static async createThread(userId, title = 'New Conversation') {
    try {
      // This would be replaced with actual OpenAI API call in the backend
      // For now, we'll simulate the response
      const threadId = `thread_${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('assistant_threads')
        .insert([{
          user_id: userId,
          thread_id: threadId,
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
  static async getUserFiles(userId) {
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
  static async uploadFile(file, userId, assistantId) {
    try {
      // This would be replaced with actual OpenAI API call in the backend
      // For now, we'll simulate the response
      const fileId = `file_${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase
        .from('assistant_files')
        .insert([{
          user_id: userId,
          assistant_id: assistantId,
          file_id: fileId,
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
  static async sendMessage(threadId, message, userId) {
    try {
      // This would be replaced with actual OpenAI API call in the backend
      // For now, we'll simulate the response
      
      // Update the last_message_at timestamp for the thread
      const { error: updateError } = await supabase
        .from('assistant_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
      
      // In a real implementation, this would call the OpenAI API
      // and return the assistant's response
      return { 
        response: "This is a simulated response. In the actual implementation, this would be the assistant's reply.",
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
  static async deleteThread(threadId, userId) {
    try {
      // This would be replaced with actual OpenAI API call in the backend
      // For now, we'll just delete from Supabase
      
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
  static async deleteFile(fileId, userId) {
    try {
      // This would be replaced with actual OpenAI API call in the backend
      // For now, we'll just delete from Supabase
      
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
}

export default AssistantService; 