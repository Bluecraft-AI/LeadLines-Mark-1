import { supabase } from '../config/supabase';
import { auth } from '../config/firebase';

/**
 * Service for managing CSV submissions
 */
class SubmissionsService {
  /**
   * Create a new submission
   * @param {Object} submissionData - The submission data
   * @returns {Promise<Object>} The created submission
   */
  async createSubmission(submissionData) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .insert({
          user_id: auth.currentUser.uid, // Use Firebase UID directly for csv_submissions
          user_email: auth.currentUser.email,
          original_filename: submissionData.originalFilename || submissionData.original_filename,
          custom_name: submissionData.customName || submissionData.custom_name,
          status: 'processing',
          notes: submissionData.notes,
          file_path: submissionData.filePath,
          email_count: submissionData.email_count || submissionData.emailCount
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating submission:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  /**
   * Get all submissions for the current user
   * @returns {Promise<Array>} Array of submissions
   */
  async getSubmissions() {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', auth.currentUser.uid) // Use Firebase UID directly for csv_submissions
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error getting submissions:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting submissions:', error);
      throw error;
    }
  }

  /**
   * Get a submission by ID
   * @param {string} id - The submission ID
   * @returns {Promise<Object>} The submission
   */
  async getSubmission(id) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('id', id)
        .eq('user_id', auth.currentUser.uid) // Use Firebase UID directly for csv_submissions
        .single();
      
      if (error) {
        console.error('Supabase error getting submission:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting submission:', error);
      throw error;
    }
  }

  /**
   * Update a submission
   * @param {string} id - The submission ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} The updated submission
   */
  async updateSubmission(id, updates) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', auth.currentUser.uid) // Use Firebase UID directly for csv_submissions
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error updating submission:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }

  /**
   * Delete a submission
   * @param {string} id - The submission ID
   * @returns {Promise<void>}
   */
  async deleteSubmission(id) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('csv_submissions')
        .delete()
        .eq('id', id)
        .eq('user_id', auth.currentUser.uid); // Use Firebase UID directly for csv_submissions
      
      if (error) {
        console.error('Supabase error deleting submission:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }

  /**
   * Upload a CSV file
   * @param {File} file - The file to upload
   * @param {string} userId - User ID (optional, defaults to current user)
   * @param {string} submissionId - Submission ID (optional)
   * @returns {Promise<string>} The file path
   */
  async uploadFile(file, userId = null, submissionId = null) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Use provided userId or default to current user
      const uid = userId || auth.currentUser.uid;
      
      // Create file path
      let filePath;
      if (submissionId) {
        filePath = `${uid}/${submissionId}/${file.name}`;
      } else {
        filePath = `${uid}/${Date.now()}_${file.name}`;
      }
      
      const { data, error } = await supabase.storage
        .from('csv-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Storage error uploading file:', error);
        throw error;
      }
      
      return filePath;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Download a file
   * @param {string} filePath - The file path
   * @returns {Promise<Blob>} The file blob
   */
  async downloadFile(filePath) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.storage
        .from('csv-files')
        .download(filePath);
      
      if (error) {
        console.error('Storage error downloading file:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Get a download URL for a file
   * @param {string} filePath - The file path
   * @returns {Promise<string>} The download URL
   */
  async getFileDownloadUrl(filePath) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.storage
        .from('csv-files')
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour
      
      if (error) {
        console.error('Storage error creating signed URL:', error);
        throw error;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file download URL:', error);
      throw error;
    }
  }

  /**
   * Search submissions by name
   * @param {string} searchTerm - The search term
   * @returns {Promise<Array>} Array of matching submissions
   */
  async searchSubmissions(searchTerm) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .rpc('search_submissions_by_name', {
          p_user_id: auth.currentUser.uid,
          p_search_term: `%${searchTerm}%`
        });
      
      if (error) {
        console.error('Supabase error searching submissions:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error searching submissions:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new SubmissionsService();
