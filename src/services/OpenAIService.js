import { createClient } from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = createClient({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai; 