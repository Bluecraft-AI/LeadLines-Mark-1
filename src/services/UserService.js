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
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile data
  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Store Instantly.ai API key
  async saveInstantlyApiKey(userId, apiKey) {
    try {
      // In a production environment, API keys should be encrypted
      const { data, error } = await supabase
        .from('api_keys')
        .upsert({ 
          user_id: userId, 
          service: 'instantly', 
          api_key: apiKey,
          updated_at: new Date()
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving Instantly API key:', error);
      throw error;
    }
  }

  // Get Instantly.ai API key
  async getInstantlyApiKey(userId) {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('service', 'instantly')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data?.api_key || null;
    } catch (error) {
      console.error('Error fetching Instantly API key:', error);
      throw error;
    }
  }
}

export default new UserService(); 