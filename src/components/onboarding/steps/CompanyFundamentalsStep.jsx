import React, { useState, useEffect } from 'react';

const CompanyFundamentalsStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData, clearPendingSave }) => {
  // Initialize state with saved data or defaults
  const [stepData, setStepData] = useState(formData || {
    // Basic Information
    companyName: '',
    websiteUrl: '',
    yearFounded: '',
    employeeCount: '',
    businessAddress: '',
    industry: '',
    
    // Contact Information
    contactName: '',
    contactTitle: '',
    contactPhone: '',
    contactEmail: '',
    
    // Online Presence
    companyLinkedinUrl: '',
    teamLinkedinUrls: '',
    socialMediaProfiles: '',
    additionalPages: ''
  });

  // Real-time save when stepData changes
  useEffect(() => {
    if (updateStepData) {
      updateStepData(stepData);
    }
  }, [stepData, updateStepData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStepData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any pending save operations before validation
    if (clearPendingSave) {
      clearPendingSave();
    }
    
    // Define required fields based on the questionnaire
    const requiredFields = [
      'companyName', 
      'websiteUrl', 
      'businessAddress', 
      'industry', 
      'contactName', 
      'contactTitle', 
      'contactPhone', 
      'contactEmail'
    ];
    
    const missingFields = requiredFields.filter(field => !stepData[field]?.trim());
    
    if (missingFields.length > 0) {
      const fieldDisplayNames = {
        'companyName': 'Company Name',
        'websiteUrl': 'Website URL',
        'businessAddress': 'Primary Business Address',
        'industry': 'Industry/Vertical',
        'contactName': 'Primary Contact Name',
        'contactTitle': 'Primary Contact Title',
        'contactPhone': 'Best Phone Number',
        'contactEmail': 'Best Email Address'
      };
      
      const missingFieldNames = missingFields.map(field => fieldDisplayNames[field]);
      alert(`Please fill in the following required fields:\n\n• ${missingFieldNames.join('\n• ')}`);
      return;
    }
    
    onNext(stepData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={stepData.companyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL *
            </label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={stepData.websiteUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="yearFounded" className="block text-sm font-medium text-gray-700 mb-2">
              Year Founded
            </label>
            <input
              type="number"
              id="yearFounded"
              name="yearFounded"
              value={stepData.yearFounded}
              onChange={handleChange}
              min="1800"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Employees
            </label>
            <select
              id="employeeCount"
              name="employeeCount"
              value={stepData.employeeCount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Select range</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="501-1000">501-1000</option>
              <option value="1000+">1000+</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Primary Business Address *
          </label>
          <input
            type="text"
            id="businessAddress"
            name="businessAddress"
            value={stepData.businessAddress}
            onChange={handleChange}
            placeholder="City, State, Country"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
            Industry/Vertical *
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={stepData.industry}
            onChange={handleChange}
            placeholder="e.g., SaaS, E-commerce, Consulting"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Contact Name *
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={stepData.contactName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="contactTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Contact Title *
            </label>
            <input
              type="text"
              id="contactTitle"
              name="contactTitle"
              value={stepData.contactTitle}
              onChange={handleChange}
              placeholder="e.g., CEO, Founder, Marketing Director"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Best Phone Number *
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={stepData.contactPhone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Best Email Address *
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={stepData.contactEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
        </div>
      </div>

      {/* Online Presence */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Online Presence
        </h3>
        
        <div>
          <label htmlFor="companyLinkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Company LinkedIn URL
          </label>
          <input
            type="url"
            id="companyLinkedinUrl"
            name="companyLinkedinUrl"
            value={stepData.companyLinkedinUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/company/your-company"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="teamLinkedinUrls" className="block text-sm font-medium text-gray-700 mb-2">
            Key Team Members' LinkedIn URLs
          </label>
          <textarea
            id="teamLinkedinUrls"
            name="teamLinkedinUrls"
            value={stepData.teamLinkedinUrls}
            onChange={handleChange}
            rows={4}
            placeholder="CEO: https://linkedin.com/in/ceo-name&#10;CTO: https://linkedin.com/in/cto-name&#10;VP Sales: https://linkedin.com/in/vp-name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="socialMediaProfiles" className="block text-sm font-medium text-gray-700 mb-2">
            Other Social Media Profiles (if relevant)
          </label>
          <textarea
            id="socialMediaProfiles"
            name="socialMediaProfiles"
            value={stepData.socialMediaProfiles}
            onChange={handleChange}
            rows={3}
            placeholder="Twitter: @yourcompany&#10;Facebook: facebook.com/yourcompany&#10;Instagram: @yourcompany"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="additionalPages" className="block text-sm font-medium text-gray-700 mb-2">
            Any Additional Landing Pages or Microsites
          </label>
          <textarea
            id="additionalPages"
            name="additionalPages"
            value={stepData.additionalPages}
            onChange={handleChange}
            rows={3}
            placeholder="Product-specific landing pages, campaign sites, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        {!isFirstStep && (
          <button 
            type="button" 
            onClick={onPrevious}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all font-medium"
          >
            Previous
          </button>
        )}
        
        <button 
          type="submit" 
          className={`px-6 py-3 bg-secondary text-white rounded-md hover:bg-opacity-90 transition-all font-medium ${isFirstStep ? 'ml-auto' : ''}`}
        >
          {isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </form>
  );
};

export default CompanyFundamentalsStep; 