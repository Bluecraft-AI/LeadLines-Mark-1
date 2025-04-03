// Airtable configuration for form submissions and lead data
import Airtable from 'airtable';

// Replace with your actual Airtable API key and base ID when implementing
const AIRTABLE_API_KEY = 'YOUR_AIRTABLE_API_KEY';
const AIRTABLE_BASE_ID = 'YOUR_AIRTABLE_BASE_ID';

// Initialize Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY
});

const airtableBase = Airtable.base(AIRTABLE_BASE_ID);

export { airtableBase }; 