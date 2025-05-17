import { supabase } from '../config/supabase';

class SubmissionsService {
  /**
   * Create a new submission record
   * @param {Object} submission - Submission data
   * @param {string} submission.id - UUID for the submission
   * @param {string} submission.user_id - User ID
   * @param {string} submission.user_email - User email
   * @param {string} submission.original_filename - Original filename
   * @param {string} submission.custom_name - Custom name (defaults to original filename)
   * @param {number} submission.email_count - Number of emails requested
   * @param {string} submission.notes - Additional notes
   * @returns {Promise<Object>} - Created submission or error
   */
  static async createSubmission(submission) {
    try {
      const { data, error } = await supabase
        .from('csv_submissions')
        .insert([{
          id: submission.id,
          user_id: submission.user_id,
          user_email: submission.user_email,
          original_filename: submission.original_filename,
          custom_name: submission.custom_name || submission.original_filename,
          email_count: submission.email_count,
          notes: submission.notes,
          status: 'processing'
        }])
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error creating submission:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all submissions for a user
   * @param {string} userId - User ID
   * @param {string} status - Filter by status (optional)
   * @param {string} searchTerm - Search term for filtering by name (optional)
   * @returns {Promise<Object>} - List of submissions or error
   */
  static async getSubmissions(userId, status = null, searchTerm = null) {
    try {
      let query = supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (searchTerm) {
        query = query.or(`custom_name.ilike.%${searchTerm}%,original_filename.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single submission by ID
   * @param {string} submissionId - Submission UUID
   * @returns {Promise<Object>} - Submission data or error
   */
  static async getSubmissionById(submissionId) {
    try {
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching submission:', error);
      return { data: null, error };
    }
  }

  /**
   * Update submission status
   * @param {string} submissionId - Submission UUID
   * @param {string} status - New status ('processing', 'done', 'error')
   * @param {string} processedFilePath - Path to processed file (optional)
   * @returns {Promise<Object>} - Updated submission or error
   */
  static async updateSubmissionStatus(submissionId, status, processedFilePath = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (processedFilePath) {
        updateData.processed_file_path = processedFilePath;
      }

      const { data, error } = await supabase
        .from('csv_submissions')
        .update(updateData)
        .eq('id', submissionId)
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error updating submission status:', error);
      return { data: null, error };
    }
  }

  /**
   * Update submission name
   * @param {string} submissionId - Submission UUID
   * @param {string} customName - New custom name
   * @returns {Promise<Object>} - Updated submission or error
   */
  static async updateSubmissionName(submissionId, customName) {
    try {
      const { data, error } = await supabase
        .from('csv_submissions')
        .update({
          custom_name: customName,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error updating submission name:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a submission
   * @param {string} submissionId - Submission UUID
   * @returns {Promise<Object>} - Result of deletion operation
   */
  static async deleteSubmission(submissionId) {
    try {
      const { data, error } = await supabase
        .from('csv_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return { success: false, error };
    }
  }

  /**
   * Upload a file to Supabase Storage
   * @param {File} file - File to upload
   * @param {string} userId - User ID
   * @param {string} submissionId - Submission UUID
   * @returns {Promise<Object>} - Upload result or error
   */
  static async uploadFile(file, userId, submissionId) {
    try {
      const filePath = `${userId}/${submissionId}/${file.name}`;
      const { data, error } = await supabase.storage
        .from('csv-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a download URL for a file
   * @param {string} filePath - Path to the file in storage
   * @returns {Promise<Object>} - Download URL or error
   */
  static async getFileDownloadUrl(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('csv-files')
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

      if (error) throw error;
      return { url: data.signedUrl, error: null };
    } catch (error) {
      console.error('Error getting download URL:', error);
      return { url: null, error };
    }
  }
}

export default SubmissionsService; 