/**
 * Sanitize string input to prevent injection attacks
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potential SQL injection patterns
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .trim()
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize search query
 */
export const sanitizeSearch = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Allow alphanumeric, spaces, and basic punctuation
  return input
    .replace(/[^a-zA-Z0-9\s\-_,.()]/g, '')
    .trim()
    .substring(0, 100);
};

/**
 * Sanitize email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email
    .toLowerCase()
    .trim()
    .substring(0, 255);
};

