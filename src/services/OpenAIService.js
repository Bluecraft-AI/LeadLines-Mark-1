import OpenAI from 'openai';
import credentials from '../config/credentials';

// Initialize the OpenAI client with the API key from credentials
const openai = new OpenAI({
  apiKey: credentials.openai.apiKey,
});

export default openai;