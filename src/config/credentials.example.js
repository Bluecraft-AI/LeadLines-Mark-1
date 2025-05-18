/**
 * Centralized credentials management for LeadLines - EXAMPLE FILE
 * 
 * This is an example file showing the structure of the credentials.js file.
 * Copy this file to credentials.js and add your actual API keys.
 * The credentials.js file should never be committed to version control.
 */

const credentials = {
  // OpenAI
  openai: {
    apiKey: 'your-openai-api-key-here', // Replace with your actual OpenAI API key
  },
  
  // Supabase
  supabase: {
    url: 'your-supabase-url-here',
    anonKey: 'your-supabase-anon-key-here',
  },
  
  // Add other services as needed
};

export default credentials; 