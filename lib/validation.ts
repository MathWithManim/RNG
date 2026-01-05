// Password validation utility functions

/**
 * Validates password strength requirements
 * @param password The password to validate
 * @returns Object with validation result and error message if invalid
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  // Check minimum length
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long'
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter'
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter'
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number'
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character'
    };
  }

  return {
    isValid: true
  };
};

/**
 * Validates email format
 * @param email The email to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  return {
    isValid: true
  };
};

/**
 * Validates username requirements
 * @param username The username to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (username.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long'
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      error: 'Username must be less than 30 characters long'
    };
  }

  // Check for valid characters (alphanumeric and underscores/hyphens)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens'
    };
  }

  return {
    isValid: true
  };
};