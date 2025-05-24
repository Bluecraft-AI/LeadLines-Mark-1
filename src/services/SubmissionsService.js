import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';

/**
 * Service for managing CSV submissions with Firebase authentication
 */
class SubmissionsService {
  /**
   * Get all submissions for the current user
   * @returns {Promise<Array>} Array of submissions
   */
  async getSubmissions() {
    try {
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Getting submissions for user_id:', user.uid);
      
      // Get submissions directly from Supabase
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting submissions:', error);
        throw error;
      }
      
      console.log('Retrieved submissions:', data);
      return data;
    } catch (error) {
      console.error('Error getting submissions:', error);
      throw error;
    }
  }

  /**
   * Create a new submission
   * @param {Object} submissionData - The submission data
   * @returns {Promise<Object>} The created submission
   */
  async createSubmission(submissionData) {
    try {
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Creating submission with user_id:', user.uid);
      
      // Create a new submission with Firebase user ID
      const { data, error } = await supabase
        .from('csv_submissions')
        .insert([
          {
            user_id: user.uid,
            user_email: user.email,
            original_filename: submissionData.original_filename,
            custom_name: submissionData.custom_name || null,
            file_path: submissionData.file_path,
            notes: submissionData.notes || null,
            status: 'processing'
          }
        ])
        .select();
      
      if (error) {
        console.error('Supabase error creating submission:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Error creating submission:', error);
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.uid)
        .single();
      
      if (error) {
        console.error('Error getting submission:', error);
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.uid)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating submission:', error);
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('csv_submissions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.uid);
      
      if (error) {
        console.error('Error deleting submission:', error);
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const uid = userId || user.uid;
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
        console.error('Error uploading file:', error);
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.storage
        .from('csv-files')
        .download(filePath);
      
      if (error) {
        console.error('Error downloading file:', error);
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.storage
        .from('csv-files')
        .createSignedUrl(filePath, 3600);
      
      if (error) {
        console.error('Error creating signed URL:', error);
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Searching submissions for user_id:', user.uid, 'with term:', searchTerm);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return this.getSubmissions();
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', user.uid)
        .or(`custom_name.ilike.%${searchTerm}%,original_filename.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error searching submissions:', error);
        throw error;
      }
      
      console.log('Search results:', data);
      return data || [];
    } catch (error) {
      console.error('Error searching submissions:', error);
      throw error;
    }
  }

  /**
   * Upload a CSV file to Supabase Storage
   * @param {File} file - The file to upload
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<string>} The file path
   */
  async uploadCSVFile(file, userId) {
    try {
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Uploading CSV file for user_id:', user.uid);
      
      // Use the provided userId or default to the current user's ID
      const actualUserId = userId || user.uid;
      const filePath = `${actualUserId}/${Date.now()}_${file.name}`;
      
      console.log('File path:', filePath);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('csv-files')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      console.log('File uploaded successfully:', data);
      
      // Return the file path for the submission
      return filePath;
    } catch (error) {
      console.error('Error uploading CSV file:', error);
      throw error;
    }
  }

  /**
   * Update a submission's status
   * @param {string} submissionId - The submission ID
   * @param {string} status - The new status
   * @param {string} processedFilePath - Optional processed file path
   * @returns {Promise<Object>} The updated submission
   */
  async updateSubmissionStatus(submissionId, status, processedFilePath = null) {
    try {
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .update({
          status: status,
          processed_file_path: processedFilePath
        })
        .eq('id', submissionId)
        .eq('user_id', user.uid)
        .select();
      
      if (error) {
        console.error('Error updating submission status:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  }

  /**
   * Update a submission's name
   * @param {string} submissionId - The submission ID
   * @param {string} customName - The new custom name
   * @returns {Promise<Object>} The updated submission
   */
  async updateSubmissionName(submissionId, customName) {
    try {
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .update({
          custom_name: customName
        })
        .eq('id', submissionId)
        .eq('user_id', user.uid)
        .select();
      
      if (error) {
        console.error('Error updating submission name:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Error updating submission name:', error);
      throw error;
    }
  }

  /**
   * Search submissions by name
   * @param {string} searchTerm - The search term
   * @returns {Promise<Array>} Array of matching submissions
   */
  async searchSubmissionsByName(searchTerm) {
    try {
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Searching submissions by name for user_id:', user.uid, 'with term:', searchTerm);
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', user.uid)
        .ilike('custom_name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error searching submissions:', error);
        throw error;
      }
      
      console.log('Search by name results:', data);
      return data;
    } catch (error) {
      console.error('Error searching submissions:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new SubmissionsService();
