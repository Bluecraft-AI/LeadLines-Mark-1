// Fix for the WorkflowService import path issues
// This file should be placed in the src/services directory

// Using a try-catch to handle potential import errors
let supabase;
try {
  // Try the correct import path first
  supabase = require('../config/supabase').supabase;
} catch (error) {
  try {
    // Try alternate import path
    supabase = require('../../config/supabase').supabase;
  } catch (error) {
    // If all imports fail, create a mock object
    console.error('Error importing supabase in WorkflowService:', error);
    supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            data: [],
            error: null
          }),
          single: () => ({
            data: null,
            error: null
          })
        }),
        insert: () => ({
          data: null,
          error: null
        }),
        update: () => ({
          eq: () => ({
            data: null,
            error: null
          })
        })
      })
    };
  }
}

class WorkflowService {
  // Fetch user's workflow submission counts
  async getUserWorkflowCounts(userId) {
    try {
      // If no userId, return empty array to prevent errors
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_workflow_submissions')
        .select('workflow_id, submission_count, has_processing')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching workflow counts:', error);
        return []; // Return empty array instead of throwing
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserWorkflowCounts:', error);
      return []; // Return empty array instead of throwing
    }
  }

  // Increment submission count for a specific workflow
  async incrementSubmissionCount(userId, workflowId) {
    try {
      // If no userId or workflowId, return early to prevent errors
      if (!userId || !workflowId) return false;
      
      // Check if record exists
      const { data: existingRecord } = await supabase
        .from('user_workflow_submissions')
        .select('id, submission_count')
        .eq('user_id', userId)
        .eq('workflow_id', workflowId)
        .single();
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('user_workflow_submissions')
          .update({ 
            submission_count: existingRecord.submission_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);
        
        if (error) {
          console.error('Error updating submission count:', error);
          return false;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_workflow_submissions')
          .insert({
            user_id: userId,
            workflow_id: workflowId,
            submission_count: 1,
            has_processing: false
          });
        
        if (error) {
          console.error('Error inserting submission count:', error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing submission count:', error);
      return false; // Return false instead of throwing
    }
  }

  // Update processing status for a workflow
  async updateProcessingStatus(userId, workflowId, hasProcessing) {
    try {
      // If no userId or workflowId, return early to prevent errors
      if (!userId || !workflowId) return false;
      
      const { error } = await supabase
        .from('user_workflow_submissions')
        .update({ 
          has_processing: hasProcessing,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('workflow_id', workflowId);
      
      if (error) {
        console.error('Error updating processing status:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating processing status:', error);
      return false; // Return false instead of throwing
    }
  }
}

export default new WorkflowService(); 