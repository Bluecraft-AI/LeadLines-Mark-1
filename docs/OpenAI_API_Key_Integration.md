# OpenAI API Key Integration for LeadLines

## Overview

This document provides instructions for securely adding your OpenAI API key to enable the AI Agent functionality in LeadLines. Proper configuration is essential for the chat interface to communicate with OpenAI's Assistants API.

## Prerequisites

1. An OpenAI account with API access
2. Your OpenAI API key
3. Access to your hosting environment

## Security Considerations

**IMPORTANT: Your OpenAI API key is a sensitive credential that should be protected.**

- NEVER commit your API key to version control
- NEVER hardcode the API key directly in source files
- ALWAYS use environment variables or secure secret management
- Restrict API key access to only those who absolutely need it

## Integration Steps

### 1. Obtain Your OpenAI API Key

1. Log in to your OpenAI account at [https://platform.openai.com/](https://platform.openai.com/)
2. Navigate to the API section
3. Click on "API keys" in the left sidebar
4. Click "Create new secret key"
5. Copy the generated API key (you won't be able to see it again)

### 2. Add Environment Variables

**For Development Environment:**

1. Locate the `.env` file in the root of your project (or create one if it doesn't exist)
2. Add the following line:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual OpenAI API key
4. Save the file

**For Production Environment:**

1. Access your hosting platform's environment variable configuration
2. Add a new environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
3. Save the configuration
4. Restart your application server if necessary

### 3. Associate Users with Assistants

To use the AI Agent functionality, each user needs to be associated with an OpenAI Assistant ID. You can do this manually for testing or implement an automated process:

1. Connect to your Supabase database
2. Execute the following SQL to insert a user-assistant association:
   ```sql
   INSERT INTO user_assistants (user_id, assistant_id) 
   VALUES ('YOUR_FIREBASE_USER_ID', 'YOUR_OPENAI_ASSISTANT_ID');
   ```
3. Replace:
   - `YOUR_FIREBASE_USER_ID` with the user's Firebase UID
   - `YOUR_OPENAI_ASSISTANT_ID` with the ID of the OpenAI Assistant

## Testing the Integration

1. Start your development server
2. Log in to the LeadLines application
3. Navigate to the AI Agent section
4. Attempt to create a new thread
5. Send a test message
6. Verify that you receive a response from the assistant
7. Test file upload functionality

## Troubleshooting

### Common Issues

1. **API Key Invalid or Expired**
   - Error: "Authentication error" or "Invalid API key"
   - Solution: Generate a new API key in the OpenAI dashboard

2. **Environment Variable Not Set**
   - Error: "Cannot read property 'apiKey' of undefined"
   - Solution: Verify that the environment variable is correctly set and the server has been restarted

3. **Rate Limiting**
   - Error: "Rate limit exceeded"
   - Solution: Implement rate limiting or upgrade your OpenAI plan

4. **File Upload Issues**
   - Error: "File upload failed"
   - Solution: Check file size and format

## Costs and Usage

- Be aware that using the OpenAI API incurs costs based on usage
- Monitor your usage in the OpenAI dashboard
- Consider implementing rate limiting to control costs
- Regularly review your API usage patterns

## Support Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [OpenAI Assistants API Guide](https://platform.openai.com/docs/guides/assistants)
- [OpenAI Pricing](https://openai.com/pricing) 