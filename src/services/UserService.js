import { supabase } from '../config/supabase';

// User service for managing user data in Supabase
class UserService {
  // Get user profile data
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Create or update user profile data
  async upsertUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date()
        });
      
      if (error) {
        console.error('Error upserting user profile:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in upsertUserProfile:', error);
      return false;
    }
  }

  // Store API key for a service
  async saveApiKey(userId, service, apiKey) {
    try {
      // In a production environment, API keys should be encrypted
      const { data, error } = await supabase
        .from('api_keys')
        .upsert({ 
          user_id: userId, 
          service: service, 
          api_key: apiKey,
          updated_at: new Date()
        });
      
      if (error) {
        console.error(`Error saving ${service} API key:`, error);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error in saveApiKey for ${service}:`, error);
      return false;
    }
  }

  // Get API key for a service
  async getApiKey(userId, service) {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('service', service)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error(`Error fetching ${service} API key:`, error);
        }
        return null;
      }
      return data?.api_key || null;
    } catch (error) {
      console.error(`Error in getApiKey for ${service}:`, error);
      return null;
    }
  }

  // Delete API key for a service
  async deleteApiKey(userId, service) {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', userId)
        .eq('service', service);
      
      if (error) {
        console.error(`Error deleting ${service} API key:`, error);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Error in deleteApiKey for ${service}:`, error);
      return false;
    }
  }
}

export default new UserService();
