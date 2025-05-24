import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';

/**
 * Service for handling CSV submissions with proper ID alignment
 * This implementation ensures:
 * 1. Direct mapping between submission IDs and storage paths
 * 2. Compatibility with n8n workflows
 * 3. Support for Firebase authentication
 * 4. Maximum permissions with minimal restrictions
 */
class SubmissionsService {
  /**
   * Creates a new submission
   * 
   * @param {Object} data - The submission data
   * @returns {Promise<Object>} - The created submission
   */
  async createSubmission(data) {
    try {
      // Get current user from Firebase auth
      const user = auth.currentUser;
      
      // Prepare submission data
      const submission = {
        ...data,
        user_id: user ? user.uid : data.user_id || 'anonymous',
        user_email: user ? user.email : data.user_email || 'anonymous@example.com',
        status: 'processing'
      };
      
      console.log('Creating submission with data:', submission);
      
      // Insert the submission
      const { data: result, error } = await supabase
        .from('csv_submissions')
        .insert(submission)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Created submission:', result);
      return result;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }
  
  /**
   * Uploads a CSV file to storage
   * 
   * @param {string} submissionId - The submission ID
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} - The upload result
   */
  async uploadCSVFile(submissionId, file) {
    try {
      // Get current user from Firebase auth
      const user = auth.currentUser;
      
      console.log('Uploading CSV file for submission_id:', submissionId);
      
      // Use submission ID directly in the path for proper alignment
      // This ensures direct mapping between table records and storage files
      const filePath = `${submissionId}/${Date.now()}_${file.name}`;
      
      console.log('File path:', filePath);
      
      // Upload the file
      const { data, error } = await supabase
        .storage
        .from('csv-files')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Update the submission with the file path
      await this.updateSubmissionFilePath(submissionId, filePath);
      
      console.log('File uploaded successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Updates a submission's file path
   * 
   * @param {string} submissionId - The submission ID
   * @param {string} filePath - The file path
   * @returns {Promise<Object>} - The updated submission
   */
  async updateSubmissionFilePath(submissionId, filePath) {
    try {
      console.log('Updating submission file path:', { submissionId, filePath });
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .update({ file_path: filePath })
        .eq('id', submissionId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Updated submission:', data);
      return data;
    } catch (error) {
      console.error('Error updating submission file path:', error);
      throw error;
    }
  }
  
  /**
   * Gets all submissions for the current user
   * 
   * @returns {Promise<Array>} - The user's submissions
   */
  async getSubmissions() {
    try {
      // Get current user from Firebase auth
      const user = auth.currentUser;
      
      if (!user) {
        console.error('User not authenticated when fetching submissions');
        return [];
      }
      
      console.log('Getting submissions for user ID:', user.uid);
      
      // Query submissions for the current user
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Log each submission for debugging
      if (data && data.length > 0) {
        console.log(`Retrieved ${data.length} submissions`);
        data.forEach((submission, index) => {
          console.log(`Submission ${index + 1}:`, submission);
        });
      } else {
        console.log('No submissions found for user');
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting submissions:', error);
      return [];
    }
  }
  
  /**
   * Gets a single submission by ID
   * 
   * @param {string} submissionId - The submission ID
   * @returns {Promise<Object>} - The submission
   */
  async getSubmission(submissionId) {
    try {
      console.log('Getting submission:', submissionId);
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();
      
      if (error) throw error;
      
      console.log('Retrieved submission:', data);
      return data;
    } catch (error) {
      console.error('Error getting submission:', error);
      throw error;
    }
  }
  
  /**
   * Updates a submission
   * 
   * @param {string} submissionId - The submission ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} - The updated submission
   */
  async updateSubmission(submissionId, updates) {
    try {
      console.log('Updating submission:', submissionId, updates);
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .update(updates)
        .eq('id', submissionId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Updated submission:', data);
      return data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }
  
  /**
   * Updates a submission's name
   * 
   * @param {string} submissionId - The submission ID
   * @param {string} customName - The new custom name
   * @returns {Promise<Object>} - The updated submission
   */
  async updateSubmissionName(submissionId, customName) {
    try {
      console.log('Updating submission name:', { submissionId, customName });
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .update({ custom_name: customName })
        .eq('id', submissionId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Updated submission name:', data);
      return data;
    } catch (error) {
      console.error('Error updating submission name:', error);
      throw error;
    }
  }
  
  /**
   * Deletes a submission
   * 
   * @param {string} submissionId - The submission ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteSubmission(submissionId) {
    try {
      console.log('Deleting submission:', submissionId);
      
      const { error } = await supabase
        .from('csv_submissions')
        .delete()
        .eq('id', submissionId);
      
      if (error) throw error;
      
      console.log('Deleted submission:', submissionId);
      return true;
    } catch (error) {
      console.error('Error deleting submission:', error);
      return false;
    }
  }
  
  /**
   * Gets a file download URL
   * 
   * @param {string} path - The file path
   * @returns {Promise<string>} - The download URL
   */
  async getFileDownloadUrl(path) {
    try {
      console.log('Getting download URL for path:', path);
      
      // Handle NULL/MISSING paths
      if (!path || path === 'NULL/MISSING') {
        console.error('Cannot download: File path is NULL/MISSING');
        throw new Error('Cannot download: File is still being processed or unavailable.');
      }
      
      // Create a signed URL
      const { data, error } = await supabase
        .storage
        .from('csv-files')
        .createSignedUrl(path, 60); // 60 seconds expiry
      
      if (error) throw error;
      
      console.log('Generated download URL:', data);
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file download URL:', error);
      throw new Error('Cannot download: Error generating download link.');
    }
  }
  
  /**
   * Gets a processed file download URL
   * 
   * @param {string} submissionId - The submission ID
   * @returns {Promise<Object>} - The download URL and submission data
   */
  async getProcessedFileUrl(submissionId) {
    try {
      console.log('Getting processed file for submission:', submissionId);
      
      // Get the submission
      const submission = await this.getSubmission(submissionId);
      
      // Check if processed file exists
      if (!submission.processed_file_path || submission.processed_file_path === 'NULL/MISSING') {
        throw new Error('Processed file not available yet.');
      }
      
      // Get the download URL
      const downloadUrl = await this.getFileDownloadUrl(submission.processed_file_path);
      
      return { downloadUrl, submission };
    } catch (error) {
      console.error('Error getting processed file URL:', error);
      throw error;
    }
  }
  
  /**
   * Searches submissions by term
   * 
   * @param {string} searchTerm - The search term
   * @returns {Promise<Array>} - The matching submissions
   */
  async searchSubmissions(searchTerm) {
    try {
      // Get current user from Firebase auth
      const user = auth.currentUser;
      
      if (!user) {
        console.error('User not authenticated when searching submissions');
        return [];
      }
      
      console.log('Searching submissions for user_id:', user.uid, 'with term:', searchTerm);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getSubmissions();
      }
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', user.uid)
        .or(`custom_name.ilike.%${searchTerm}%,original_filename.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Search results:', data);
      return data || [];
    } catch (error) {
      console.error('Error searching submissions:', error);
      return [];
    }
  }
  
  /**
   * Searches submissions by name
   * 
   * @param {string} searchTerm - The search term
   * @returns {Promise<Array>} - The matching submissions
   */
  async searchSubmissionsByName(searchTerm) {
    try {
      // Get current user from Firebase auth
      const user = auth.currentUser;
      
      if (!user) {
        console.error('User not authenticated when searching submissions by name');
        return [];
      }
      
      console.log('Searching submissions by name for user_id:', user.uid, 'with term:', searchTerm);
      
      const { data, error } = await supabase
        .from('csv_submissions')
        .select('*')
        .eq('user_id', user.uid)
        .ilike('custom_name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Search by name results:', data);
      return data || [];
    } catch (error) {
      console.error('Error searching submissions by name:', error);
      return [];
    }
  }
}

export default new SubmissionsService();
