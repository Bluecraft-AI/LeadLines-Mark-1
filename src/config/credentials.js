/**
 * Centralized credentials management for LeadLines
 * 
 * This file serves as a single location for all API keys and credentials
 * used throughout the application. For production, these values should
 * be replaced with environment variables.
 */

const credentials = {
  // OpenAI
  openai: {
    apiKey: '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', // Replace with your actual OpenAI API key
  },
  
  // Supabase (already configured elsewhere, but included here for completeness)
  supabase: {
    url: 'https://jaicupcmdaypybsbbacz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaWN1cGNtZGF5cHlic2JiYWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MzE4OTcsImV4cCI6MjA1OTMwNzg5N30.x4PDKEcqKhOlmY5B-9nBtewcB6voNG5SC0TJ2wQ1yQE',
  },
  
  // Add other services as needed
};

export default credentials; 