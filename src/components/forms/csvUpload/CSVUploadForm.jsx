import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../config/supabase';
import SubmissionsService from '../../../services/SubmissionsService';
import AssistantService from '../../../services/AssistantService';

const CSVUploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [emailCount, setEmailCount] = useState('');
  const [submissionName, setSubmissionName] = useState('');
  const [campaignAngle, setCampaignAngle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [assistantId, setAssistantId] = useState('');
  const fileInputRef = useRef(null);
  const fileDropAreaRef = useRef(null);
  const { currentUser } = useAuth();
  
  // Webhook URL - in a production app, this would be stored in environment variables
  const WEBHOOK_URL = "https://bluecraftleads.app.n8n.cloud/webhook/363e4379-80f1-49b0-8d2f-e5ad1bc61f85";

  // Fetch the user's assistant ID in the background
  useEffect(() => {
    const fetchAssistantId = async () => {
      try {
        if (currentUser) {
          const assistant = await AssistantService.getUserAssistant();
          if (assistant && assistant.assistant_id) {
            setAssistantId(assistant.assistant_id);
            console.log('Fetched assistant ID for CSV upload:', assistant.assistant_id);
          }
        }
      } catch (err) {
        console.error('Error fetching assistant ID:', err);
        // Silently fail - don't show error to user
      }
    };

    fetchAssistantId();
  }, [currentUser]);

  // Handle drag and drop events
  useEffect(() => {
    const fileDropArea = fileDropAreaRef.current;
    if (!fileDropArea) return;

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => {
      fileDropArea.classList.add('dragover');
    };

    const unhighlight = () => {
      fileDropArea.classList.remove('dragover');
    };

    const handleDrop = (e) => {
      unhighlight();
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, unhighlight, false);
    });

    fileDropArea.addEventListener('drop', handleDrop, false);

    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.removeEventListener(eventName, preventDefaults, false);
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.removeEventListener(eventName, highlight, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.removeEventListener(eventName, unhighlight, false);
      });

      fileDropArea.removeEventListener('drop', handleDrop, false);
    };
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // Handle click on the file drop area to trigger file input
  const handleFileDropAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process selected files
  const handleFiles = (files) => {
    if (files.length === 0) return;
    
    // Only take the first file
    const file = files[0];
    
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      showStatusMessage(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showStatusMessage(`File ${file.name} is not a CSV file.`, 'error');
      return;
    }
    
    // Replace any existing file with the new one
    setSelectedFiles([file]);
  };

  // Remove a file from the selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Show status message
  const showStatusMessage = (text, type) => {
    setStatusMessage({ text, type });
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setStatusMessage({ text: '', type: '' });
    }, 5000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate UUID for this submission
      const submissionId = uuidv4();
      
      // Create FormData object
      const formData = new FormData();
      
      // Add metadata as form fields
      formData.append('submission_id', submissionId);
      formData.append('user_id', currentUser.uid);
      formData.append('user_email', currentUser.email);
      
      // Add assistant_id to the payload
      if (assistantId) {
        formData.append('assistant_id', assistantId);
      }
      
      // Add email count field if it has a value
      if (emailCount.trim()) {
        formData.append('number_of_emails', emailCount);
      }
      
      // Add submission name field if it has content
      if (submissionName.trim()) {
        formData.append('submission_name', submissionName);
      }
      
      // Add campaign angle field if it has content
      if (campaignAngle.trim()) {
        formData.append('campaign_angle', campaignAngle);
      }
      
      // Add the single file
      const file = selectedFiles[0];
      formData.append('files', file);
      formData.append('original_filename', file.name);
      
      // Create submission record in Supabase
      const { data, error } = await SubmissionsService.createSubmission({
        id: submissionId,
        user_id: currentUser.uid,
        user_email: currentUser.email,
        original_filename: file.name,
        custom_name: submissionName.trim() || file.name, // Use submission name if provided, otherwise use filename
        email_count: parseInt(emailCount) || 0
        // notes field removed entirely as requested
      });
      
      if (error) {
        showStatusMessage('Error creating submission record. Please try again.', 'error');
        setIsSubmitting(false);
        return;
      }
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await SubmissionsService.uploadFile(
        submissionId,  // First parameter should be submissionId
        file  // Second parameter should be the file
      );
      
      if (uploadError) {
        showStatusMessage('Error uploading file. Please try again.', 'error');
        // Delete the submission record if file upload fails
        await SubmissionsService.deleteSubmission(submissionId);
        setIsSubmitting(false);
        return;
      }
      
      // Send data to webhook with additional headers including assistant_id
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'x-user-id': currentUser.uid,
          'x-user-email': currentUser.email,
          'x-submission-id': submissionId,
          'x-original-filename': file.name,
          'x-assistant-id': assistantId || ''
        }
      });
      
      console.log('CSV Upload webhook payload sent:', {
        submission_id: submissionId,
        user_id: currentUser.uid,
        assistant_id: assistantId,
        filename: file.name,
        campaign_angle: campaignAngle
      });
      
      if (response.ok) {
        // Success
        showStatusMessage('Files uploaded successfully! Check the Submissions page for status updates.', 'success');
        resetForm();
      } else {
        // Error
        showStatusMessage('Error uploading files. Please try again.', 'error');
        
        // Delete the submission record if webhook fails
        await SubmissionsService.deleteSubmission(submissionId);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showStatusMessage('Error uploading files. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate form
  const validateForm = () => {
    if (selectedFiles.length === 0) {
      showStatusMessage('Please select a CSV file.', 'error');
      return false;
    }
    
    if (!emailCount.trim()) {
      showStatusMessage('Please enter the number of emails.', 'error');
      return false;
    }
    
    return true;
  };

  // Reset form
  const resetForm = () => {
    setSelectedFiles([]);
    setEmailCount('');
    setSubmissionName('');
    setCampaignAngle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text-dark mb-6">CSV Upload</h2>
      <p className="text-gray-600 mb-6">
        Upload your CSV file to generate personalized email sequences.
      </p>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-secondary text-white p-5 text-center">
          <h3 className="text-xl font-bold">LeadLines File Upload</h3>
          <p className="opacity-90">Upload Your CSV</p>
        </div>
        
        <div className="p-6">
          {statusMessage.text && (
            <div 
              className={`p-4 mb-6 rounded-md ${
                statusMessage.type === 'success' 
                  ? 'bg-green-100 border border-green-300 text-green-700' 
                  : 'bg-red-100 border border-red-300 text-red-700'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fileUpload" className="block font-semibold mb-2 after:content-['*'] after:ml-0.5 after:text-red-500">
                CSV File
              </label>
              <div 
                ref={fileDropAreaRef}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-secondary hover:bg-blue-50 transition-colors relative"
                onClick={handleFileDropAreaClick}
              >
                <div className="text-4xl mb-2">📂</div>
                <p>Drag & drop your CSV file here or click to browse</p>
                <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                <input 
                  type="file" 
                  id="fileUpload" 
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <p className="font-semibold">Selected file:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <span className="max-w-[180px] truncate">{file.name}</span>
                        <button 
                          type="button"
                          className="ml-2 text-red-500 font-bold"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the file dialog
                            removeFile(index);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="emailCount" className="block font-semibold mb-2 after:content-['*'] after:ml-0.5 after:text-red-500">
                Number of Emails
              </label>
              <input 
                type="number" 
                id="emailCount" 
                value={emailCount}
                onChange={(e) => setEmailCount(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter the number of emails in your CSV"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Specify how many email's you'd like to have in your sequence.</p>
            </div>
            
            <div>
              <label htmlFor="submissionName" className="block font-semibold mb-2">
                Submission Name
              </label>
              <input 
                type="text" 
                id="submissionName" 
                value={submissionName}
                onChange={(e) => setSubmissionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Enter the name of your submission here..."
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Add any name related to this submission for better organization.</p>
            </div>
            
            <div>
              <label htmlFor="campaignAngle" className="block font-semibold mb-2">
                Campaign Angle
              </label>
              <textarea 
                id="campaignAngle" 
                value={campaignAngle}
                onChange={(e) => setCampaignAngle(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary resize-vertical"
                placeholder="Describe your campaign angle, target audience, messaging approach, value propositions, etc..."
              />
              <p className="text-xs text-gray-500 mt-1">Please be as descriptive as possible - the more details you provide, the better we can tailor your email sequences.</p>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-secondary text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadForm;
