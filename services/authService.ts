// Authentication service that communicates with our backend API

// Check if email already exists in the database
export const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      action: 'checkEmail'
    })
  });

  const data = await response.json();
  return data.exists;
};

// Sign up with email and password
export const signUpWithEmailAndPassword = async (
  email: string, 
  password: string, 
  username: string
): Promise<any> => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      username,
      action: 'signup'
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create account');
  }

  return data;
};

// Sign in with email and password
export const signInWithEmailAndPasswordCustom = async (
  email: string, 
  password: string
): Promise<any> => {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      action: 'signin'
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Invalid email or password');
  }

  return data;
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  // In a real implementation, this would make an API call to invalidate the session
};