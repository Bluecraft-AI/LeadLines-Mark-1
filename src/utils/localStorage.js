// src/utils/localStorage.js

// Save form data to localStorage
export const saveOnboardingProgress = (userId, formData) => {
  try {
    localStorage.setItem(`onboarding_${userId}`, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      formData
    }));
    return true;
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
    return false;
  }
};

// Load form data from localStorage
export const loadOnboardingProgress = (userId) => {
  try {
    const savedData = localStorage.getItem(`onboarding_${userId}`);
    if (!savedData) return null;
    
    const parsedData = JSON.parse(savedData);
    return parsedData.formData;
  } catch (error) {
    console.error('Error loading onboarding progress:', error);
    return null;
  }
};

// Clear form data from localStorage
export const clearOnboardingProgress = (userId) => {
  try {
    localStorage.removeItem(`onboarding_${userId}`);
    return true;
  } catch (error) {
    console.error('Error clearing onboarding progress:', error);
    return false;
  }
};

// Check if onboarding progress exists for a user
export const hasOnboardingProgress = (userId) => {
  try {
    const savedData = localStorage.getItem(`onboarding_${userId}`);
    return savedData !== null;
  } catch (error) {
    console.error('Error checking onboarding progress:', error);
    return false;
  }
}; 