import { airtableBase } from '../config/airtable';

// AirtableService for managing form submissions and lead data
class AirtableService {
  // Submit form data to Airtable
  async submitFormData(tableName, formData) {
    try {
      const result = await airtableBase(tableName).create([
        {
          fields: formData
        }
      ]);
      
      return result;
    } catch (error) {
      console.error(`Error submitting data to ${tableName}:`, error);
      throw error;
    }
  }

  // Get submissions with status
  async getSubmissions(tableName, userId, status = null) {
    try {
      let query = airtableBase(tableName).select({
        filterByFormula: `{user_id} = '${userId}'`,
        sort: [{ field: 'created_at', direction: 'desc' }]
      });
      
      if (status) {
        query = airtableBase(tableName).select({
          filterByFormula: `AND({user_id} = '${userId}', {status} = '${status}')`,
          sort: [{ field: 'created_at', direction: 'desc' }]
        });
      }
      
      const records = await query.all();
      return records.map(record => ({
        id: record.id,
        ...record.fields
      }));
    } catch (error) {
      console.error(`Error fetching submissions from ${tableName}:`, error);
      throw error;
    }
  }

  // Get a single submission by ID
  async getSubmission(tableName, recordId) {
    try {
      const record = await airtableBase(tableName).find(recordId);
      return {
        id: record.id,
        ...record.fields
      };
    } catch (error) {
      console.error(`Error fetching submission from ${tableName}:`, error);
      throw error;
    }
  }

  // Update submission status
  async updateSubmissionStatus(tableName, recordId, status) {
    try {
      const result = await airtableBase(tableName).update(recordId, {
        status: status
      });
      
      return result;
    } catch (error) {
      console.error(`Error updating status in ${tableName}:`, error);
      throw error;
    }
  }
}

export default new AirtableService(); 