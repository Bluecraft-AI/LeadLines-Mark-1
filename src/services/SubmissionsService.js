import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';

/**
 * Service for managing CSV submissions with direct Firebase UID
 */
class SubmissionsService {
  /**
   * Create a new submission
   * @param {Object} submissionData - The submission data
   * @returns {Promise<Object>} The created submission
   */
  async createSubmission(submissionData) {
    try {
      console.log('Creating submission with user_id:', auth.currentUser.uid);
      
      // Ensure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Insert submission directly to Supabase
      // This works with the anonymous insert policy we've added
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
      
      // Get submissions directly from Supabase
      // This works with the RLS policy that allows users to view their own submissions
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting submissions:', error);
        throw error;
      }
      
      return data;
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
      
      return data || [];
    } catch (error) {
      console.error('Error searching submissions:', error);
      throw error;
    }
  }

  // Upload a CSV file to Supabase Storage
  async uploadCSVFile(file, userId) {
    try {
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      
      // Upload directly to Supabase Storage
      // This works with the anonymous upload policy we've added
      const { data, error } = await supabase.storage
        .from('csv-files')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Return the file path for the submission
      return filePath;
    } catch (error) {
      console.error('Error uploading CSV file:', error);
      throw error;
    }
  }

  // Update a submission's status
  async updateSubmissionStatus(submissionId, status, processedFilePath = null) {
    try {
      const { data, error } = await supabase
        .from('csv_submissions')
        .update({
          status: status,
          processed_file_path: processedFilePath
        })
        .eq('id', submissionId)
        .eq('user_id', auth.currentUser.uid)
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

  // Update a submission's name
  async updateSubmissionName(submissionId, customName) {
    try {
      const { data, error } = await supabase
        .from('csv_submissions')
        .update({
          custom_name: customName
        })
        .eq('id', submissionId)
        .eq('user_id', auth.currentUser.uid)
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

  // Search submissions by name
  async searchSubmissionsByName(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', auth.currentUser.uid)
        .ilike('custom_name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error searching submissions:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error searching submissions:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
}

// Export a singleton instance
export default new SubmissionsService();
