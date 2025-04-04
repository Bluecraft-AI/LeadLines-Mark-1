import { supabase } from '../config/supabase';

class WorkflowService {
  // Fetch user's workflow submission counts
  async getUserWorkflowCounts(userId) {
    try {
      const { data, error } = await supabase
        .from('user_workflow_submissions')
        .select('workflow_id, submission_count, has_processing')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching workflow counts:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserWorkflowCounts:', error);
      throw error;
    }
  }

  // Increment submission count for a specific workflow
  async incrementSubmissionCount(userId, workflowId) {
    try {
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
        
        if (error) throw error;
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
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing submission count:', error);
      throw error;
    }
  }

  // Update processing status for a workflow
  async updateProcessingStatus(userId, workflowId, hasProcessing) {
    try {
      const { error } = await supabase
        .from('user_workflow_submissions')
        .update({ 
          has_processing: hasProcessing,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('workflow_id', workflowId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating processing status:', error);
      throw error;
    }
  }
}

export default new WorkflowService(); 