import { supabase } from '../config/supabase';
import UserService from './UserService';

// InstantlyService for integrating with Instantly.ai API
class InstantlyService {
  constructor() {
    this.baseUrl = 'https://api.instantly.ai/api/v2';
  }

  // Get API key from user profile
  async getApiKey(userId) {
    try {
      return await UserService.getInstantlyApiKey(userId);
    } catch (error) {
      console.error('Error fetching Instantly API key:', error);
      throw new Error('Unable to retrieve API key. Please check your profile settings.');
    }
  }

  // Make authenticated request to Instantly API
  async makeRequest(userId, endpoint, method = 'GET', data = null) {
    try {
      const apiKey = await this.getApiKey(userId);
      
      if (!apiKey) {
        throw new Error('No API key found. Please add your Instantly.ai API key in your profile.');
      }

      const url = `${this.baseUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error communicating with Instantly.ai');
      }

      return result;
    } catch (error) {
      console.error('Instantly API request failed:', error);
      throw error;
    }
  }

  // Get all campaigns
  async getCampaigns(userId) {
    return this.makeRequest(userId, '/campaign');
  }

  // Get a specific campaign
  async getCampaign(userId, campaignId) {
    return this.makeRequest(userId, `/campaign/${campaignId}`);
  }

  // Create a new lead list
  async createLeadList(userId, name, description = '') {
    return this.makeRequest(userId, '/lead-list', 'POST', {
      name,
      description
    });
  }

  // Upload leads to a lead list
  async uploadLeadsToList(userId, leadListId, leads) {
    return this.makeRequest(userId, `/lead-list/${leadListId}/lead`, 'POST', {
      leads
    });
  }

  // Add lead list to campaign
  async addLeadListToCampaign(userId, campaignId, leadListId) {
    return this.makeRequest(userId, `/campaign/${campaignId}/lead-list/${leadListId}`, 'POST');
  }

  // Transform Airtable data to Instantly leads format
  transformAirtableToInstantly(airtableData, fieldMapping) {
    try {
      return airtableData.map(record => {
        const lead = {};
        
        // Email is required
        if (fieldMapping.email && record[fieldMapping.email]) {
          lead.email = record[fieldMapping.email];
        } else {
          throw new Error('Email field is required for each lead');
        }
        
        // Optional fields
        if (fieldMapping.firstName && record[fieldMapping.firstName]) {
          lead.firstName = record[fieldMapping.firstName];
        }
        
        if (fieldMapping.lastName && record[fieldMapping.lastName]) {
          lead.lastName = record[fieldMapping.lastName];
        }
        
        if (fieldMapping.companyName && record[fieldMapping.companyName]) {
          lead.companyName = record[fieldMapping.companyName];
        }
        
        // Custom fields
        const customFields = {};
        Object.entries(fieldMapping)
          .filter(([key]) => !['email', 'firstName', 'lastName', 'companyName'].includes(key))
          .forEach(([key, value]) => {
            if (record[value]) {
              customFields[key] = record[value];
            }
          });
        
        if (Object.keys(customFields).length > 0) {
          lead.customFields = customFields;
        }
        
        return lead;
      });
    } catch (error) {
      console.error('Error transforming Airtable data to Instantly format:', error);
      throw error;
    }
  }

  // Complete workflow to upload leads from Airtable to Instantly
  async uploadAirtableDataToCampaign(userId, campaignId, airtableData, fieldMapping) {
    try {
      // 1. Transform data
      const leads = this.transformAirtableToInstantly(airtableData, fieldMapping);
      
      // 2. Create a new lead list
      const listName = `LeadLines Upload - ${new Date().toISOString().split('T')[0]}`;
      const leadList = await this.createLeadList(userId, listName, 'Created by LeadLines');
      
      // 3. Upload leads to the list
      await this.uploadLeadsToList(userId, leadList.id, leads);
      
      // 4. Add lead list to campaign
      await this.addLeadListToCampaign(userId, campaignId, leadList.id);
      
      return {
        success: true,
        campaignId,
        leadListId: leadList.id,
        leadsCount: leads.length
      };
    } catch (error) {
      console.error('Error uploading data to Instantly campaign:', error);
      throw error;
    }
  }
}

export default new InstantlyService(); 