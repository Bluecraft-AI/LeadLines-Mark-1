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
          user_id: auth.currentUser.uid,
          user_email: auth.currentUser.email,
          original_filename: submissionData.originalFilename,
          custom_name: submissionData.customName,
          status: 'processing',
          notes: submissionData.notes,
          file_path: submissionData.filePath
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
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
        .eq('user_id', auth.currentUser.uid)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
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
        .eq('user_id', auth.currentUser.uid)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
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
        .eq('user_id', auth.currentUser.uid)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
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
        .eq('user_id', auth.currentUser.uid);
      
      if (error) {
        console.error('Supabase error:', error);
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
   * @returns {Promise<string>} The file path
   */
  async uploadFile(file) {
    try {
      // Ensure user is authenticated
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const filePath = `${auth.currentUser.uid}/${Date.now()}_${file.name}`;
      
      const { error } = await supabase.storage
        .from('csv-files')
        .upload(filePath, file);
      
      if (error) {
        console.error('Storage error:', error);
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
        console.error('Storage error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error downloading file:', error);
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
      
      // If search term is empty, return all submissions
      if (!searchTerm || searchTerm.trim() === '') {
        return this.getSubmissions();
      }
      
      // Convert search term to format expected by Supabase text search
      const formattedTerm = searchTerm.trim().split(/\s+/).join(' & ');
      
      const { data, error } = await supabase.rpc(
        'search_submissions_by_name',
        {
          p_user_id: auth.currentUser.uid,
          p_search_term: formattedTerm
        }
      );
      
      if (error) {
        console.error('Search error:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error searching submissions:', error);
      throw error;
    }
  }
}

export default new SubmissionsService();
